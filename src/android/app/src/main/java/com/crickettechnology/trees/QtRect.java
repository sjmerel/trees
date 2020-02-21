package com.crickettechnology.trees;

class QtRect
{
    public QtRect(QtSpan latitude, QtSpan longitude)
    {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public QtSpan latitude;
    public QtSpan longitude;

    public static final QtRect invalid = new QtRect(QtSpan.invalid, QtSpan.invalid);

    public double getArea()
    {
        return this.latitude.getLength() * this.longitude.getLength();
    }

    public QtRect getQuarter(int i, int j)
    {
        return new QtRect(this.latitude.getHalf(i), this.longitude.getHalf(j));
    }

    public QtRect inflated(double ratio)
    {
        return new QtRect(this.latitude.inflated(ratio),
                          this.longitude.inflated(ratio));
    }

    boolean contains(QtLocation location)
    {
        return this.latitude.contains(location.latitude) &&
               this.longitude.contains(location.longitude);
    }

    boolean contains(QtRect rect)
    {
        return this.latitude.contains(rect.latitude) &&
               this.longitude.contains(rect.longitude);
    }

    boolean intersects(QtRect rect)
    {
        return !(this.latitude.max <= rect.latitude.min ||
                 this.latitude.min >= rect.latitude.max ||
                 this.longitude.max <= rect.longitude.min ||
                 this.longitude.min >= rect.longitude.max);
    }
}

