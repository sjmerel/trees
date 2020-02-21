package com.crickettechnology.trees;

import org.json.*;

class Site implements QtElement
{
    public Site(JSONObject json, Species species)
    {
        double latitude = json.optDouble("latitude");
        double longitude = json.optDouble("longitude");
        this.location = new QtLocation(latitude, longitude);
        this.species = species;
    }

    public Site(QtLocation location, Species species)
    {
        this.location = location;
        this.species = species;
    }

    public final QtLocation location;
    public final Species species;

    ////////////////////////////////////////
    // QtElement

    public QtLocation getLocation() { return this.location; }

}
