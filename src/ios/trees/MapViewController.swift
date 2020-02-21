import UIKit
import GoogleMaps
import CoreLocation

class MapViewController: UIViewController, GMSMapViewDelegate
{
    ////////////////////////////////////////

    override func viewDidLoad() 
    {
        super.viewDidLoad()

        self.updateCurrentDataset()

        // set up map
        self.mapView.camera = GMSCameraPosition.camera(withLatitude: 34.028, longitude: -118.492, zoom: 13.3)
        self.mapView.delegate = self
        self.mapView.isBuildingsEnabled = false
        self.mapView.isIndoorEnabled = false
        self.mapView.isMyLocationEnabled = true

        let settings = self.mapView.settings
        settings.compassButton = false
        settings.myLocationButton = false
        settings.tiltGestures = false
        settings.zoomGestures = true

        self.trackMode = .location

        // custom map style
        do 
        {
            let styleUrl = Bundle.main.url(forResource: "map_style", withExtension: "json")!
            self.mapView.mapStyle = try GMSMapStyle(contentsOfFileURL: styleUrl)
        } 
        catch {}



        // load data
        Dataset.startup(mapView: self.mapView)

        self.infoView.alpha = 0
        self.debugView.isHidden = true

        self.tileLayer.map = self.mapView

        let marker = GMSCircle()
        marker.radius = 2
        marker.fillColor = UIColor.clear
        marker.strokeColor = UIColor.yellow
        marker.strokeWidth = 8
        self.selectedSiteMarker = marker

        self.infoView.closePressed = 
        {
            self.selectedSite = nil
        }

        Dataset.didLoad.add(tag: self)
        {
            dataset in
            self.selectedSite = nil
            self.updateCurrentDataset()
        }

        LocationService.instance.headingChanged.add(tag: self)
        {
            heading in
            if (self.trackMode != .off)
            {
                self.updateCamera()
            }
        }

        LocationService.instance.locationChanged.add(tag: self)
        {
            location in
            if (self.trackMode != .off)
            {
                self.updateCamera()
                self.updateSelectedSite()
            }
        }

        // TODO move to Dataset?
        LocationService.instance.geocodeDatasetChanged.add(tag: self)
        {
            dataset in
            if (Dataset.current == nil && dataset != nil)
            {
                dataset!.load()
                self.tileLayer.clearTileCache()
            }
        }
    }

    ////////////////////////////////////////

    @IBOutlet weak var mapView: GMSMapView!
    @IBOutlet weak var trackControl: TrackControl!

    @IBOutlet weak var headerView: UIView!
    @IBOutlet weak var headerLabel: UILabel!

    @IBOutlet weak var infoView: TreeInfoView!

    @IBOutlet weak var debugView: UIView!
    @IBOutlet weak var debugLabel: UILabel!
    @IBOutlet weak var debugSlider: UISlider!

    @IBAction func debugSliderChanged()
    {
        self.debugLatOffset = 0.001 * QtCoordinate(self.debugSlider.value)
        updateSelectedSite()
    }


    /*
    @IBAction func infoControlPressed()
    {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "info")
        self.navigationController!.pushViewController(vc, animated:false)
        self.navigationController!.setFadeTransition()
    }
    */

    @IBAction func trackControlPressed()
    {
        if (self.trackMode == .off)
        {
            // enabling location; do a geocode lookup
            LocationService.instance.lookupGeocode()
        }

        let newOrdinal = (self.trackMode.rawValue + 1) % 3
        self.trackMode = TrackMode(rawValue: newOrdinal)!
    }


    ////////////////////////////////////////

    private let k_searchRadiusMeters: QtCoordinate = 15
    private var zoom: Float = 19.0
    private var gesture = false
    private let tileLayer = SiteTileLayer()
    private var selectedSiteMarker: GMSCircle!
    private var debugLatOffset: QtCoordinate = 0
    private var initialDataset = true

    private var trackMode: TrackMode = .location
    { 
        didSet
        {
            self.trackControl.trackMode = self.trackMode
            if (self.trackMode != .off)
            {
                updateCamera()
            }
        }
    }

    private var nearestSite: Site? = nil

