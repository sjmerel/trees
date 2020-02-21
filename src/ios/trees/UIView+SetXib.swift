import UIKit

extension UIView
{
    @discardableResult
    func setXib() -> UIView
    {
        let t = type(of:self)
        let bundle = Bundle(for: t)
        let view = bundle.loadNibNamed(String(describing:t), owner: self, options: nil)![0] as! UIView
        addSubview(view)
        view.frame = bounds
        view.autoresizingMask = [.flexibleHeight, .flexibleWidth]
        return view
    }
}

