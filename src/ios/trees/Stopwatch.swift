import Foundation 

class Stopwatch
{
    public func start()
    {
        if (self.startTime == nil)
        {
            self.startTime = Date()
        }
    }

    public func stop()
    {
        if let startTime = self.startTime
        {
            self.elapsed += Date().timeIntervalSince(startTime)
            self.startTime = nil
        }
    }

    public func reset()
    {
        self.elapsed = 0
        if (self.startTime != nil)
        {
            self.startTime = Date()
        }
    }

    public var running: Bool
    {
        get { return self.startTime != nil }
    }

    public var elapsedTime: TimeInterval
    {
        get
        {
            var elapsedTime = self.elapsed
            if let startTime = self.startTime
            {
                elapsedTime += Date().timeIntervalSince(startTime)
            }
            return elapsedTime
        }
    }

    ////////////////////////////////////////

    private var startTime: Date?
    private var elapsed: TimeInterval = 0
}

