import Foundation
import GoogleMaps

class Dataset
{
    public let code: String
    public let name: String
    public let administrativeArea: String
    public let country: String
    public let location: QtLocation
    public var bounds: QtRect! = nil
    public let numberOfSites: Int

    public private(set) var speciesArray = [Species]()

    // grouped by family
    public private(set) var familyArray = [[Species]]()

    public func load()
    {
        if (Dataset.current === self) { return }

        Dataset.willLoad.call(value: self)

        DispatchQueue.global(qos: .background).async 
        {
            Dataset.sema.wait()

            let prev = Dataset.current
            Dataset.current = nil
            prev?.unload()

            self.loadImpl()

            Dataset.current = self

            Dataset.sema.signal()

            DispatchQueue.main.async
            {
                // markers must be modified on main thread
                self.marker.opacity = 0
                prev?.marker.opacity = 1
                Dataset.didLoad.call(value: self)
            }
        }
    }

    private func loadImpl()
    {
        let profiler = Profiler(name: "load")

        // load species
        let speciesArray = JsonArray.load(filename: "\(self.code)/species.json") as! [JsonObject]
        profiler.markEnd("load species.json")
        var speciesMap = [Int: Species]()
        self.speciesArray.removeAll()
        for speciesJson in speciesArray
        {
            let id = speciesJson["id"] as! Int
            let species = Species(json: speciesJson)
            speciesMap[id] = species
            self.speciesArray.append(species)
        }
        profiler.markEnd("build species map")

        var curFamily: String? = nil
        var curArray = [Species]()
        for species in self.speciesArray
        {
            let family = species.hierarchy.first(where: {$0.rank == .family})!.name
            if curFamily != nil && curFamily! != family
            {
                self.familyArray.append(curArray)
                curArray = [species]
            }
            else
            {
                curArray.append(species)
            }
            curFamily = family
        }
        self.familyArray.append(curArray)

        // create sites
        var offset = 0
        let url = Bundle.main.url(forResource: "site", withExtension: "bin", subdirectory: code)!
        let siteData = try! Data(contentsOf:url)

        let minLatitude: Double = read(data: siteData, offset: &offset)
        let maxLatitude: Double = read(data: siteData, offset: &offset)
        let minLongitude: Double = read(data: siteData, offset: &offset)
        let maxLongitude: Double = read(data: siteData, offset: &offset)

        profiler.markEnd("load site json")
        while offset < siteData.count
        {
            let id: Int16 = read(data:siteData, offset: &offset)
            let latitudeDelta: Float = read(data: siteData, offset: &offset)
            let longitudeDelta: Float = read(data: siteData, offset: &offset)

            let species = speciesMap[Int(id)]!
            let location = QtLocation(latitude:minLatitude + Double(latitudeDelta), longitude:minLongitude + Double(longitudeDelta))
            let site = Site(location:location, species:species)
            self.sites.append(site)
        }
        profiler.markEnd("build site map")

        // build quadtree
        self.bounds = QtRect(latitude: QtSpan(min: minLatitude, max: maxLatitude), 
                            longitude: QtSpan(min: minLongitude, max: maxLongitude))
        self.rootNode = QtNode<Site>(rect: self.bounds)
        for site in self.sites
        {
            self.rootNode.add(site)
        }
        profiler.markEnd("build quadtree")

        /*
        // calculate scale factors for latitude and longitude degrees/meter
        let earthCircum = 40075000.0 // meters (at equator; 40008000 through poles, but close enough)
        self.degPerMeterLongitude = 360.0/earthCircum
        let meanLatitude = (minLatitude + maxLatitude) * 0.5
        self.degPerMeterLatitude = self.degPerMeterLongitude * cos(meanLatitude * .pi / 180.0)
        */
    }

    public func findContainedSites(rect: QtRect) -> [Site]
    {
        return self.rootNode.findContained(rect: rect)
    }

    public func findNearestSite(location: QtLocation, radiusMeters: QtCoordinate) -> Site?
    {
        // scale lat/long to meters
        let distanceScale = QtDistanceScale(location:location)
        let latitudeRadius = radiusMeters * distanceScale.degPerMeterLatitude
        let longitudeRadius = radiusMeters * distanceScale.degPerMeterLongitude
        let searchRect = QtRect(latitude: QtSpan(min: location.latitude - latitudeRadius, max: location.latitude + latitudeRadius),
                                longitude: QtSpan(min: location.longitude - longitudeRadius, max: location.longitude + longitudeRadius))

        let sites = self.rootNode.findContained(rect:searchRect)
        let r2 = radiusMeters*radiusMeters
        var nearest: Site? = nil
        var d2Min = r2
        for site in sites
        {
            let dx = (site.location.latitude - location.latitude) / distanceScale.degPerMeterLatitude
            let dy = (site.location.longitude - location.longitude) / distanceScale.degPerMeterLongitude
            let d2 = dx*dx + dy*dy
            if d2 < r2
            {
                // within search radius
                if d2 < d2Min
                {
                    nearest = site
                    d2Min = d2
                }
            }
        }

        return nearest
    }

    // for debugging quadtree
    public func findContainedRects(rect: QtRect) -> [QtRect]
    {
        return self.rootNode.findContainedRects(rect: rect)
    }

    // public private(set) var degPerMeterLongitude: QtCoordinate = 0
    // public private(set) var degPerMeterLatitude: QtCoordinate = 0


    public private(set) static var current: Dataset? = nil
    public private(set) static var all: [Dataset]! = nil

    public static var willLoad = HandlerList<Dataset>()
    public static var didLoad = HandlerList<Dataset>()

    // for synchronization with SiteTileLayer
    public static let sema = DispatchSemaphore(value: 1)

    public static func startup(mapView: GMSMapView)
    {
        assert(Dataset.all == nil)
        let datasetsJson = JsonArray.load(filename: "datasets.json") as! [JsonObject]
        var datasets = [Dataset]()
        for datasetJson in datasetsJson
        {
            datasets.append(Dataset(json: datasetJson, mapView: mapView))
        }
        datasets.sort(by: { lhs, rhs in lhs.name < rhs.name })
        Dataset.all = datasets
    }

    public static func find(address: GMSAddress) -> Dataset?
    {
        return Dataset.all.first( where:
            {
                $0.name == address.locality &&
                $0.administrativeArea == address.administrativeArea &&
                $0.country == address.country
            })
    }


    ////////////////////////////////////////

    private var sites = [Site]()
    private var rootNode: QtNode<Site>!
    private let marker: GMSMarker


    private init(json: JsonObject, mapView: GMSMapView)
    {
        self.code = json["code"] as! String
        self.name = json["name"] as! String
        self.administrativeArea = json["administrativeArea"] as! String
        self.country = json["country"] as! String
        self.numberOfSites = json["numberOfSites"] as! Int

        let locationJson = json["location"] as! JsonObject
        self.location = QtLocation(json: locationJson)

        self.marker = GMSMarker(position:CLLocationCoordinate2D(self.location))
        self.marker.title = self.name
        self.marker.userData = self
        self.marker.map = mapView
    }


    private func unload()
    {
        self.sites = [Site]()
        self.rootNode = nil
    }

    private func read<T>(data: Data, offset: inout Int) -> T
    {
        let size = MemoryLayout<T>.size
        let value: T = data[offset..<offset+size].withUnsafeBytes() { $0.pointee }
        offset += size
        return value
    }


}
