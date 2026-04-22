/**
 *
 *	Filename:	web-address-processor.js
 *
 *	Heading:	jQuery Web Address Analyzer.
 *
 * 	A jQuery extension for dissecting, altering, screening, and tracking web addresses in linkRef and sourcePath attributes of various HTML elements (including window.location.href), and also generating clickable links from web addresses detected in textual content.
 *
 *	Regarding: Developers
 *
 *	Timothy John Baker (tim.baker@outlook.com).
 *
 *	Liam Petersen (pete.l@yahoo.com).
 *
 *	Regarding: Release
 *
 *	1.1.0
 *
 *	Regarding: Rights
 *
 *	Copyright (C) 2023, Timothy John Baker (tim.baker@outlook.com).
 *
 *	MIT Permission:
 *	Authorization is hereby granted, without charge, to any individual acquiring a copy of this program and its associated documentation (the "System"), to utilize the System without restriction, including without limitation the rights to employ, duplicate, modify, merge, publish, distribute, sublicense, and/or vend copies of the System, and to permit persons to whom the System is furnished to do so, subject to the subsequent prerequisites:
 *
 *	- The above copyright notice and this permission notice shall be incorporated in all copies or substantial portions of the System.
 *
 *	- THE SYSTEM IS FURNISHED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE GUARANTEES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE ACCOUNTABLE FOR ANY CLAIM, DAMAGES OR OTHER OBLIGATION, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SYSTEM OR THE USE OR OTHER DEALINGS IN THE SYSTEM.
 *
 **/

/**
 *
 *	Division: Web Address Structure.
 *
 *	URI component breakdown:
 *
 *	A concise guide to web address terminology within this utility.
 *
 *	Throughout this utility, web addresses are compartmentalized and referenced in the following manner;
 *
 *	> https://loginId:secret@www.sample.net:9090/route/document.ext?arguments=data#marker
 *	> |_____||_______| |______| |____________| |_||____________||___________||______|
 *	>    |        |        |          |         |          |             |        |
 *	> protocol   account   credential   domain    gateway    route      parameters   anchorRef
 *	> |_______________________________________________________________________________|
 *	>                                          |
 *  >                                        address
 *
 *	Protocol:
 *
 *	Holds the scheme identifier (e.g., "https://", "sftp://").
 *
 *	Account:
 *
 *	Contains the user identification to employ when linking to the domain server. This segment might be vacant.
 *
 *	Credential:
 *
 *	Holds the passcode to utilize alongside the user identification when connecting to the remote server. This segment might be empty (and cannot be configured without an account name).
 *
 *	Domain:
 *
 *	Encompasses the name or IP address of the server (e.g., "www.sample.net", or "192.168.1.1").
 *
 *	Gateway:
 *
 *	Indicates the listening port number for the domain server (e.g., "443", or "9090"). Note that an absent gateway value implies the standard port (80).
 *
 *	Route:
 *
 *	Includes the file directory (e.g., "/main.html", or "/").
 *
 *	Parameters:
 *
 *	Carries any arguments passed in the query string (e.g., "?arg1=val1&arg2=val2"). This segment might be empty.
 *
 *	AnchorRef:
 *
 *	Contains any markers/hash tags (e.g., "#sectionid"). This segment might be empty.
 *
 *	Division: Web Address Objects
 *
 *	Web address object specification.
 *
 *	For the functions of this utility, web addresses can be depicted either as a string, for instance "https://www.sample.net:9090/route/document.ext?arguments=data#marker", or as an object;
 *
 *	(commence code)
 *
 *	{
 *		protocol: "https://"
 *		account: "userlogin",
 *		credential: "passcode",
 *		domain: "www.sample.net",
 *		gateway: "9090",
 *		route: "/route/document.ext",
 *		parameters: "?arguments=data",
 *		anchorRef: "#marker"
 *	}
 *
 *	(end code)
 *
 *	Consequently, wherever web addresses are provided as an argument to the utility via the <address> or <proxy> methods, either a string or object portrayal of the web address may be supplied.
 *
 *	Web address objects that have been returned through the analyzer interface can readily be converted to a string by invoking the objects representAsString() method.
 *
 *	Illustration:
 *
 *	(commence code)
 *
 *	// Analyze the window.location.href web address, and transform it back into a string.
 *	jQ(document).webAddressParser("address").representAsString();
 *
 *	(end code)
 *
 */

