package com.crickettechnology.trees;

import com.google.android.gms.maps.model.*;
import android.location.*;
import org.json.*;

class QtLocation
{
    public QtLocation(double latitude, double longitude)
    {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public QtLocation(Location location)
    {
        this.latitude = location.getLatitude();
        this.longitude = location.getLongitude();
    }

    public QtLocation(JSONObject json)
    {
        this.latitude = json.optDouble("latitude");
        this.longitude = json.optDouble("longitude");
    }

    public double latitude;
    public double longitude;

    public double distanceSquared(QtLocation location)
    {
        double dlat = this.latitude - location.latitude;
        double dlon = this.longitude - location.longitude;
        return dlat*dlat + dlon*dlon;
    }

    public double distance(QtLocation location)
    {
        return Math.sqrt(distanceSquared(location));
    }

    public LatLng toLatLng()
    {
        return new LatLng(this.latitude, this.longitude);
    }
}

