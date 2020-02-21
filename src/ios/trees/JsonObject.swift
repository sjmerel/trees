import Foundation 

typealias JsonObject = [String:Any]

extension Dictionary where Key == String
{
    static func load(filename: String) -> JsonObject
    {
        let url = Bundle.main.url(forResource:filename, withExtension:nil)!
        let data = try! Data(contentsOf:url)
        return try! JSONSerialization.jsonObject(with:data) as! JsonObject
    }
}

