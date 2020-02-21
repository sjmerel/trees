import UIKit

@IBDesignable
open class TreeMarkerView: UIView
{
    @IBInspectable
    open var lineWidth : CGFloat = 2.0
    {
        didSet { setNeedsDisplay() }
    }

    @IBInspectable
    open var lineColor : UIColor = UIColor.white
    {
        didSet { setNeedsDisplay() }
    }

    @IBInspectable
    open var fillColor : UIColor = UIColor.red
    {
        didSet { setNeedsDisplay() }
    }

    ////////////////////////////////////////

    public override init(frame:CGRect)
    {
        super.init(frame:frame)
        setup()
    }

    public required init?(coder:NSCoder)
    {
        super.init(coder:coder)
        setup()
    }


    open override func prepareForInterfaceBuilder()
    {
        setup()
    }

    open override func draw(_ rect:CGRect)
    {
        // recenter coords to graph origin to make things simpler later
        let ctx = UIGraphicsGetCurrentContext()
        ctx?.saveGState()
        ctx?.translateBy(x: rect.size.width * 0.5, y: rect.size.height * 0.5)

        self.lineColor.setStroke()
        let d = (rect.width > rect.height ? rect.height : rect.width) - self.lineWidth*2
        let bounds = CGRect(origin:CGPoint(x:-d/2, y:-d/2), size:CGSize(width:d, height:d))
        let path = UIBezierPath(ovalIn:bounds)
        path.lineWidth = self.lineWidth
        path.stroke()

        self.fillColor.setFill()
        path.fill()

        ctx?.restoreGState()
    }

    ////////////////////////////////////////

    private func setup()
    {
        self.backgroundColor = UIColor.clear
    }
}



