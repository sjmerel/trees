import UIKit

class CircleControl: UIControl
{
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

    override func draw(_ rect:CGRect)
    {
        // recenter coords to graph origin to make things simpler later
        let ctx = UIGraphicsGetCurrentContext()
        ctx?.saveGState()
        ctx?.translateBy(x: rect.size.width * 0.5, y: rect.size.height * 0.5)

        let d = rect.size.width
        let bounds = CGRect(origin:CGPoint(x:-d/2, y:-d/2), size:CGSize(width:d, height:d))
        let path = UIBezierPath(ovalIn:bounds)
        self.fillColor.setFill()
        path.fill()

        ctx?.restoreGState()
    }

    ////////////////////////////////////////

    private let fillColor = UIColor.white

    private func setup()
    {
        self.backgroundColor = UIColor.clear

        self.layer.shadowOffset = CGSize(width:2, height:2)
        self.layer.shadowOpacity = 0.5
        self.layer.shadowRadius = 4
        self.layer.masksToBounds = false;
    }

}

