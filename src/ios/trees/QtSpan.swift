import Foundation

struct QtSpan
{
    var min: QtCoordinate // inclusive
    var max: QtCoordinate // non-inclusive

    static let invalid = QtSpan(min:0, max:0)

    // center point
    var mid: QtCoordinate
    {
        get { return self.min + (self.max - self.min)/2 }
    }

    var length: QtCoordinate
    {
        get { return self.max - self.min }
    }

    func getEnd(_ i: Int) -> QtCoordinate
    {
        assert(i == 0 || i == 1)
        return (i == 0 ? self.min : self.max)
    }

    func getHalf(_ i: Int) -> QtSpan
    {
        assert(i == 0 || i == 1)
        return QtSpan(min: (i == 0 ? self.min : self.mid), max: (i == 0 ? self.mid : self.max)) 
    }

    func inflated(ratio: QtCoordinate) -> QtSpan
    {
        let dl = self.length * (ratio - 1.0)
        return QtSpan(min:self.min-dl, max:self.max+dl)
    }

    func contains(coord: QtCoordinate) -> Bool
    {
        return coord >= self.min && coord < self.max
    }

    func contains(span: QtSpan) -> Bool
    {
        return self.contains(coord:span.min) && self.contains(coord:span.max)
    }

    func intersects(span: QtSpan) -> Bool
    {
        return !(self.max <= span.min || self.min >= span.max)
    }
}