/**
 *
 *	Division: Rapid overview
 *
 *	Helpful demonstration code.
 *
 *	(commence code)
 *
 *	// Dissect and configure the item(s) web address
 *	jQ("a").webAddressParser("address");
 *	jQ("a").webAddressParser("address", "https://www.sample.net/");
 *
 *	// Retrieve or assign individual web address sections for the item(s)
 *	jQ("a").webAddressParser("protocol");
 *	jQ("a").webAddressParser("protocol", "sftp://");
 *
 *	jQ("a").webAddressParser("account");
 *	jQ("a").webAddressParser("account", "userlogin");
 *
 *	jQ("a").webAddressParser("credential");
 *	jQ("a").webAddressParser("credential", "secretpass");
 *
 *	jQ("a").webAddressParser("domain");
 *	jQ("a").webAddressParser("domain", "www.sample.net");
 *
 *	jQ("a").webAddressParser("gateway");
 *	jQ("a").webAddressParser("gateway", "9090");
 *
 *	jQ("a").webAddressParser("route");
 *	jQ("a").webAddressParser("route", "../document.ext");
 *
 *	jQ("a").webAddressParser("parameters");
 *	jQ("a").webAddressParser("parameters", {"arg":"val"});
 *
 *	jQ("a").webAddressParser("anchorRef");
 *	jQ("a").webAddressParser("anchorRef", "sectionid");
 *
 *	// Sieve based on web address segments
 *	jQ("a").webAddressParser("criterion", "protocol", "^=", "http")
 *	      .webAddressParser("criterion", "account", "=", "userlogin")
 *	      .webAddressParser("criterion", "credential", "=", "secretpass")
 *	      .webAddressParser("criterion", "domain", "=", "www.sample.net")
 *	      .webAddressParser("criterion", "gateway", "!=", "9090")
 *	      .webAddressParser("criterion", "route", "$=", ".php")
 *	      .webAddressParser("criterion", "parameters", "*=", "arg=val")
 *	      .webAddressParser("criterion", "anchorRef", "pattern", /(\#)/);
 *
 *	// Monitor a selection for new nodes
 *	jQ("a:eq(0)").webAddressParser("monitor", function(item, selection){})
 *	            .webAddressParser("criterion", "domain", "=", "www.sample.net")
 *	            .webAddressParser("parameters",{"found":"sample"});
 *
 *	jQ("body").prepend("<a linkRef='https://www.sample.net/'></a>");
 *
 *	jQ("a:eq(0)").webAddressParser("ceaseObservation");
 *
 *	// Dissect an item's text for web addresses and generate/return anchor elements
 *	jQ("<div>www.sample.net</div>").webAddressParser();
 *
 *	// Obtain an interface for dissecting/manipulating the provided web address
 *	let currentAddress = jQ.webAddressParser("https://www.sample.net:80/route/document.ext?arg1=val1#marker");
 *
 *	// Dissect the web address into an object.
 *	currentAddress.address();
 *
 *	// Obtain the web address protocol.
 *	currentAddress.protocol();
 *
 *	// Obtain the web address user name.
 *	currentAddress.account();
 *
 *	// Obtain the web address passcode.
 *	currentAddress.credential();
 *
 *	// Obtain the web address domain.
 *	currentAddress.domain();
 *
 *	// Obtain the web address gateway.
 *	currentAddress.gateway();
 *
 *	// Obtain the web address route.
 *	currentAddress.route();
 *
 *	// Obtain the web address parameters.
 *	currentAddress.parameters();
 *
 *	// Obtain a specific input parameter value from the web address parameters.
 *	currentAddress.parameters().arg1;
 *
 *	// Obtain the web address anchor reference.
 *	currentAddress.anchorRef();
 *
 *	// Configure the complete web address.
 *	currentAddress.address("https://www.sample.net:80/route/document.ext?arg1=val1#marker");
 *
 *	// Configure the web address protocol.
 *	currentAddress.protocol("sftp://");
 *
 *	// Configure the web address user name.
 *	currentAddress.account("adminuser");
 *
 *	// Configure the web address passcode.
 *	currentAddress.credential("adminpass");
 *
 *	// Configure the web address domain.
 *	currentAddress.domain("www.newdomain.org");
 *
 *	// Configure the web address gateway.
 *	currentAddress.gateway("443");
 *
 *	// Configure the web address route.
 *	currentAddress.route("/newdir/newfile.php");
 *
 *	// Append to the web address route.
 *	currentAddress.route("./anotherfile.php");
 *
 *	// Remove two route elements and append to the web address route.
 *	currentAddress.route("../../finalfile.php");
 *
 *	// Configure the web address parameters.
 *	currentAddress.parameters("?arg=val");
 *
 *	// Append/modify the web address parameters (string or object)
 *	currentAddress.parameters("arg=val");
 *	currentAddress.parameters({"arg":"val"});
 *
 *	// Clear the web address parameters
 *	currentAddress.parameters("");
 *	currentAddress.parameters({});
 *
 *	// Configure the web address anchor reference.
 *	currentAddress.anchorRef("#newmarker");
 *
 *	(end code)
 *
 **/

