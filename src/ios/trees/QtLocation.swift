import Foundation
import CoreLocation

struct QtLocation
{
    var latitude: QtCoordinate
    var longitude: QtCoordinate
}

extension QtLocation
{
    init(json: JsonObject) 
    {
        let latitude = json["latitude"] as! QtCoordinate
        let longitude = json["longitude"] as! QtCoordinate
        self.init(latitude: latitude, longitude: longitude)
    }
}

////////////////////////////////////////
// CLLocationCoordinate2D conversions

extension QtLocation
{
    init(_ location: CLLocationCoordinate2D) 
    {
        self.init(latitude: location.latitude, longitude: location.longitude)
    }
}

extension CLLocationCoordinate2D
{
    init(_ location: QtLocation)
    {
        self.init(latitude: location.latitude, longitude: location.longitude)
    }
}

