import Foundation

struct QtDistanceScale
{
    init(location: QtLocation)
    {
        let earthCircum = 40075000.0 // meters (at equator; 40008000 through poles, but close enough)
        self.degPerMeterLongitude = 360.0/earthCircum
        self.degPerMeterLatitude = self.degPerMeterLongitude * cos(location.latitude * .pi / 180.0)
    }

    let degPerMeterLongitude: QtCoordinate
    let degPerMeterLatitude: QtCoordinate

    func degLatitudeToMeters(_ deg: QtCoordinate) -> Double
    {
        return deg / self.degPerMeterLatitude
    }

    func degLongitudeToMeters(_ deg: QtCoordinate) -> Double
    {
        return deg / self.degPerMeterLongitude
    }

    func metersLatitudeToDeg(_ meters: Double) -> QtCoordinate
    {
        return meters * self.degPerMeterLatitude
    }

    func metersLongitudeToDeg(_ meters: Double) -> QtCoordinate
    {
        return meters * self.degPerMeterLongitude
    }


    func distanceSquared(_ location0: QtLocation, _ location1: QtLocation) -> Double
    {
        let dx = degLatitudeToMeters(location0.latitude - location1.latitude)
        let dy = degLongitudeToMeters(location0.longitude - location1.longitude)
        return dx*dx + dy*dy
    }

    func distance(_ location0: QtLocation, _ location1: QtLocation) -> Double
    {
        return sqrt(distanceSquared(location0, location1))
    }
}
