import UIKit

@IBDesignable
class TaxonView : UIView
{
    public var taxon: Taxon!
    {
        didSet
        {
            self.nameLabel.text = taxon.rank.rawValue
            self.valueLabel.text = taxon.name
            if let wp = taxon.wikipediaTitle
            {
                self.wikipediaButton.wikipediaTitle = wp
                self.wikipediaButton.isHidden = false
            }
            else
            {
                self.wikipediaButton.isHidden = true
            }
        }
    }

    ////////////////////////////////////////

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

    override var intrinsicContentSize: CGSize
    {
        get { return CGSize(width: 0, height: 28) }
    }

    ////////////////////////////////////////

    @IBOutlet private weak var nameLabel: UILabel!
    @IBOutlet private weak var valueLabel: UILabel!
    @IBOutlet private weak var wikipediaButton: WikipediaButton!

    private var xibView: UIView!

    private func setup()
    {
        self.xibView = setXib()
    }
}
