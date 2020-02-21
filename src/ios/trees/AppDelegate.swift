import UIKit
import GoogleMaps
import Fabric
import Crashlytics
import StoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate 
{
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool 
    {
        Fabric.with([Crashlytics.self])
        GMSServices.provideAPIKey("AIzaSyDyJpV5HGstJM1asxpa6siDOW-tiDsYd5Q")
        // GMSPlacesClient.provideAPIKey("AIzaSyDyJpV5HGstJM1asxpa6siDOW-tiDsYd5Q")

        if #available(iOS 10.3, *)
        {
            let launches = UserDefaults.standard.integer(forKey: "launches")
            print("launches: \(launches)")
            if launches > 2
            {
                self.ratingTimer = Timer.scheduledTimer(withTimeInterval: 180, repeats: false)
                {
                    timer in
                    SKStoreReviewController.requestReview()
                }
            }
            UserDefaults.standard.set(launches+1, forKey: "launches")
        }
        
        return true
    }

    private var ratingTimer: Timer!

}

