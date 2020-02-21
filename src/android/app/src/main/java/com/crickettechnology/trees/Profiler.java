package com.crickettechnology.trees;

public class Profiler
{
    Profiler(String name)
    {
        this.name = name;
    }

    public void start()
    {
        this.stopwatch.reset();
        this.stopwatch.start();
    }

    public void markEnd(String label)
    {
        float elapsedTime = this.stopwatch.getElapsedTime();
        System.out.printf("%s: %.3f (%.3f) %s\n", 
                this.name, elapsedTime, elapsedTime - this.prevTime, label);
        this.prevTime = elapsedTime;
    }

    public void stop()
    {
        this.stopwatch.stop();
        System.out.printf("%s: %.3f TOTAL\n", this.name, this.stopwatch.getElapsedTime());
    }

    ////////////////////////////////////////

    private final String name;
    private float prevTime;
    private Stopwatch stopwatch = new Stopwatch();

}


