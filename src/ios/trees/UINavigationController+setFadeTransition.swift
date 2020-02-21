import UIKit

extension UINavigationController
{
    func setFadeTransition()
    {
        let transition: CATransition = CATransition()
        transition.duration = 0.3
        transition.type = CATransitionType.fade
        self.view.layer.add(transition, forKey: nil)
    }
}



