package com.crickettechnology.trees;

import android.graphics.*;
import android.content.*;
import android.util.*;

class TrackButton extends CircleButton
{
    public TrackButton(Context context)
    {
        this(context, null, 0);
    }

    public TrackButton(Context context, AttributeSet attrs)
    {
        this(context, attrs, 0);
    }

    public TrackButton(Context context, AttributeSet attrs, int defStyleAttr)
    {
        super(context, attrs, defStyleAttr);

        this.images = new Bitmap[] 
        {
            BitmapFactory.decodeResource(getResources(), R.drawable.track_off),
            BitmapFactory.decodeResource(getResources(), R.drawable.track_on),
            BitmapFactory.decodeResource(getResources(), R.drawable.track_on2)
        };
    }

    @Override
    public void onDraw(Canvas canvas)
    {
        super.onDraw(canvas);

        Bitmap image = this.images[this.trackMode.ordinal()];
        float iw = image.getWidth()/2;
        float ih = image.getHeight()/2;
        float x = (getWidth() - iw)/2;
        float y = (getHeight() - ih)/2;
        RectF r = new RectF(x, y, x + iw, y + ih);
        canvas.drawBitmap(image, null, r, null);
    }

    public void setTrackMode(TrackMode trackMode)
    {
        if (this.trackMode != trackMode)
        {
            this.trackMode = trackMode;
            invalidate();
        }
    }

    private TrackMode trackMode;
    private Bitmap[] images;
}


