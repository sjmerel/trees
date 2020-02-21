import UIKit
import WebKit

class InfoViewController: UIViewController, WKNavigationDelegate
{
    override func loadView() 
    {
        // https://stackoverflow.com/questions/40452034/disable-zoom-in-wkwebview
        let source: String = "var meta = document.createElement('meta');" +
        "meta.name = 'viewport';" +
        "meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';" +
        "var head = document.getElementsByTagName('head')[0];" + "head.appendChild(meta);";

        let script = WKUserScript(source: source, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        let userContentController = WKUserContentController()
        let conf = WKWebViewConfiguration()
        conf.userContentController = userContentController
        userContentController.addUserScript(script)

        self.webView = WKWebView(frame: .zero, configuration: conf)
        self.webView.allowsBackForwardNavigationGestures = false
        self.webView.navigationDelegate = self
        self.view = webView
    }

    override func viewDidLoad() 
    {
        super.viewDidLoad()

        let url = Bundle.main.url(forResource: "about", withExtension: "html")!
        self.webView.load(URLRequest(url:url))
    }

    ////////////////////////////////////////

    private var webView: WKWebView!

    @IBAction func closeButtonPressed()
    {
        self.navigationController!.setFadeTransition()
        self.navigationController!.popViewController(animated:false)
    }

    ////////////////////////////////////////
    // WKWebViewNavigationDelegate

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) 
    {
        if navigationAction.navigationType == .linkActivated  
        {
            if let url = navigationAction.request.url
            {
                if #available(iOS 10.0, *)
                {
                    UIApplication.shared.open(url)
                }
                else
                {
                    UIApplication.shared.openURL(url)
                }
                decisionHandler(.cancel)
            }
            else
            {
                decisionHandler(.allow)
            }
        } 
        else 
        {
            decisionHandler(.allow)
        }
    }
}
