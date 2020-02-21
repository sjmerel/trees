import UIKit

@IBDesignable
class WikipediaButton : UIButton
{
    public var wikipediaTitle: String? = nil

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
        setImage(UIImage(named:"wikipedia.png"), for:.normal)
        addTarget(self, action: #selector(onPress), for: .touchUpInside)
    }

    @objc private func onPress(_ sender: AnyObject) 
    {
        if let wikipediaTitle = self.wikipediaTitle
        {
            let url = URL(string: "https://en.wikipedia.org/wiki/\(wikipediaTitle)")!
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url)
            } else {
                UIApplication.shared.openURL(url)
            }
        }
    }

}

