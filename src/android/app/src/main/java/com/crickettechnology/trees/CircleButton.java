package com.crickettechnology.trees;

import android.graphics.*;
import androidx.appcompat.widget.*;
import android.content.*;
import android.util.*;
import android.view.*;

class CircleButton extends AppCompatButton
{
    public CircleButton(Context context)
    {
        this(context, null, 0);
    }

    public CircleButton(Context context, AttributeSet attrs)
    {
        this(context, attrs, 0);
    }

    public CircleButton(Context context, AttributeSet attrs, int defStyleAttr)
    {
        super(context, attrs, defStyleAttr);

        this.paint = new Paint();
        this.paint.setStyle(Paint.Style.FILL);
        this.paint.setColor(Color.WHITE);
        setOutlineProvider(new CircleOutlineProvider());
    }

    @Override
    public void onDraw(Canvas canvas)
    {
        super.onDraw(canvas);

        float x = getWidth()/2;
        float y = getHeight()/2;
        canvas.drawCircle(x, y, x, this.paint);
    }

    ////////////////////////////////////////

    private class CircleOutlineProvider extends ViewOutlineProvider
    {
        @Override
        public void getOutline (View view, Outline outline)
        {
            int w = view.getWidth();
            outline.setOval(0, 0, w, w);
        }
    }

    private Paint paint;
}
