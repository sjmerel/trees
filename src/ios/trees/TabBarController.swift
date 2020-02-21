import UIKit

class TabBarController: UITabBarController
{
    override func viewDidLoad()
    {
        super.viewDidLoad()

        self.mapViewController = self.viewControllers!.first(where: { $0 is MapViewController }) as? MapViewController
        self.datasetsViewController = self.viewControllers!.first(where: { $0 is DatasetsViewController }) as? DatasetsViewController

        Dataset.willLoad.add(tag: self)
        {
            dataset in

            self.loadingAlert = UIAlertController(title: "Loading tree data for\n\(dataset.name)...", message: nil, preferredStyle: .alert)
            let indicator = UIActivityIndicatorView(frame: CGRect(x:0, y:0, width:60, height:60))
            indicator.style = .gray
            indicator.startAnimating()
            self.loadingAlert.view.addSubview(indicator)
            self.present(self.loadingAlert, animated: true, completion: nil)
        }

        Dataset.didLoad.add(tag: self)
        {
            dataset in
            self.loadingAlert.dismiss(animated: true, completion: nil)
            self.loadingAlert = nil
        }
    }

    private var mapViewController: MapViewController!
    private var datasetsViewController: DatasetsViewController!
    private var loadingAlert: UIAlertController!
}

