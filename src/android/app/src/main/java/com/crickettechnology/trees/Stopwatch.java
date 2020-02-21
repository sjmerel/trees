package com.crickettechnology.trees;

import android.os.*;

class Stopwatch
{
    public void start()
    {
        if (this.startTimeNs == 0)
        {
            this.startTimeNs = getTimeNs();
        }
    }

    public void stop()
    {
        if (this.startTimeNs != 0)
        {
            this.elapsedNs += (getTimeNs() - this.startTimeNs);
            this.startTimeNs = 0;
        }
    }

    public void reset()
    {
        this.elapsedNs = 0;
        if (this.startTimeNs != 0)
        {
            this.startTimeNs = getTimeNs();
        }
    }

    public boolean isRunning()
    {
        return this.startTimeNs != 0;
    }

    public float getElapsedTime()
    {
        long elapsedNs = this.elapsedNs;
        if (this.startTimeNs != 0)
        {
            elapsedNs += (getTimeNs() - this.startTimeNs);
        }
        return elapsedNs * 0.000000001f;
    }

    ////////////////////////////////////////

    private long startTimeNs;
    private long elapsedNs;

    private long getTimeNs()
    {
        return SystemClock.elapsedRealtimeNanos();
    }
}

