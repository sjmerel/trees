import Foundation

// Quadtree node
class QtNode<T: QtElement>
{
    init(rect: QtRect)
    {
        self.rect = rect
    }

    // find element nearest to the given location
    func findNearest(location: QtLocation, distanceScale: QtDistanceScale? = nil) -> T?
    {
        if (!self.rect.contains(location:location))
        {
            return nil
        }

        let distanceScale = distanceScale ?? QtDistanceScale(location: location)

        var elems = [T]()
        if (self.nodes.isEmpty)
        {
            elems.append(contentsOf:self.elements)
        }
        else
        {
            for node in self.nodes
            {
                if let nearest = node.findNearest(location:location, distanceScale: distanceScale)
                {
                    elems.append(nearest)
                }
            }
        }

        return elems.min(by: 
                { 
                    x, y in
                    let xLoc = x.location
                    let yLoc = y.location
                    return distanceScale.distanceSquared(xLoc, location) < distanceScale.distanceSquared(yLoc, location)
                })
    }

    // find all elements contained in the given rectangle
    func findContained(rect: QtRect) -> [T]
    {
        var results = [T]()
        if self.nodes.isEmpty
        {
            for elem in self.elements
            {
                if rect.contains(location:elem.location)
                {
                    results.append(elem)
                }
            }
        }
        else
        {
            for node in self.nodes
            {
                if node.rect.intersects(rect:rect)
                {
                    results.append(contentsOf: node.findContained(rect:rect))
                }
            }
        }
        return results
    }

    // find all rectangles intersected by the given rectangle
    func findContainedRects(rect: QtRect) -> [QtRect]
    {
        var results = [QtRect]()
        if self.rect.intersects(rect: rect) && !self.rect.contains(rect:rect)
        {
            results.append(self.rect)
        }
        for node in self.nodes
        {
            if node.rect.intersects(rect: rect)
            {
                results.append(contentsOf: node.findContainedRects(rect:rect))
            }
        }
        return results
    }

    func add(_ element: T) 
    {
        if (self.nodes.isEmpty)
        {
            self.elements.append(element)
            if (self.elements.count > k_maxElements)
            {
                subdivide()
            }
        }
        else
        {
            place(element)
        }
    }

    func countElements() -> Int
    {
        if (self.nodes.isEmpty)
        {
            return self.elements.count
        }
        else
        {
            return self.nodes.reduce(0, { sum, node in sum + node.countElements() })
        }
    }

    func countNodes() -> Int
    {
        if (self.nodes.isEmpty)
        {
            return 1
        }
        else
        {
            return self.nodes.reduce(1, { sum, node in sum + node.countNodes() })
        }
    }

    func countLevels() -> Int
    {
        if (self.nodes.isEmpty)
        {
            return 1
        }
        else
        {
            return 1 + self.nodes.map({ $0.countLevels() }).max()!
        }
    }

    func clone() -> QtNode<T>
    {
        let node = QtNode(rect: self.rect)
        if self.nodes.isEmpty
        {
            node.elements.append(contentsOf:self.elements)
        }
        else
        {
            for n in self.nodes
            {
                node.nodes.append(n.clone())
            }
        }
        return node
    }

    /*
    func print(prefix: String = "")
    {
        if (self.nodes.isEmpty)
        {
            Swift.print("\(prefix)\(self.elements.count)")
        }
        else
        {
            for node in self.nodes
            {
                node.print(prefix: prefix + "-")
            }
        }
    }
    */

    ////////////////////////////////////////

    private var rect: QtRect
    private var nodes = [QtNode]()
    private var elements = [T]()
    private let k_maxElements = 10

    private func subdivide()
    {
        assert(self.nodes.isEmpty)
        self.nodes = 
        [
            QtNode(rect: self.rect.getQuarter(0,0)),
            QtNode(rect: self.rect.getQuarter(0,1)),
            QtNode(rect: self.rect.getQuarter(1,0)),
            QtNode(rect: self.rect.getQuarter(1,1))
        ]
        for elem in self.elements
        {
            place(elem)
        }
        self.elements.removeAll()
    }

    private func place(_ elem: T)
    {
        assert(self.nodes.count == 4)
        for node in self.nodes
        {
            if (node.rect.contains(location:elem.location))
            {
                node.add(elem)
                break
            }
        }
    }
}
