import UIKit

class ShadowView : UIView
{
    override init(frame: CGRect)
    {
        super.init(frame: frame)
        setup()
    }

    required init?(coder:NSCoder)
    {
        super.init(coder:coder)
        setup()
    }

    private func setup()
    {
        self.layer.shadowOffset = CGSize(width:4, height:4)
        self.layer.shadowOpacity = 0.5
        self.layer.shadowRadius = 4
        self.layer.masksToBounds = false;
    }

}