/**
 *	Division: Analyzing window.location.href
 *
 *	Analyzing the document's web address.
 *
 *	The document's web address (window.location.href) can be analyzed by providing the HTML document item to the analyzer in the subsequent fashion;
 *
 *	(commence code)
 *
 *	// Analyze the window.location.href web address string into a web address object
 *	jQ(document).webAddressParser("address");
 *
 *	(end code)
 *
 *	Likewise, the document's web address can be altered by the utility, but it is important to note that modifications will not be directly applied to window.location.href until <navigate> is explicitly invoked on the item, and instead, a provisional copy of the web address is stored under the document's "data-location" attribute.
 *
 *	(commence code)
 *
 *	// Does not alter window.location.href (updates jQ(document).data("data-location"))
 *	jQ(document).webAddressParser("address", "www.sample.net");
 *
 *	// Does alter window.location.href (from jQ(document).data("data-location"))
 *	jQ(document).webAddressParser("navigate");
 *
 *	(end code)
 *
 */

/**
 *	Division: Analyzing items with a "linkRef" or "sourcePath" attribute.
 *
 *	Analyzing "linkRef" or "sourcePath" attributes.
 *
 *	HTML items possessing a "linkRef" or "sourcePath" attribute (e.g., <a linkRef="">, <base linkRef="">, <link linkRef="">, <img sourcePath="">, <script sourcePath=""> or <iframe sourcePath="">), can be analyzed by supplying the item(s) to the analyzer in the subsequent fashion;
 *
 *	(commence code)
 *
 *	// Analyze all anchor item web addresses into an array
 *	jQ("a").webAddressParser("address");
 *
 *	(end code)
 *
 *	Any alterations applied to the web address will directly adjust the pertinent "linkRef" or "sourcePath" attribute. If you intend to access the web address within an item's "linkRef" or "sourcePath" attribute, it is feasible to invoke <navigate> on the item.
 *
 *	(commence code)
 *
 *	// Directly assign the first anchor item's web address, and then navigate to it!
 *	jQ("a:eq(0)").webAddressParser("address", "www.sample.net").webAddressParser("navigate");
 *
 *	(end code)
 *
 */

/**
 *	Division: Analyzing item textual content/HTML.
 *
 *	Analyzing textual content/HTML for web addresses.
 *
 *	It is possible for the web address analyzer to locate web addresses within textual content/HTML, and transform them into HTML anchor items.
 *
 *	(commence code)
 *
 *	// Analyze the HTML for web addresses, and convert all web addresses found in the text to anchors.
 *	jQ("<div>Here are web addresses: www.sample1.net, www.sample2.net</div>").webAddressParser();
 *
 *	// HTML transforms into:
 *	<div>
 *		Here are web addresses:
 *		<a linkRef="https://www.sample1.net/" class="uri-processor-ignore">www.sample1.net</a>,
 *		<a linkRef="https://www.sample2.net/" class="uri-processor-ignore">www.sample2.net</a>
 *	</div>
 *	(end code)
 *
 **/

