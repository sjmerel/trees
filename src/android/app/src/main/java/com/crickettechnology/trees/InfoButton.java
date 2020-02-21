package com.crickettechnology.trees;

import android.graphics.*;
import android.content.*;
import android.util.*;

class InfoButton extends CircleButton
{
    public InfoButton(Context context)
    {
        this(context, null, 0);
    }

    public InfoButton(Context context, AttributeSet attrs)
    {
        this(context, attrs, 0);
    }

    public InfoButton(Context context, AttributeSet attrs, int defStyleAttr)
    {
        super(context, attrs, defStyleAttr);

        this.image = BitmapFactory.decodeResource(getResources(), R.drawable.info);
    }

    @Override
    public void onDraw(Canvas canvas)
    {
        super.onDraw(canvas);

        float iw = this.image.getWidth()/2;
        float ih = this.image.getHeight()/2;
        float x = (getWidth() - iw)/2;
        float y = (getHeight() - ih)/2;
        RectF r = new RectF(x, y, x + iw, y + ih);
        canvas.drawBitmap(this.image, null, r, null);
    }

    private Bitmap image;
}

