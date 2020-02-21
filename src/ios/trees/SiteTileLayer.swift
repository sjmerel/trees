import GoogleMaps

class SiteTileLayer: GMSSyncTileLayer 
{
    override init()
    {
        super.init()
        self.tileSize = TILE_SIZE
        self.fadeIn = true
    }

    override func tileFor(x: UInt, y: UInt, zoom: UInt) -> UIImage? 
    {
        Dataset.sema.wait()
        defer { Dataset.sema.signal() } 
        return self.tileForImpl(x:x, y:y, zoom:zoom)
    }

    private func tileForImpl(x: UInt, y: UInt, zoom: UInt) -> UIImage? 
    {
        if Dataset.current == nil
        {
            return kGMSTileLayerNoTile
        }

        let dataset = Dataset.current!

        let lowZoom: UInt = 17 // lower than this, draw larger and without border

        var treeRadiusMeters = 2.0
        if (zoom <= lowZoom)
        {
            treeRadiusMeters += Double(lowZoom-zoom+1)*2.0
        }

        // get lat/lng rect of tile
        let n = 1 << zoom // nxn grid
        let d = 1.0/Double(n)
        let minLocation = unproject(x: Double(x)*d, y: Double(y+1)*d)
        let maxLocation = unproject(x: Double(x+1)*d, y: Double(y)*d)
        var rect = QtRect(latitude: QtSpan(min:minLocation.latitude, max: maxLocation.latitude),
                          longitude: QtSpan(min:minLocation.longitude, max: maxLocation.longitude))

        // expand the search rect by the tree radius to include tree markers that cross the border into the tile
        let distanceScale = QtDistanceScale(location:dataset.location)
        let borderLat = distanceScale.metersLatitudeToDeg(treeRadiusMeters)
        let borderLng = distanceScale.metersLongitudeToDeg(treeRadiusMeters)
        rect.latitude.min -= borderLat
        rect.latitude.max += borderLat
        rect.longitude.min -= borderLng
        rect.longitude.max += borderLng

        let sites = dataset.findContainedSites(rect:rect)
        if (sites.isEmpty)
        {
            return kGMSTileLayerNoTile
        }
        else
        {
            let tileSize = CGSize(width:TILE_SIZE, height:TILE_SIZE)
            UIGraphicsBeginImageContext(tileSize)
            defer { UIGraphicsEndImageContext() }
            let context = UIGraphicsGetCurrentContext()!

            let dLng = maxLocation.longitude - minLocation.longitude
            let dLat = maxLocation.latitude - minLocation.latitude

            let ppm = Double(TILE_SIZE) / dLng * distanceScale.degPerMeterLongitude
            let r = treeRadiusMeters * ppm 
            //print("\(zoom) \(r)")

            UIColor.white.setStroke()
            context.setLineWidth(1)

            for site in sites
            {
                let fx = (site.location.longitude - minLocation.longitude)/dLng
                let fy = 1.0 - (site.location.latitude - minLocation.latitude)/dLat
                let px = fx * Double(self.TILE_SIZE)
                let py = fy * Double(self.TILE_SIZE)
                let treeRect = CGRect(x: px-r, y: py-r, width: 2.0*r, height: 2.0*r)
                site.species.markerColor.setFill()
                context.fillEllipse(in: treeRect)
                if (zoom > lowZoom)
                {
                    context.strokeEllipse(in: treeRect)
                }
            }

            /*
            // tile border (for debugging)
            context.beginPath()
            UIColor.red.setStroke()
            context.addRect(CGRect(origin: CGPoint.zero, size: tileSize))
            context.drawPath(using: .stroke)
            */

            return UIGraphicsGetImageFromCurrentImageContext()
        }
    }

    private func project(location: CLLocationCoordinate2D) -> (Double, Double)
    {
        var s = sin(location.latitude * .pi / 180)

        // Truncating to 0.9999 effectively limits latitude to 89.189. This is
        // about a third of a tile past the edge of the world tile.
        s = min(max(s, -0.9999), 0.9999)

        let x = 0.5 + location.longitude / 360
        let y = 0.5 - log((1+s)/(1-s)) / (4 * .pi)
        return (x, y)
    }

    private func unproject(x: Double, y: Double) -> QtLocation
    {
        let longitude = (x - 0.5) * 360.0

        let a = exp((0.5 - y)*(4.0 * .pi))
        let latitude = asin((a-1.0)/(a+1.0)) * 180.0 / .pi

        return QtLocation(latitude: latitude, longitude: longitude)
    }

    private let TILE_SIZE = 512
}
