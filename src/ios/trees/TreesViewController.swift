import UIKit

class TreesViewController: UIViewController, UITableViewDataSource, UITableViewDelegate
{
    override func viewDidLoad() 
    {
        super.viewDidLoad()

        Dataset.didLoad.add(tag: self)
        {
            dataset in
            self.tableView.reloadData()
        }
    }

    @IBOutlet weak var tableView: UITableView!

    ////////////////////////////////////////
    // UITableViewDataSource

    func numberOfSections(in: UITableView) -> Int
    {
        return Dataset.current?.familyArray.count ?? 0
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    {
        return Dataset.current!.familyArray[section].count 
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell
    {
        let cell = tableView.dequeueReusableCell(withIdentifier:"cell_id") as! TreeTableViewCell
        let species = Dataset.current!.familyArray[indexPath.section][indexPath.row]

        cell.botanicalNameLabel.text = "\(species.botanicalName)"
        cell.markerView.fillColor = species.markerColor
        cell.wikipediaButton.wikipediaTitle = species.wikipediaTitle
        cell.commonNamesLabel.text = species.commonNames.reduce("", { x, y in x + (x.isEmpty ? "" : ", ") + y })
        cell.countLabel.text = "\(species.treeCount) trees"
        //cell.countLabel.text = "\(species.hierarchy[2].name)/\(species.hierarchy[3].name)/\(species.hierarchy[4].name)"

        return cell
    }

    func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String?
    {
        let hierarchy = Dataset.current!.familyArray[section].first!.hierarchy
        // return hierarchy[0...4].map({"\($0.rank): \($0.name)"}).joined(separator:"\n")
        return hierarchy[4].name // family
    }

    ////////////////////////////////////////
    // UITableViewDelegate

    /*
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) 
    {
        let cell = tableView.cellForRow(at:indexPath)! as! TreeTableViewCell
        tableView.beginUpdates()
        cell.infoView.setExpanded(true, duration: 0)
        tableView.endUpdates()
    }

    func tableView(_ tableView: UITableView, didDeselectRowAt indexPath: IndexPath) 
    {
        let cell = tableView.cellForRow(at:indexPath)! as! TreeTableViewCell
        tableView.beginUpdates()
        cell.infoView.setExpanded(false, duration: 0)
        tableView.endUpdates()
    }
    */
}

