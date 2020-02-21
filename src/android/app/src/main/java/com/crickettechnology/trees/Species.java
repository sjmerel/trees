package com.crickettechnology.trees;

import org.json.*;
import android.graphics.*;

class Species 
{
    public Species(JSONObject json)
    {
        this.botanicalName = json.optString("name_botanical");
        this.botanicalFamilyName = json.optJSONObject("hierarchy").optString("family");
        JSONArray commonNames = json.optJSONArray("name_common");
        this.commonName = commonNames.length() > 0 ? commonNames.optString(0) : ""; // XXX TODO show all
        this.wikipediaTitle = json.optString("wp_link");

        JSONArray colorArray= json.optJSONArray("color");
        int r = (int) (colorArray.optDouble(0) * 255);
        int g = (int) (colorArray.optDouble(1) * 255);
        int b = (int) (colorArray.optDouble(2) * 255);
        this.markerColor = Color.rgb(r, g, b);
    }

    public final String botanicalName;
    public final String botanicalFamilyName;
    public final String commonName;
    public final String wikipediaTitle;
    public final int markerColor;
}




