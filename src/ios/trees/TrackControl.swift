import UIKit

class TrackControl: CircleControl
{
    public var trackMode: TrackMode = .off
    {
        didSet { setNeedsDisplay() }
    }

    override func draw(_ rect:CGRect)
    {
        super.draw(rect)

        let image = self.images[Int(self.trackMode.rawValue)]
        let pos = CGPoint(x:(rect.size.width - image.size.width)/2, y:(rect.size.height - image.size.height)/2)
        image.draw(at:pos)
    }

    ////////////////////////////////////////

    private let images = [
        UIImage(named:"track_off")!,
        UIImage(named:"track_on")!,
        UIImage(named:"track_on2")!
    ]

    private func setup()
    {
        self.backgroundColor = UIColor.clear
    }

}
