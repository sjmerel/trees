import Foundation
import GoogleMaps

struct QtRect
{
    init(latitude: QtSpan, longitude: QtSpan)
    {
        self.latitude = latitude
        self.longitude = longitude
    }

    init(location loc0: QtLocation, location loc1: QtLocation)
    {
        let latSpan = QtSpan(min: min(loc0.latitude, loc1.latitude), max:max(loc0.latitude, loc1.latitude))
        let lngSpan = QtSpan(min: min(loc0.longitude, loc1.longitude), max:max(loc0.longitude, loc1.longitude))
        self.init(latitude: latSpan, longitude: lngSpan)
    }

    var latitude: QtSpan
    var longitude: QtSpan

    static let invalid = QtRect(latitude: QtSpan.invalid, longitude: QtSpan.invalid)

    var area: QtCoordinate
    {
        get { return self.latitude.length * self.longitude.length }
    }

    func getCorner(_ i: Int,_ j: Int) -> QtLocation
    {
        return QtLocation(latitude: self.latitude.getEnd(i), longitude: self.longitude.getEnd(j))
    }

    func getQuarter(_ i: Int,_ j: Int) -> QtRect
    {
        return QtRect(latitude: self.latitude.getHalf(i), longitude: self.longitude.getHalf(j))
    }

    func inflated(ratio: QtCoordinate) -> QtRect
    {
        return QtRect(latitude:self.latitude.inflated(ratio:ratio),
                      longitude:self.longitude.inflated(ratio:ratio))
    }

    func contains(location: QtLocation) -> Bool
    {
        return self.latitude.contains(coord:location.latitude) &&
               self.longitude.contains(coord:location.longitude)
    }

    func contains(rect: QtRect) -> Bool
    {
        return self.latitude.contains(span:rect.latitude) &&
               self.longitude.contains(span:rect.longitude)
    }

    func intersects(rect: QtRect) -> Bool
    {
        return !(self.latitude.max <= rect.latitude.min ||
                 self.latitude.min >= rect.latitude.max ||
                 self.longitude.max <= rect.longitude.min ||
                 self.longitude.min >= rect.longitude.max)
    }
}


////////////////////////////////////////
// GMSCoordinateBounds conversions

extension QtRect
{
    init(_ rect: GMSCoordinateBounds) 
    {
        self.init(location: QtLocation(rect.northEast), location: QtLocation(rect.southWest))
    }
}

extension GMSCoordinateBounds
{
    convenience init(_ rect: QtRect)
    {
        let northeast = CLLocationCoordinate2D(rect.getCorner(1,0))
        let southwest = CLLocationCoordinate2D(rect.getCorner(0,1))
        self.init(coordinate: northeast, coordinate: southwest)
    }
}
