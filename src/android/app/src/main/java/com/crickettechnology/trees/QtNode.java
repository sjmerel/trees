package com.crickettechnology.trees;

import java.util.*;

// Quadtree node
class QtNode<T extends QtElement>
{
    public QtNode(QtRect rect)
    {
        this.rect = rect;
    }

    // find element nearest to the given location
    public T findNearest(final QtLocation location)
    {
        if (this.rect.contains(location))
        {
            return null;
        }

        ArrayList<T> elems = new ArrayList<>();
        if (this.nodes == null)
        {
            elems.addAll(this.elements);
        }
        else
        {
            for (QtNode<T> node: this.nodes)
            {
                T nearest = node.findNearest(location);
                if (node != null)
                {
                    elems.add(nearest);
                }
            }
        }

        return Collections.min(elems, 
            new Comparator<T>()
            {
                @Override
                public int compare(T lhs, T rhs) 
                {
                    double lhsDist = lhs.getLocation().distanceSquared(location);
                    double rhsDist = rhs.getLocation().distanceSquared(location);
                    return Double.compare(lhsDist, rhsDist);
                }
            });
    }

    // find all elements contained in the given rectangle
    public List<T> findContained(QtRect rect)
    {
        ArrayList<T> results = new ArrayList<>();
        if (this.nodes == null)
        {
            for (T elem: this.elements)
            {
                if (rect.contains(elem.getLocation()))
                {
                    results.add(elem);
                }
            }
        }
        else
        {
            for (QtNode<T> node: this.nodes)
            {
                if (node.rect.intersects(rect))
                {
                    results.addAll(node.findContained(rect));
                }
            }
        }
        return results;
    }

    // find all rectangles intersected by the given rectangle
    public List<QtRect> findContainedRects(QtRect rect)
    {
        ArrayList<QtRect> results = new ArrayList<>();
        if (this.rect.intersects(rect) && !this.rect.contains(rect))
        {
            results.add(this.rect);
        }
        if (this.nodes != null)
        {
            for (QtNode<T> node: this.nodes)
            {
                results.addAll(node.findContainedRects(rect));
            }
        }
        return results;
    }

    public void add(T element)
    {
        if (this.nodes == null)
        {
            this.elements.add(element);
            if (this.elements.size() > k_maxElements)
            {
                subdivide();
            }
        }
        else
        {
            place(element);
        }
    }

    public int countElements()
    {
        if (this.nodes == null)
        {
            return this.elements.size();
        }
        else
        {
            int count = 0;
            for (QtNode<T> node: this.nodes)
            {
                count += node.countElements();
            }
            return count;
        }
    }

    public int countNodes()
    {
        if (this.nodes == null)
        {
            return 1;
        }
        else
        {
            int count = 1;
            for (QtNode<T> node: this.nodes)
            {
                count += node.countNodes();
            }
            return count;
        }
    }

    public int countLevels()
    {
        if (this.nodes == null)
        {
            return 1;
        }
        else
        {
            int count = 0;
            for (QtNode<T> node: this.nodes)
            {
                count = Math.max(count, node.countElements());
            }
            return 1 + count;
        }
    }

    public QtNode<T> clone()
    {
        QtNode<T> node = new QtNode<>(this.rect);
        if (this.nodes == null)
        {
            node.elements.addAll(this.elements);
        }
        else
        {
            node.nodes = new QtNode[]
            {
                node.nodes[0].clone(),
                node.nodes[1].clone(),
                node.nodes[2].clone(),
                node.nodes[3].clone(),
            };
        }
        return node;
    }

    ////////////////////////////////////////

    private QtRect rect;
    private QtNode<T>[] nodes;
    private ArrayList<T> elements = new ArrayList<>();
    private static final int k_maxElements = 10;

    private void subdivide()
    {
        assert this.nodes == null;
        this.nodes = new QtNode[]
        {
            new QtNode(this.rect.getQuarter(0,0)),
            new QtNode(this.rect.getQuarter(0,1)),
            new QtNode(this.rect.getQuarter(1,0)),
            new QtNode(this.rect.getQuarter(1,1))
        };
        for (T elem: this.elements)
        {
            place(elem);
        }
        this.elements.clear();
    }

    private void place(T elem)
    {
        assert(this.nodes.length == 4);
        for (QtNode<T> node: this.nodes)
        {
            if (node.rect.contains(elem.getLocation()))
            {
                node.add(elem);
                break;
            }
        }
    }
}