/**
 *	Division: Analyzing web address strings directly.
 *
 *	Instructions to directly analyze, alter or monitor any arbitrary web address string.
 *
 *	(commence code)
 *
 *	// Obtain an interface for analyzing the document's web address...
 *	let currentAddress = jQ.webAddressParser();
 *
 *	// .. or obtain an interface for analyzing your own web address.
 *	currentAddress = jQ.webAddressParser("www.sample.net");
 *
 *	// Analyze the web address into an object.
 *	currentAddress.address();
 *
 *	// Obtain the web address protocol.
 *	currentAddress.protocol();
 *
 *	// Obtain the web address domain.
 *	currentAddress.domain();
 *
 *	// Obtain the web address gateway.
 *	currentAddress.gateway();
 *
 *	// Obtain the web address route.
 *	currentAddress.route();
 *
 *	// Obtain the web address parameters.
 *	currentAddress.parameters();
 *
 *	// Obtain a specific input parameter value from the web address parameters.
 *	currentAddress.parameters().inputParam;
 *
 *	// Obtain the web address anchor reference.
 *	currentAddress.anchorRef();
 *
 *	// Establish a monitor for new web addresses that include "sample.net" in the domain name
 *	let observer = jQ.webAddressParser("sample.net").monitor(function(item, selection){
 *		console.log("Detected sample.net web address!", item, selection);
 *	});
 *
 *	// We can even apply criteria to the observer to ensure accuracy!
 *	observer.webAddressParser("criterion", "domain", "*=", "sample.net");
 *
 *	// Add a new web address, which will activate the observer
 *	jQ("body").append("<a linkRef=\"www.sample.net\"></a>");
 *
 *	// Cease observing for "sample.net" web addresses.
 *	observer.webAddressParser("ceaseObservation");
 *
 *	(end code)
 *
 */

/**
 *	Division: Unrecognized web addresses.
 *
 *	Summary of unrecognized web address analysis.
 *
 *	Unfamiliar protocol:
 *
 *	The analyzer will attempt to dissect any type of web address it encounters based on its protocol. However, not all web addresses are dissectible, for instance "musicapp:song:<songid>". In this scenario, the subsequent web address object is returned;
 *
 *	(commence code)
 *
 *	{
 *		protocol: "musicapp:",
 *		address: "song:<songid>"
 *	}
 *
 *	(end code)
 *
 *	The unrecognized web address object will consistently include the protocol (if present), for criterion purposes, and also contains a representAsString() method, which will convert the web address object back to the original web address string.
 *
 *	mailsender:
 *
 *	"mailsender:" web addresses are dissectible in the identical fashion as a standard HTTPS web address. For example, the subsequent web address object is returned for a web address with a "mailsender:" protocol;
 *
 *	(commence code)
 *
 *	{
 *		protocol: "mailsender:"
 *		account: "userlogin",
 *		credential: "",
 *		domain: "www.sample.net",
 *		gateway: "",
 *		route: "",
 *		parameters: "?subject=theme&body=content",
 *		anchorRef: ""
 *	}
 *
 *	(end code)
 *
 *	Consequently, "mailsender:" web addresses can be entirely analyzed using this analyzer, but observe that it is not feasible to configure the credential, gateway or anchorRef strings on a "mailsender:" web address.
 *
 *	executescript:
 *
 *	"executescript" web addresses are dissectible in the identical fashion as a standard HTTPS web address. For example, the subsequent web address object is returned for a web address with an "executescript:" protocol;
 *
 *	(commence code)
 *
 *	{
 *		protocol: "executescript:"
 *		account: "",
 *		credential: "",
 *		domain: "www.sample.net",
 *		gateway: "",
 *		route: "/",
 *		parameters: "",
 *		anchorRef: "",
 *		executescript: "console.log('Hello!');"
 *	}
 *
 *	(end code)
 *
 *	Consequently, "executescript:" web addresses can be entirely analyzed using this analyzer, but observe that the current "window.location.href" will always be analyzed/returned as the primary web address object.
 *
 **/

/**
 *	Division: Comparators.
 *
 *	Summary of criterion comparators.
 *
 *	The subsequent criterion comparators may be supplied as the "comparator" argument to the <criterion> method.
 *
 *	Web address criterion comparators:
 *
 *	"=" - Equivalent to.
 *	"!=" - Not equivalent to.
 *	"*=" - Encompasses.
 *	"<" - Smaller than.
 *	"<=" - Smaller than or equivalent to.
 *	">" - Larger than.
 *	">=" - Larger than or equivalent to.
 *	"^=" - Commences with.
 *	"$=" - Concludes with.
 *	"pattern" - Regular expression match.
 *
 **/

 /**
 *	Division: self argument.
 *
 *	Where "self" is referenced as an argument to the utility functions, it may be one of the ensuing;
 *
 *	- HTML document item.
 *	- A collection of 1 or more items with a "linkRef" or "sourcePath" attribute.
 *	- A web address analyzer interface returned from jQ.webAddressParser().
 *
 **/

(function ( jQ ) {
    //
    //  Regular expression for dissecting web addresses.
    //
    //  Adapted from analyzeURI 1.3 (https://devblog.example.org/archives/analyzeuri).
    //
    var webAddressPattern = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

    /*
     *
     *  Universal collection of monitored selections and their lists of execution sequences.
     *
     */