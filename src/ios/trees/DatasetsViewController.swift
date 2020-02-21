import UIKit

class DatasetsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate
{
    override func viewWillAppear(_ animated: Bool)
    {
        super.viewWillAppear(animated)
        self.tableView.reloadData()
        self.updateCurrentDataset()
    }

    override func viewDidLoad() 
    {
        super.viewDidLoad()

        Dataset.didLoad.add(tag: self)
        {
            dataset in
            self.updateCurrentDataset()
        }

        LocationService.instance.geocodeDatasetChanged.add(tag: self)
        {
            dataset in
            for indexPath in self.tableView!.indexPathsForVisibleRows!
            {
                let cell = self.tableView.cellForRow(at:indexPath) as! DatasetTableViewCell
                let cellDataset = Dataset.all[indexPath.row]
                cell.locationView.isHidden = (dataset == nil || cellDataset !== LocationService.instance.geocodeDataset)
            }
        }
    }

    ////////////////////////////////////////

    @IBOutlet weak var tableView: UITableView!

    ////////////////////////////////////////

    private func updateCurrentDataset()
    {
        if let dataset = Dataset.current
        {
            let index = Dataset.all.firstIndex(where: { dataset === $0 })!
            self.tableView.selectRow(at: IndexPath(row: index, section: 0), animated: false, scrollPosition: .none)
        }
        else
        {
            if let index = self.tableView.indexPathForSelectedRow
            {
                self.tableView.deselectRow(at: index, animated: true)
            }
        }
    }


    ////////////////////////////////////////
    // UITableViewDataSource

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int 
    {
        return Dataset.all.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell 
    {
        let cell = tableView.dequeueReusableCell(withIdentifier:"cell_id") as! DatasetTableViewCell
        let dataset = Dataset.all[indexPath.row]

        cell.titleLabel.text = "\(dataset.name), \(dataset.administrativeArea)"

        let numberFormatter = NumberFormatter()
        numberFormatter.numberStyle = NumberFormatter.Style.decimal
        let formattedNumber = numberFormatter.string(from: NSNumber(value: dataset.numberOfSites))!
        cell.subtitleLabel.text = "\(formattedNumber) trees"

        cell.locationView.isHidden = (dataset !== LocationService.instance.geocodeDataset)
        cell.checkView.isHidden = (dataset !== Dataset.current)
        return cell
    }

    ////////////////////////////////////////
    // UITableViewDelegate

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) 
    {
        Dataset.all[indexPath.row].load()

        if let cell = self.tableView.cellForRow(at:indexPath) as? DatasetTableViewCell
        {
            cell.checkView.isHidden = false
        }
    }

    func tableView(_ tableView: UITableView, didDeselectRowAt indexPath: IndexPath) 
    {
        if let cell = self.tableView.cellForRow(at:indexPath) as? DatasetTableViewCell
        {
            cell.checkView.isHidden = true
        }
    }
}
