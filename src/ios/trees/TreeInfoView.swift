import UIKit

@IBDesignable
class TreeInfoView : ShadowView
{
    public var species: Species!
    {
        didSet
        {
            self.commonNameLabel.text = species.commonNames.reduce("", { x, y in x + (x.isEmpty ? "" : ", ") + y })
            self.botanicalNameLabel.text = species.botanicalName
            self.markerView.fillColor = species.markerColor
            self.wikipediaButton.wikipediaTitle = species.wikipediaTitle

            for i in 0..<species.hierarchy.count
            {
                let taxon = species.hierarchy[i]
                var taxonView: TaxonView
                if i < self.hierarchyView.arrangedSubviews.count
                {
                    taxonView = self.hierarchyView.arrangedSubviews[i] as! TaxonView
                }
                else
                {
                    taxonView = TaxonView(frame: CGRect(x:0, y:0, width: 0, height: 20))
                }
                taxonView.taxon = taxon

                if i >= self.hierarchyView.arrangedSubviews.count
                {
                    self.hierarchyView.addArrangedSubview(taxonView)
                }
            }
            while (species.hierarchy.count < self.hierarchyView.arrangedSubviews.count)
            {
                self.hierarchyView.removeArrangedSubview(self.hierarchyView.arrangedSubviews.last!)
            }

            updateExpandView(duration: 0.25)

            if UIScreen.main.nativeBounds.height < 1136 // iphone 4
            {
                self.expandButton.isHidden = true
            }
        }
    }

    public func setExpanded(_ expanded: Bool, duration: TimeInterval)
    {
        self.expanded = expanded
        updateExpandView(duration: duration)
    }

    public var closePressed: () -> () = {}

    @IBInspectable
    public var buttonsHidden: Bool = false
    {
        didSet
        {
            updateButtons()
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

    ////////////////////////////////////////

    @IBOutlet weak var markerView: TreeMarkerView!
    @IBOutlet weak var wikipediaButton: WikipediaButton!
    @IBOutlet weak var commonNameLabel: UILabel!
    @IBOutlet weak var botanicalNameLabel: UILabel!
    @IBOutlet weak var hierarchyView: UIStackView!
    @IBOutlet weak var expandView: UIView!
    @IBOutlet weak var expandViewHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var expandButton: UIButton!
    @IBOutlet weak var closeButton: UIButton!

    private func updateExpandView(duration: TimeInterval)
    {
        var height: CGFloat = 0
        var alpha: CGFloat = 0
        var delay: TimeInterval = 0

        if (self.expanded)
        {
            alpha = 1
            // hierarchy label is 15 high, 20 from top, 5 from stack view = 40
            height = CGFloat(self.species.hierarchy.count * 32 + 40)
            delay = duration*0.5
        }
        else
        {
            alpha = 0
            height = 0
            delay = 0
        }

        // fade out first, or fade in last
        UIView.animate(withDuration: duration*0.5, delay: delay, options: [.beginFromCurrentState ], animations: 
        {
            self.expandView.alpha = alpha
        }, completion: nil)

        UIView.animate(withDuration: duration, delay: 0, options: [.beginFromCurrentState ], animations: 
        {
            self.expandViewHeightConstraint.constant = height
            self.layoutIfNeeded()
            self.superview?.layoutIfNeeded()
        }, completion:
        {
            finished in
            let image = UIImage(named:(self.expanded ? "arrow_up.png" : "arrow_down.png"))
            self.expandButton.setImage(image, for: .normal)
        })
    }

    @IBAction func expandButtonPressed()
    {
        setExpanded(!self.expanded, duration: 0.25)
    }

    @IBAction func closeButtonPressed()
    {
        self.closePressed()
    }


    private var xibView: UIView!
    private var expanded = false

    private func setup()
    {
        self.xibView = setXib()
        updateButtons()
        updateExpandView(duration: 0)
    }

    private func updateButtons()
    {
        self.closeButton.isHidden = self.buttonsHidden
        self.expandButton.isHidden = self.buttonsHidden
    }
}