    private var selectedSite: Site? = nil
    {
        didSet
        {
            if (self.selectedSite !== oldValue)
            {
                var alpha: CGFloat
                if let site = self.selectedSite
                {
                    alpha = 1.0

                    self.infoView.species = site.species

                    self.selectedSiteMarker.position = CLLocationCoordinate2D(site.location)
                    self.selectedSiteMarker.map = self.mapView
                }
                else
                {
                    alpha = 0.0
                    self.selectedSiteMarker.map = nil
                }

                UIView.animate(withDuration: 0.25, delay: 0, options: [], animations: 
                {
                    self.infoView.alpha = alpha
                }, completion:nil)
            }
        }
    }

    private func updateSelectedSite()
    {
        if let dataset = Dataset.current
        {
            let prevNearestSite = self.nearestSite
            if let location = LocationService.instance.location
            {
                var newLoc = location.coordinate
                newLoc.latitude += self.debugLatOffset

                // find nearest site
                self.nearestSite = dataset.findNearestSite(location:QtLocation(newLoc), radiusMeters: k_searchRadiusMeters)
            }
            else
            {
                self.nearestSite = nil
            }

            // if nearest site changed, update selection
            if (self.nearestSite !== prevNearestSite)
            {
                self.selectedSite = self.nearestSite
            }
        }
        else
        {
            self.nearestSite = nil
            self.selectedSite = nil
        }
    }

    // update camera to current location
    private func updateCamera()
    {
        var camera: GMSCameraPosition
        if let location = LocationService.instance.location
        {
            var orientation = 0.0
            if self.trackMode == .locationOrientation 
            { 
                if let heading = LocationService.instance.heading
                {
                    orientation = heading.trueHeading
                }
            }

            camera = GMSCameraPosition.camera(withLatitude: location.coordinate.latitude, longitude: location.coordinate.longitude, zoom: self.zoom, bearing: orientation, viewingAngle: self.mapView.camera.viewingAngle)
            self.mapView.animate(to: camera)
        }
    }

    private func updateCurrentDataset()
    {
        if let dataset = Dataset.current
        {
            self.headerLabel.text = "Tree data: \(dataset.name), \(dataset.administrativeArea)"

            // if the camera isn't in the dataset bounds, move the camera
            let visibleRegion = self.mapView.projection.visibleRegion()
            let visibleRect = QtRect(location: QtLocation(visibleRegion.nearLeft), location: QtLocation(visibleRegion.farRight))
            if (!self.initialDataset && !visibleRect.intersects(rect: dataset.bounds))
            {
                let cameraUpdate = GMSCameraUpdate.fit(GMSCoordinateBounds(dataset.bounds))
                self.mapView.moveCamera(cameraUpdate)
                self.trackMode = .off
            }
            self.initialDataset = false
        }
        else
        {
            self.headerLabel.text = "No tree data loaded"
        }
        self.tileLayer.clearTileCache()
    }


    ////////////////////////////////////////
    // GMSMapViewDelegate
    
    func mapView(_ mapView: GMSMapView, willMove gesture: Bool) 
    {
        if (gesture)
        {
            //print(mapView.camera)
            self.gesture = true
            self.trackMode = .off
        }
    }

    func mapView(_ mapView: GMSMapView, idleAt position: GMSCameraPosition) 
    {
        if (self.gesture)
        {
            self.zoom = mapView.camera.zoom
        }
        self.gesture = false
        // updateSelectedSite()
    }

    func mapView(_ mapView: GMSMapView, didTap marker: GMSMarker) -> Bool
    {
        let dataset = marker.userData as! Dataset
        dataset.load()
        self.tileLayer.clearTileCache()
        return true
    }
    
    func mapView(_ mapView: GMSMapView, didTapAt coordinate: CLLocationCoordinate2D) 
    {
        if let dataset = Dataset.current
        {
            let location = QtLocation(coordinate)
            let tapRadiusPixels = 20
            let visibleRegion = self.mapView.projection.visibleRegion()
            let minLongitude = min(visibleRegion.nearLeft.longitude, visibleRegion.nearRight.longitude, visibleRegion.farLeft.longitude, visibleRegion.farRight.longitude)
            let maxLongitude = max(visibleRegion.nearLeft.longitude, visibleRegion.nearRight.longitude, visibleRegion.farLeft.longitude, visibleRegion.farRight.longitude)
            let dLng = maxLongitude - minLongitude
            let viewWidth = self.mapView.bounds.size.width
            let tapRadiusMeters = Double(tapRadiusPixels) / Double(viewWidth) * dLng / QtDistanceScale(location:location).degPerMeterLongitude
            self.selectedSite = dataset.findNearestSite(location: location, radiusMeters: tapRadiusMeters)
        }
    }
}

