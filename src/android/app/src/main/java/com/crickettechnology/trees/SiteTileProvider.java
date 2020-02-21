package com.crickettechnology.trees;

import com.google.android.gms.maps.model.*;
import android.graphics.*;
import java.util.*;
import java.io.*;

class SiteTileProvider implements TileProvider
{
    @Override
    public Tile getTile (int x, int y, int zoom)
    {
        Dataset dataset = Dataset.getCurrent();
        if (dataset == null)
        {
            return TileProvider.NO_TILE;
        }

        final int lowZoom = 17; // lower than this, draw larger and without border

        double treeRadiusMeters = 2.0;
        if (zoom <= lowZoom)
        {
            treeRadiusMeters += (lowZoom - zoom + 1)*2.0;
        }

        // get lat/lng rect of tile
        int n = 1 << zoom; // nxn grid
        double d = 1.0/n;
        QtLocation minLocation = unproject(x*d, (y+1)*d);
        QtLocation maxLocation = unproject((x+1)*d, y*d);
        QtRect rect = new QtRect(new QtSpan(minLocation.latitude, maxLocation.latitude),
                                 new QtSpan(minLocation.longitude, maxLocation.longitude));

        // expand the search rect by the tree radius to include tree markers that cross the border into the tile
        double borderLat = treeRadiusMeters * dataset.getDegPerMeterLatitude();
        double borderLng = treeRadiusMeters * dataset.getDegPerMeterLongitude();
        rect.latitude.min -= borderLat;
        rect.latitude.max += borderLat;
        rect.longitude.min -= borderLng;
        rect.longitude.max += borderLng;

        List<Site> sites = dataset.findContainedSites(rect);
        if (sites.isEmpty())
        {
            return TileProvider.NO_TILE;
        }
        else
        {
            Bitmap bitmap = Bitmap.createBitmap(TILE_SIZE, TILE_SIZE, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);

            Paint fillPaint = new Paint();
            fillPaint.setStyle(Paint.Style.FILL);
            fillPaint.setAntiAlias(true);

            Paint strokePaint = new Paint();
            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setAntiAlias(true);
            strokePaint.setColor(Color.WHITE);
            strokePaint.setStrokeWidth(1);

            double dLng = maxLocation.longitude - minLocation.longitude;
            double dLat = maxLocation.latitude - minLocation.latitude;

            double ppm = TILE_SIZE / dLng * dataset.getDegPerMeterLongitude();
            double r = treeRadiusMeters * ppm;

            for (Site site: sites)
            {
                double fx = (site.location.longitude - minLocation.longitude)/dLng;
                double fy = 1.0 - (site.location.latitude - minLocation.latitude)/dLat;
                double px = fx * TILE_SIZE;
                double py = fy * TILE_SIZE;
                fillPaint.setColor(site.species.markerColor);
                canvas.drawCircle((float)px, (float)py, (float)r, fillPaint);
                if (zoom > lowZoom)
                {
                    canvas.drawCircle((float)px, (float)py, (float)r, strokePaint);
                }
            }

            /*
            // tile border (for debugging)
            context.beginPath()
            UIColor.red.setStroke()
            context.addRect(CGRect(origin: CGPoint.zero, size: tileSize))
            context.drawPath(using: .stroke)
            */

            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);
            return new Tile(TILE_SIZE, TILE_SIZE, stream.toByteArray());
        }
    }

    ////////////////////////////////////////

    /*
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
    */

    private QtLocation unproject(double x, double y)
    {
        double longitude = (x - 0.5) * 360.0;

        double a = Math.exp((0.5 - y)*(4.0 * Math.PI));
        double latitude = Math.asin((a-1.0)/(a+1.0)) * 180.0 / Math.PI;

        return new QtLocation(latitude, longitude);
    }

    private final int TILE_SIZE = 512;
}
