import Foundation

class Site: QtElement
{
    init(json: JsonObject, species: Species)
    {
        self.location = QtLocation(json: json)
        self.species = species
    }

    init(location: QtLocation, species: Species)
    {
        self.location = location
        self.species = species
    }

    public let location: QtLocation
    public let species: Species
}

