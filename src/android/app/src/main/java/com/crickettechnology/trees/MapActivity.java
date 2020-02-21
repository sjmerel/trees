package com.crickettechnology.trees;

import com.google.android.gms.maps.*;
import com.google.android.gms.maps.model.*;
import com.google.android.gms.location.*;
import android.*;
import android.net.*;
import android.location.*;
import android.content.pm.*;
import android.content.*;
import androidx.core.content.*;
import android.os.*;
import androidx.core.app.*;
import android.widget.*;
import android.view.*;
import android.view.animation.*;
import android.graphics.*;
import android.hardware.*;
import android.util.*;
import java.util.*;

import androidx.fragment.app.FragmentActivity;

public class MapActivity extends FragmentActivity implements
       OnMapReadyCallback,
       GoogleMap.OnCameraMoveStartedListener,
       GoogleMap.OnCameraIdleListener,
       GoogleMap.OnMapClickListener,
       GoogleMap.OnMarkerClickListener,
       SensorEventListener
{

    private GoogleMap map;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        setTheme(R.style.AppTheme);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        this.mapView = findViewById(R.id.map);
        this.trackButton = findViewById(R.id.trackButton);
        this.infoButton = findViewById(R.id.infoButton);
        this.infoView = findViewById(R.id.infoView);
        this.commonNameLabel = findViewById(R.id.commonNameLabel);
        this.botanicalNameLabel = findViewById(R.id.botanicalNameLabel);
        this.botanicalFamilyLabel = findViewById(R.id.botanicalFamilyLabel);
        this.wikipediaButton = findViewById(R.id.wikipediaButton);

        this.trackButton.setOnClickListener((view) -> trackControlPressed());
        this.infoButton.setOnClickListener((view) -> infoControlPressed());
        this.wikipediaButton.setOnClickListener((view) -> wikipediaButtonPressed());
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) 
    {
        if (permissions.length == 1 && grantResults[0] == PackageManager.PERMISSION_GRANTED)
        {
            initLocation();
        } 
    }


    @Override
    public void onMapReady(GoogleMap map)
    {
        this.map = map;

        Dataset.startup(this, map);

        // set up map
        double latitude = 34.028;
        double longitude = -118.492;
        float zoom = 13.3f;
        this.map.moveCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(latitude, longitude), zoom));

        this.map.setOnCameraIdleListener(this);
        this.map.setOnCameraMoveStartedListener(this);
        this.map.setOnMapClickListener(this);
        this.map.setOnMarkerClickListener(this);

        this.map.setBuildingsEnabled(false);
        this.map.setIndoorEnabled(false);

        UiSettings settings = this.map.getUiSettings();
        settings.setCompassEnabled(false);
        settings.setMyLocationButtonEnabled(false);
        settings.setTiltGesturesEnabled(false);
        settings.setZoomGesturesEnabled(true);

        setTrackMode(TrackMode.LOCATION);

        // custom map style
        MapStyleOptions style = MapStyleOptions.loadRawResourceStyle(this, R.raw.map_style);
        map.setMapStyle(style);

        // location
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) 
        {
            initLocation();
        } 
        else 
        {
            // need permissions; will call initLocation() if they are approved by the user.
            ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.ACCESS_FINE_LOCATION }, 0);
        }

        updateHeadingUpdates();

        this.infoView.setAlpha(0.0f);

        this.tileOverlay = map.addTileOverlay(new TileOverlayOptions().fadeIn(true).tileProvider(new SiteTileProvider()));

        CircleOptions circleOptions = new CircleOptions()
            .radius(2)
            .fillColor(Color.TRANSPARENT)
            .strokeColor(Color.YELLOW)
            .strokeWidth(8)
                .zIndex(1000)
            .center(new LatLng(0,0))
            .visible(false);
        this.selectedSiteMarker = this.map.addCircle(circleOptions);
    }

    @Override
    protected void onPause()
    {
        super.onPause();
        this.paused = true;
        updateHeadingUpdates();
        updateLocationUpdates();
    }

    @Override
    protected void onResume()
    {
        super.onResume();
        this.paused = false;
        updateHeadingUpdates();
        updateLocationUpdates();
    }

    ////////////////////////////////////////

    private View mapView;
    private ViewGroup infoView;
    private TextView commonNameLabel;
    private TextView botanicalNameLabel;
    private TextView botanicalFamilyLabel;
    private TrackButton trackButton;
    private InfoButton infoButton;
    private ImageButton wikipediaButton;

    private final double k_searchRadiusMeters = 15;
    private float zoom = 19.0f;
    private boolean gesture = false;
    private boolean paused = true;
    private Circle selectedSiteMarker;
    private TileOverlay tileOverlay;
    private boolean firstLocation = true;

    private TrackMode trackMode;
    private Site nearestSite;
    private Site selectedSite;

    private FusedLocationProviderClient locationClient;
    private Location location;
    private LocationCallback locationCallback;

    private final float[] accel = new float[3];
    private final float[] mag = new float[3];
    private final float[] rotMatrix = new float[9];
    private final float[] orientation = new float[3];
    long prevTimestamp;



    ////////////////////////////////////////

    private double min(double v1, double v2, double v3, double v4)
    {
        return Math.min(Math.min(v1, v2), Math.min(v3, v4));
    }

    private double max(double v1, double v2, double v3, double v4)
    {
        return Math.max(Math.max(v1, v2), Math.max(v3, v4));
    }

    private void trackControlPressed()
    {
        int newOrdinal = (trackMode.ordinal() + 1) % 3;
        setTrackMode(TrackMode.values()[newOrdinal]);
    }

    private void infoControlPressed()
    {
        Intent intent = new Intent(this, InfoActivity.class);
        startActivity(intent);
    }

    private void wikipediaButtonPressed()
    {
        if (this.selectedSite != null)
        {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://en.wikipedia.org/wiki/" + this.selectedSite.species.wikipediaTitle));
            startActivity(intent);
        }
    }

    private void setTrackMode(TrackMode trackMode)
    {
        if (this.trackMode != trackMode)
        {
            this.trackMode = trackMode;
            this.trackButton.setTrackMode(trackMode);
            if (trackMode != TrackMode.OFF)
            {
                updateCamera();
            }
        }
    }

    private void setSelectedSite(Site site)
    {
        if (this.selectedSite != site)
        {
            this.selectedSite = site;

            float alpha;
            if (this.selectedSite != null)
            {
                alpha = 1.0f;

                this.commonNameLabel.setText(site.species.commonName);
                this.botanicalNameLabel.setText(site.species.botanicalName);
                this.botanicalFamilyLabel.setText(site.species.botanicalFamilyName);

                this.selectedSiteMarker.setCenter(site.location.toLatLng());
                this.selectedSiteMarker.setVisible(true);
            }
            else
            {
                alpha = 0.0f;
                this.selectedSiteMarker.setVisible(false);
            }

            AlphaAnimation animation = new AlphaAnimation(this.infoView.getAlpha(), alpha);
            animation.setDuration(250);
            animation.setAnimationListener(
                    new Animation.AnimationListener()
                    {
                        @Override
                        public void onAnimationEnd(Animation animation)
                        {
                            MapActivity.this.infoView.setAlpha(alpha);
                        }

                        @Override
                        public void onAnimationStart(Animation animation) {}

                        @Override
                        public void onAnimationRepeat(Animation animation) {}
                    });
            this.infoView.startAnimation(animation);
        }
    }

    private void updateSelectedSite()
    {
        Dataset dataset = Dataset.getCurrent();
        if (dataset != null)
        {
            Site prevNearestSite = this.nearestSite;
            if (this.location != null)
            {
                // find nearest site
                QtLocation loc = new QtLocation(this.location);
                this.nearestSite = dataset.findNearestSite(loc, k_searchRadiusMeters);
            }
            else
            {
                this.nearestSite = null;
            }

            // if nearest site changed, update selection
            if (this.nearestSite != prevNearestSite)
            {
                setSelectedSite(this.nearestSite);
            }
        }
        else
        {
            this.nearestSite = null;
            this.selectedSite = null;
        }
    }

    private void updateCamera()
    {
        if (this.location != null && this.map != null)
        {
            double latitude = this.location.getLatitude();
            double longitude = this.location.getLongitude();
            float heading = 0.0f;
            if (this.trackMode == TrackMode.LOCATION_ORIENTATION)
            {
                heading = (float) Math.toDegrees(this.orientation[0]);
            }
            LatLng loc = new LatLng(latitude, longitude);
            CameraPosition cameraPos = new CameraPosition(loc, this.zoom, 0.0f, heading);
            CameraUpdate update = CameraUpdateFactory.newCameraPosition(cameraPos);
            this.map.animateCamera(update, 250, null);
        }
    }

    ////////////////////////////////////////
    // location 

    private void initLocation()
    {
        this.locationCallback =
            new LocationCallback()
            {
                @Override
                public void onLocationResult(LocationResult loc)
                {
                    MapActivity.this.location = loc.getLastLocation();
                    onLocation();
                }
            };

        this.locationClient = LocationServices.getFusedLocationProviderClient(this);

        try
        {
            this.map.setMyLocationEnabled(true);
        }
        catch (SecurityException ex) 
        {
            System.out.println(ex);
        }

        updateLocationUpdates();
    }

    private void updateLocationUpdates()
    {
        if (this.locationClient != null)
        {
            if (!this.paused)
            {
                startLocationUpdates();
            }
            else
            {
                stopLocationUpdates();
            }
        }
    }

    private void startLocationUpdates()
    {
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setInterval(10000);
        locationRequest.setFastestInterval(5000);
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        try
        {
            this.locationClient.requestLocationUpdates(locationRequest, this.locationCallback, Looper.getMainLooper());
        }
        catch (SecurityException ex) 
        {
            System.out.println(ex);
        }
    }

    private void stopLocationUpdates()
    {
        this.locationClient.removeLocationUpdates(this.locationCallback);
    }


    private void onLocation()
    {
        if (this.firstLocation)
        {
            this.firstLocation = false;
            Geocoder geocoder = new Geocoder(this);
            AsyncTask.execute(new Runnable() 
            {
                @Override
                public void run() 
                {
                    try
                    {
                        List<Address> addresses = geocoder.getFromLocation(MapActivity.this.location.getLatitude(), MapActivity.this.location.getLongitude(), 1);
                        if (!addresses.isEmpty())
                        {
                            if (Dataset.getCurrent() == null)
                            {
                                Dataset dataset = Dataset.find(addresses.get(0));

                                Handler mainHandler = new Handler(getMainLooper());
                                mainHandler.post(
                                        new Runnable() 
                                        {
                                            @Override
                                            public void run()
                                            {
                                                dataset.load(MapActivity.this.map, MapActivity.this);
                                                MapActivity.this.tileOverlay.clearTileCache();
                                            }
                                        });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        System.out.println(ex);
                    }
                }
            });

        }

        if (this.trackMode != TrackMode.OFF)
        {
            updateCamera();
        }
        updateSelectedSite();
    }


    ////////////////////////////////////////
    // heading

    private void updateHeadingUpdates()
    {
        if (this.map != null)
        {
            if (!this.paused)
            {
                startHeadingUpdates();
            }
            else
            {
                stopHeadingUpdates();
            }
        }
    }

    private void startHeadingUpdates()
    {
        SensorManager sensorMgr = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        Sensor accel = sensorMgr.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        if (accel != null) 
        {
            sensorMgr.registerListener(this, accel, SensorManager.SENSOR_DELAY_NORMAL, SensorManager.SENSOR_DELAY_UI);
        }
        Sensor mag = sensorMgr.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        if (mag != null) 
        {
            sensorMgr.registerListener(this, mag, SensorManager.SENSOR_DELAY_NORMAL, SensorManager.SENSOR_DELAY_UI);
        }
    }

    private void stopHeadingUpdates()
    {
        SensorManager sensorMgr = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        sensorMgr.unregisterListener(this);
    }


    ////////////////////////////////////////
    // SensorListener

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    public void onSensorChanged(SensorEvent event) 
    {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) 
        {
            System.arraycopy(event.values, 0, this.accel, 0, this.accel.length);
        } 
        else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) 
        {
            System.arraycopy(event.values, 0, this.mag, 0, this.mag.length);
        }

        SensorManager.getRotationMatrix(this.rotMatrix, null, this.accel, this.mag);
        SensorManager.getOrientation(this.rotMatrix, this.orientation);
        if (event.timestamp - this.prevTimestamp > 1000*1000000)
        {
            if (this.trackMode != TrackMode.OFF)
            {
                updateCamera();
            }
            this.prevTimestamp = event.timestamp;
        }
    }


    ////////////////////////////////////////
    // map listeners

    @Override
    public void onCameraMoveStarted(int reason)
    {
        if (reason == REASON_GESTURE)
        {
            this.gesture = true;
            setTrackMode(TrackMode.OFF);
        }
    }

    @Override
    public void onCameraIdle()
    {
        if (this.gesture)
        {
            this.zoom = this.map.getCameraPosition().zoom;
        }
        this.gesture = false;
        updateSelectedSite();
    }

    @Override
    public boolean onMarkerClick(Marker marker)
    {
        Dataset dataset = (Dataset) marker.getTag();
        dataset.load(this.map, this);
        this.tileOverlay.clearTileCache();
        return true;
    }

    @Override
    public void onMapClick(LatLng latLng)
    {
        Dataset dataset = Dataset.getCurrent();
        if (dataset != null)
        {
            QtLocation location = new QtLocation(latLng.latitude, latLng.longitude);

            double tapRadiusPixels = 20;
            VisibleRegion visibleRegion = this.map.getProjection().getVisibleRegion();
            double minLongitude = min(visibleRegion.nearLeft.longitude, visibleRegion.nearRight.longitude, visibleRegion.farLeft.longitude, visibleRegion.farRight.longitude);
            double maxLongitude = max(visibleRegion.nearLeft.longitude, visibleRegion.nearRight.longitude, visibleRegion.farLeft.longitude, visibleRegion.farRight.longitude);
            double dLng = maxLongitude - minLongitude;

            double viewWidth = this.mapView.getWidth() / (getResources().getDisplayMetrics().densityDpi / DisplayMetrics.DENSITY_DEFAULT);

            double tapRadiusMeters = tapRadiusPixels / viewWidth * dLng / dataset.getDegPerMeterLongitude();

            setSelectedSite(dataset.findNearestSite(location, tapRadiusMeters));
        }
    }
}
