import Foundation 

typealias JsonArray = [Any?]

extension Array where Element: Any
{
    static func load(filename: String) -> JsonArray
    {
        let url = Bundle.main.url(forResource:filename, withExtension:nil)!
        let data = try! Data(contentsOf:url)
        return try! JSONSerialization.jsonObject(with:data) as! JsonArray
    }
}


