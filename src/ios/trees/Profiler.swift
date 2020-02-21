import Foundation

class Profiler
{
    public init(name: String)
    {
        self.name = name
        self.stopwatch.reset()
        self.stopwatch.start()
    }

    public func markEnd(_ label: String)
    {
        let elapsedTime = self.stopwatch.elapsedTime
        print("\(self.name): \(formatTime(elapsedTime)) (\(formatTime(elapsedTime - self.prevTime))) \(label)")
        self.prevTime = elapsedTime
    }

    public func stop()
    {
        self.stopwatch.stop()
        print("\(self.name): \(formatTime(self.stopwatch.elapsedTime)) TOTAL")
    }

    ////////////////////////////////////////

    private let name: String
    private var prevTime: TimeInterval = 0
    private let stopwatch = Stopwatch()

    private func formatTime(_ time: TimeInterval) -> String
    {
        return String(format:"%.3f", time)
    }
}

