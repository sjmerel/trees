package com.crickettechnology.trees;

import com.google.android.gms.maps.*;
import com.google.android.gms.maps.model.*;
import com.google.common.io.*;
import android.content.*;
import android.location.*;
import java.util.*;
import org.json.*;
import java.io.*;

class Dataset
{
    public final String code;
    public final String name;
    public final String administrativeArea;
    public final String country;
    public final QtLocation location;

    public void load(GoogleMap map, Context context)
    {
        if (Dataset.current != null)
        {
            Dataset.current.unload();
        }

        // load species
        HashMap<Integer, Species> speciesMap = new HashMap<>();
        JSONArray speciesArray = readJsonArray(this.code + "/species.json", context);
        for (int i = 0; i < speciesArray.length(); ++i)
        {
            JSONObject json = speciesArray.optJSONObject(i);
            int id = json.optInt("id");
            Species species = new Species(json);
            speciesMap.put(id, species);
        }

        try 
        {
            LittleEndianDataInputStream stream = new LittleEndianDataInputStream(new BufferedInputStream(context.getAssets().open(this.code + "/site.bin") ));

            double minLatitude = stream.readDouble();
            double maxLatitude = stream.readDouble();
            double minLongitude = stream.readDouble();
            double maxLongitude = stream.readDouble();

            // create sites
            this.sites = new ArrayList<>();
            while (stream.available() > 0)
            {
                int id = stream.readUnsignedShort();
                float latitudeDelta = stream.readFloat();
                float longitudeDelta = stream.readFloat();

                Species species = speciesMap.get(id);
                QtLocation location = new QtLocation(minLatitude + latitudeDelta, minLongitude + longitudeDelta);
                Site site = new Site(location, species);
                this.sites.add(site);
            }

            // build quadtree
            QtRect bounds = new QtRect(new QtSpan(minLatitude, maxLatitude), new QtSpan(minLongitude, maxLongitude));
            this.rootNode = new QtNode<Site>(bounds);
            for (Site site: this.sites)
            {
                this.rootNode.add(site);
            }

            // calculate scale factors for latitude and longitude degrees/meter
            double earthCircum = 40075000.0; // meters (at equator; 40008000 through poles, but close enough)
            this.degPerMeterLongitude = 360.0/earthCircum;
            double meanLatitude = (minLatitude + maxLatitude) * 0.5;
            this.degPerMeterLatitude = this.degPerMeterLongitude * Math.cos(meanLatitude * Math.PI / 180.0);

            this.marker.setVisible(false);

            Dataset.current = this;
        }
        catch (Exception ex) 
        {
            System.out.println(ex);
            assert(false);
        }
    }

    public List<Site> findContainedSites(QtRect rect)
    {
        return this.rootNode.findContained(rect);
    }

    public Site findNearestSite(QtLocation location, double radiusMeters)
    {
        // scale lat/long to meters
        double latitudeRadius = radiusMeters * this.degPerMeterLatitude;
        double longitudeRadius = radiusMeters * this.degPerMeterLongitude;
        QtRect searchRect = new QtRect(new QtSpan(location.latitude - latitudeRadius, location.latitude + latitudeRadius),
                                       new QtSpan(location.longitude - longitudeRadius, location.longitude + longitudeRadius));

        List<Site> sites = this.rootNode.findContained(searchRect);
        double r2 = radiusMeters*radiusMeters;
        Site nearest = null;
        double d2Min = r2;
        for (Site site: sites)
        {
            double dx = (site.location.latitude - location.latitude) / this.degPerMeterLatitude;
            double dy = (site.location.longitude - location.longitude) / this.degPerMeterLongitude;
            double d2 = dx*dx + dy*dy;
            if (d2 < r2)
            {
                // within search radius
                if (d2 < d2Min)
                {
                    nearest = site;
                    d2Min = d2;
                }
            }
        }

        return nearest;
    }

    public double getDegPerMeterLongitude() { return this.degPerMeterLongitude; }
    public double getDegPerMeterLatitude() { return this.degPerMeterLatitude; }


    public static Dataset getCurrent() { return Dataset.current; }

    public static void startup(Context context, GoogleMap map)
    {
        assert(Dataset.all == null);
        JSONArray datasetsJson = readJsonArray("datasets.json", context);
        ArrayList<Dataset> datasets = new ArrayList<>();
        for (int i = 0; i < datasetsJson.length(); ++i)
        {
            JSONObject json = datasetsJson.optJSONObject(i);
            datasets.add(new Dataset(json, map));
        }
        Dataset.all = datasets;
    }

    public static Dataset find(Address address)
    {
        for (Dataset dataset: Dataset.all)
        {
            if (dataset.name.equals(address.getLocality()) &&
                dataset.administrativeArea.equals(address.getAdminArea()) &&
                dataset.country.equals(address.getCountryName()))
            {
                return dataset;
            }
        }
        return null;
    }

    ////////////////////////////////////////

    private List<Site> sites;
    private QtNode<Site> rootNode;
    private Marker marker;

    private double degPerMeterLongitude;
    private double degPerMeterLatitude;

    private static Dataset current = null;
    private static List<Dataset> all = null;

    private Dataset(JSONObject json, GoogleMap map)
    {
        this.code = json.optString("code");
        this.name = json.optString("name");
        this.administrativeArea = json.optString("administrativeArea");
        this.country = json.optString("country");

        JSONObject locationJson = json.optJSONObject("location");
        this.location = new QtLocation(locationJson);

        this.marker = map.addMarker(new MarkerOptions()
                .position(this.location.toLatLng())
                .title(this.name));
        this.marker.setTag(this);
    }

    private static JSONArray readJsonArray(int id, Context context)
    {
        InputStream stream = context.getResources().openRawResource(id);
        try
        {
            byte[] buf = new byte[stream.available()];
            stream.read(buf);
            stream.close();
            String json = new String(buf, "UTF-8");
            return new JSONArray(json);
        }
        catch (Exception e)
        {
            System.out.println(e);
            return null;
        }
    }

    private static JSONArray readJsonArray(String path, Context context)
    {
        try
        {
            InputStream stream = context.getAssets().open(path);
            byte[] buf = new byte[stream.available()];
            stream.read(buf);
            stream.close();
            String json = new String(buf, "UTF-8");
            return new JSONArray(json);
        }
        catch (Exception e)
        {
            System.out.println(e);
            return null;
        }
    }

    private void unload()
    {
        this.sites = new ArrayList<Site>();
        this.rootNode = null;
        this.marker.setVisible(true);
    }


}

