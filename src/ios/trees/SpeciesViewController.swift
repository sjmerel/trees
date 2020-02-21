import UIKit

class SpeciesViewController: UIViewController
{
    public class func create() -> Self
    {
        return super.create(storyboardId: "species")
    }

    override func viewDidLoad() 
    {
        super.viewDidLoad()

        self.commonNameLabel.text = site.species.commonNames.first ?? ""
        self.botanicalNameLabel.text = site.species.botanicalName
    }

    @IBOutlet weak var botanicalNameLabel: UILabel!
    @IBOutlet weak var commonNamesLabel: UILabel!

}
