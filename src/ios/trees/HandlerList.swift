class HandlerList<T>
{
    public func call(value: T)
    {
        for handlerInfo in self.handlers
        {
            handlerInfo.handler(value)
        }
    }

    public func add(tag: AnyObject, handler: @escaping Handler)
    {
        self.handlers.append(HandlerInfo(handler: handler, tag: tag))
    }

    public func remove(tag: AnyObject)
    {
        self.handlers.removeAll(where: { $0.tag === tag })
    }

    public typealias Handler = (T) -> Void

    ////////////////////////////////////////

    private struct HandlerInfo
    {
        let handler: Handler
        let tag: AnyObject
    }

    private var handlers = [HandlerInfo]()
}
