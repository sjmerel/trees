import Foundation
import UIKit

class Species: Equatable
{
    init(json: JsonObject)
    {
        self.botanicalName = json["name_botanical"] as! String
        self.commonNames = json["name_common"] as! [String]
        self.wikipediaTitle = json["wp_link"] as! String
        self.treeCount = json["count"] as! Int

        let color = (json["color"] as! [NSNumber]).map({ CGFloat($0.floatValue) })
        self.markerColor = UIColor(red:color[0], green:color[1], blue:color[2], alpha:1.0)

        let hierJson = json["hierarchy"] as! JsonObject
        var hier = [Taxon]()
        func add(rank: TaxonomicRank)
        {
            if let name = hierJson[rank.rawValue] as? String
            {
                let wpTitle = hierJson[rank.rawValue + "_wp"] as? String
                hier.append(Taxon(rank:rank, name:name, wikipediaTitle:wpTitle))
            }
        }
        for rank in TaxonomicRank.allCases
        {
            add(rank: rank)
        }
        self.hierarchy = hier
    }

    public let botanicalName: String
    public let commonNames: [String]
    public let wikipediaTitle: String
    public let markerColor: UIColor
    public let treeCount: Int

    public let hierarchy: [Taxon]


    /*
    ////////////////////////////////////////
    // Hashable

    var hashValue: Int 
    { 
        get { return self.botanicalName.hashValue }
    }
    */


    ////////////////////////////////////////
    // Equatable

    static func == (lhs: Species, rhs: Species) -> Bool
    {
        return lhs.botanicalName == rhs.botanicalName
    }

}
