import CoreLocation
import GoogleMaps

class LocationService: NSObject, CLLocationManagerDelegate
{
    public static let instance = LocationService()

    public var location: CLLocation?
    {
        get { return self.locationMgr.location }
    }

    public var heading: CLHeading?
    {
        get { return self.locationMgr.heading }
    }

    public let locationChanged = HandlerList<CLLocation>()
    public let headingChanged = HandlerList<CLHeading>()

    public func lookupGeocode()
    {
        if let coordinate = self.location?.coordinate
        {
            let location = QtLocation(coordinate)
            self.geocodeLocation = location
            let geocoder = GMSGeocoder()
            geocoder.reverseGeocodeCoordinate(coordinate)
            {
                response, error in
                let result = response?.firstResult()

                if let locality = result?.locality
                {
                    print("geocode result: \(locality)")
                }
                else
                {
                    print("geocode result: nil")
                }

                let geocodeDataset: Dataset? = result == nil ? nil : Dataset.find(address:result!)
                if (geocodeDataset !== self.geocodeDataset)
                {
                    self.geocodeDataset = geocodeDataset
                    self.geocodeDatasetChanged.call(value: geocodeDataset)
                }
            }
        }
    }

    public let geocodeDatasetChanged = HandlerList<Dataset?>()

    public private(set) var geocodeLocation: QtLocation? = nil // last geocoded location
    public private(set) var geocodeDataset: Dataset? = nil // dataset corresponding to last geocoded location, or null

    ////////////////////////////////////////

    private var locationMgr = CLLocationManager()

    private override init()
    {
        super.init()

        self.locationMgr.delegate = self
        if (CLLocationManager.authorizationStatus()  == .notDetermined)
        {
            self.locationMgr.requestWhenInUseAuthorization()
        }
        checkLocationAuthorization()
        initLocation()
    }

    private func checkLocationAuthorization()
    {
        let status = CLLocationManager.authorizationStatus()
        if (status == .authorizedAlways || status == .authorizedWhenInUse)
        {
            initLocation()
        }
    }

    private func initLocation()
    {
        //self.locationMgr.desiredAccuracy = kCLLocationAccuracyNearestTenMeters // TODO?
        self.locationMgr.desiredAccuracy = kCLLocationAccuracyBest
        // self.locationMgr.distanceFilter = 10.0
        self.locationMgr.startUpdatingLocation()
        self.locationMgr.startUpdatingHeading()
    }


    ////////////////////////////////////////
    // CLLocationManagerDelegate

    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus)
    {
        checkLocationAuthorization()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation])
    {
        let clLocation = locations.last!
        self.locationChanged.call(value: clLocation)

        let coordinate = clLocation.coordinate
        let location = QtLocation(coordinate)
        let distanceScale = QtDistanceScale(location:location)

        if self.geocodeLocation == nil || distanceScale.distance(location, self.geocodeLocation!) > 250
        {
            lookupGeocode()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading)
    {
        self.headingChanged.call(value: newHeading)
    }

}
