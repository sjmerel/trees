package com.crickettechnology.trees;

class QtSpan
{
    public QtSpan(double min, double max)
    {
        this.min = min;
        this.max = max;
    }

    public double min; // inclusive
    public double max; // non-inclusive

    public static final QtSpan invalid = new QtSpan(0, 0);

    // center point
    public double getMid()
    {
         return this.min + (this.max - this.min)/2;
    }

    public double getLength()
    {
        return this.max - this.min;
    }

    public QtSpan getHalf(int i)
    {
        assert(i == 0 || i == 1);
        return new QtSpan((i == 0 ? this.min : getMid()), (i == 0 ? getMid() : this.max));
    }

    public QtSpan inflated(double ratio)
    {
        double dl = this.getLength() * (ratio - 1.0);
        return new QtSpan(this.min - dl, this.max + dl);
    }

    public QtSpan getHighHalf()
    {
        return new QtSpan(this.getMid(), this.max);
    }

    public boolean contains(double coord)
    {
        return coord >= this.min && coord < this.max;
    }

    public boolean contains(QtSpan span)
    {
        return this.contains(span.min) && this.contains(span.max);
    }

    public boolean intersects(QtSpan span)
    {
        return !(this.max <= span.min || this.min >= span.max);
    }
}


