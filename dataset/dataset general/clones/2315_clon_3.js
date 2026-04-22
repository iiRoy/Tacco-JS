// File: web_address_processor.js

/*
 *  Module: Web Address Utility for jQuery
 *
 *  Description:
 *  A comprehensive jQuery plugin designed for parsing, manipulating, filtering, and monitoring
 *  Uniform Resource Locators (URLs) found in various HTML attributes (like 'href', 'src')
 *  or within text content. It also supports direct processing of `document.location.href`
 *  and the creation of hyperlink elements from raw web addresses.
 *
 *  Contributors:
 *  - Thomas James Bonner (original architect)
 *  - Yonas Sandbæk (key developer)
 *  - Anonymous Refactorer (structural enhancements and modernization)
 *
 *  Current Revision: 1.0.5-alpha
 *
 *  License Information:
 *  This software is provided under the terms of the MIT License.
 *  Full details are available in the project repository.
 *  (C) 2012-2023. All rights reserved by original authors and contributors.
 */

/*
 *  Conceptual Breakdown: URL Components
 *
 *  A simplified guide to how this utility segments and refers to web addresses.
 *
 *  Example URL: `https://user:pass@www.example.org:8443/content/page.html?data=value&id=123#section-id`
 *  Segments:
 *  - Protocol: `https://` (e.g., 'http', 'https', 'ftp')
 *  - Credentials: `user:pass` (user and password for authentication)
 *  - Hostname: `www.example.org` (domain name or IP address)
 *  - PortNumber: `8443` (server communication port, default is often implied)
 *  - ResourcePath: `/content/page.html` (specific location on the server)
 *  - QueryParameters: `?data=value&id=123` (additional data passed to the resource)
 *  - PageAnchor: `#section-id` (internal page reference)
 *
 *  The entire string represents the complete Uniform Resource Locator.
 *
 *  Details of each part:
 *  - Protocol: Identifies the communication scheme (e.g., "http:", "ftp:").
 *  - User: Optional username for server access. Can be empty.
 *  - Pass: Optional password for server access, paired with a username.
 *  - Host: Server's domain or IP (e.g., "example.com", "192.168.1.1").
 *  - Port: Specific port for host connection (e.g., "80", "443"). Default is often 80/443.
 *  - Path: File or directory path on the server (e.g., "/index.php", "/").
 *  - Query: Key-value pairs for server-side processing (e.g., "?key=val"). May be absent.
 *  - Fragment: Client-side identifier within the resource (e.g., "#top"). May be absent.
 */

/*
 *  Data Representation: Web Address Objects
 *
 *  This utility can interpret URLs as strings or as structured JavaScript objects.
 *
 *  String form: "https://www.example.com:8080/path/file.name?query=string#anchor"
 *
 *  Object form example:
 *  (code block start)
 *  {
 *      protocol: "https:",
 *      user: "guest",
 *      pass: "secret",
 *      hostname: "www.example.com",
 *      portNumber: "8080",
 *      resourcePath: "/path/file.name",
 *      queryParameters: "?query=string",
 *      pageAnchor: "#anchor"
 *  }
 *  (code block end)
 *
 *  When providing URLs to the plugin methods, either the string or object format is acceptable.
 *  Parsed URL objects returned by the plugin include a `toCanonicalString()` method
 *  for easy conversion back to their standard string representation.
 *
 *  Illustrative Use:
 *  (code block start)
 *  // Parse current document's URL and then convert it back to a string.
 *  jq(document).webAddressUtil("address").toCanonicalString();
 *  (code block end)
 */

/*
 *  Quick Start Guide: Common Operations
 *
 *  Practical examples of using the utility.
 *
 *  (code block start)
 *
 *  // Set or retrieve the full URL for selected elements
 *  jq("a").webAddressUtil("address");
 *  jq("a").webAddressUtil("address", "http://new.domain.net/");
 *
 *  // Access or modify individual URL components
 *  jq("a").webAddressUtil("protocol");
 *  jq("a").webAddressUtil("protocol", "ftp:");
 *
 *  jq("a").webAddressUtil("user");
 *  jq("a").webAddressUtil("user", "admin");
 *
 *  jq("a").webAddressUtil("pass");
 *  jq("a").webAddressUtil("pass", "secure_pass");
 *
 *  jq("a").webAddressUtil("hostname");
 *  jq("a").webAddressUtil("hostname", "sub.host.org");
 *
 *  jq("a").webAddressUtil("portNumber");
 *  jq("a").webAddressUtil("portNumber", "9000");
 *
 *  jq("a").webAddressUtil("resourcePath");
 *  jq("a").webAddressUtil("resourcePath", "/directory/document.pdf");
 *
 *  jq("a").webAddressUtil("queryParameters");
 *  jq("a").webAddressUtil("queryParameters", { "item": "value_one" });
 *
 *  jq("a").webAddressUtil("pageAnchor");
 *  jq("a").webAddressUtil("pageAnchor", "bottom-section");
 *
 *  // Filter elements based on URL segments
 *  jq("a").webAddressUtil("filterBy", "protocol", "starts-with", "https")
 *         .webAddressUtil("filterBy", "user", "equals", "sysadmin")
 *         .webAddressUtil("filterBy", "hostname", "contains", "mycompany")
 *         .webAddressUtil("filterBy", "portNumber", "not-equals", "80")
 *         .webAddressUtil("filterBy", "resourcePath", "ends-with", ".json")
 *         .webAddressUtil("filterBy", "queryParameters", "contains", "status=active")
 *         .webAddressUtil("filterBy", "pageAnchor", "regex", /^\#top/i);
 *
 *  // Monitor newly added DOM elements matching a selector
 *  let elementMonitor = jq("div#main").webAddressUtil("monitor", function(elementNode, monitoredSelector){
 *      console.log("New element detected:", elementNode, "Matching:", monitoredSelector);
 *  });
 *  // Add additional filtering to the monitor
 *  elementMonitor.webAddressUtil("filterBy", "hostname", "equals", "external.com");
 *
 *  // Simulate adding a new element that might trigger the monitor
 *  jq("body").append("<a href='http://external.com/data.php'>External Link</a>");
 *
 *  // Discontinue monitoring
 *  elementMonitor.webAddressUtil("unmonitor");
 *
 *  // Convert plain text URLs within an element into active hyperlinks
 *  jq("<span>Visit us at example.com or news.org</span>").webAddressUtil();
 *
 *  // Obtain an isolated parsing interface for a specific URL string
 *  let urlHandle = jq.webAddressUtil("http://host.name:8080/path/file.ext?p1=v1#frag");
 *
 *  // Interact with the isolated URL handle
 *  urlHandle.address(); // Get full object
 *  urlHandle.protocol();
 *  urlHandle.hostname();
 *  urlHandle.queryParameters().p1; // Access specific query param
 *  urlHandle.setHostname("new.host");
 *  urlHandle.toCanonicalString(); // Get updated URL string
 *
 *  (code block end)
 *
 */

/*
 *  Section: Handling the Document's Own URL
 *
 *  Parsing and modifying `document.location.href`.
 *
 *  To parse the current page's URL:
 *  (code block start)
 *  // Retrieve the document's URL as a structured object
 *  jq(document).webAddressUtil("address");
 *  (code block end)
 *
 *  Modifications to the document's URL are initially applied to an internal working copy,
 *  typically stored in a custom `data-current-uri` attribute on the document object.
 *  The actual browser address bar (`document.location.href`) is only updated
 *  when the `navigate` command is explicitly invoked.
 *
 *  (code block start)
 *  // This updates the internal representation, not the browser's URL directly
 *  jq(document).webAddressUtil("address", "https://new-site.com");
 *
 *  // This command commits the internal URL to `document.location.href`
 *  jq(document).webAddressUtil("navigate");
 *  (code block end)
 */

/*
 *  Section: Processing Elements with URI Attributes
 *
 *  Working with `href` or `src` attributes on DOM elements.
 *
 *  Elements like `<a>`, `<link>`, `<img>`, `<script>`, `<iframe>` which possess
 *  `href` or `src` attributes can be processed by targeting them with the utility:
 *
 *  (code block start)
 *  // Parse all anchor element URLs into an array of URI objects
 *  jq("a").webAddressUtil("address");
 *  (code block end)
 *
 *  Any changes made to the URI via the plugin will directly update the respective
 *  `href` or `src` attribute of the element. To instruct the browser to visit
 *  the updated URL, use the `navigate` command.
 *
 *  (code block start)
 *  // Update the first anchor's URL and then trigger navigation to it
 *  jq("a:first").webAddressUtil("address", "http://target.com/").webAddressUtil("navigate");
 *  (code block end)
 */

/*
 *  Section: Extracting URLs from Textual Content
 *
 *  Identifying and converting URLs within arbitrary text or HTML.
 *
 *  The utility can scan provided text or HTML content for recognizable URLs
 *  and automatically transform them into clickable HTML anchor elements.
 *
 *  (code block start)
 *  // Process a div's content to linkify URLs
 *  jq("<div>Check out example.com and another.net for details.</div>").webAddressUtil();
 *
 *  // Resulting HTML (simplified):
 *  // <div>
 *  //     Check out
 *  //     <a href="http://example.com/" class="wa-no-monitor">example.com</a>
 *  //     and
 *  //     <a href="http://another.net/" class="wa-no-monitor">another.net</a>
 *  //     for details.
 *  // </div>
 *  (code block end)
 */

/*
 *  Section: Direct URL String Manipulation
 *
 *  How to parse, modify, or observe an arbitrary URL string independently.
 *
 *  (code block start)
 *
 *  // Get a fresh interface for the current document's URL...
 *  let uriInstance = jq.webAddressUtil();
 *
 *  // ...or for a custom URL string.
 *  uriInstance = jq.webAddressUtil("https://custom.host/page?param=val#section");
 *
 *  // Retrieve various components
 *  uriInstance.address();
 *  uriInstance.protocol();
 *  uriInstance.hostname();
 *  uriInstance.queryParameters().param;
 *
 *  // Set a new fragment
 *  uriInstance.setPageAnchor("#new-section");
 *
 *  // Establish a monitor for URLs containing "custom.host"
 *  let hostMonitor = jq.webAddressUtil("custom.host").monitor(function(elem, sel){
 *      console.log("URL with custom.host detected!", elem, sel);
 *  });
 *
 *  // Refine the monitor with additional filters
 *  hostMonitor.webAddressUtil("filterBy", "hostname", "contains", "custom.host");
 *
 *  // Adding an element that matches will trigger the monitor
 *  jq("body").append("<a href=\"http://custom.host/test\">Test Link</a>");
 *
 *  // Disable the specific monitor
 *  hostMonitor.webAddressUtil("unmonitor");
 *
 *  (code block end)
 */

/*
 *  Section: Special URI Cases
 *
 *  Overview of how non-standard or 'unknown' URLs are handled.
 *
 *  Unrecognized Schemes:
 *
 *  For schemes not fully supported (e.g., "spotify:track:<id>"), the utility
 *  returns a simplified object.
 *
 *  (code block start)
 *  {
 *      protocol: "spotify:",
 *      fullPath: "track:<trackid>"
 *  }
 *  (code block end)
 *
 *  This simplified object always includes the `protocol` (if present, for filtering)
 *  and a `toCanonicalString()` method to reconstruct the original URL.
 *
 *  mailto: URIs:
 *
 *  "mailto:" URLs are largely parsable similar to HTTP.
 *  (code block start)
 *  {
 *      protocol: "mailto:",
 *      user: "recipient",
 *      pass: "", // Not applicable for mailto
 *      hostname: "domain.com",
 *      portNumber: "", // Not applicable
 *      resourcePath: "",
 *      queryParameters: "?subject=Hello&body=Message",
 *      pageAnchor: "" // Not applicable
 *  }
 *  (code block end)
 *
 *  Note that `pass`, `portNumber`, and `pageAnchor` components are generally not
 *  meaningful or settable for "mailto:" URLs.
 *
 *  javascript: URIs:
 *
 *  "javascript:" URLs are also parsed, with the script content extracted.
 *  (code block start)
 *  {
 *      protocol: "javascript:",
 *      user: "",
 *      pass: "",
 *      hostname: "current-host.com", // Often defaults to current document host
 *      portNumber: "",
 *      resourcePath: "/",
 *      queryParameters: "",
 *      pageAnchor: "",
 *      scriptContent: "alert('Hello!');"
 *  }
 *  (code block end)
 *
 *  For `javascript:` URIs, the `hostname` will typically reflect the current document's host.
 */

/*
 *  Section: Comparison & Filter Operations
 *
 *  Available operators for the `filterBy` method.
 *
 *  Supported Operators:
 *
 *  - "equals" (`=`)        : Exact match.
 *  - "not-equals" (`!=`)   : Not an exact match.
 *  - "contains" (`*=`)     : Substring found within.
 *  - "starts-with" (`^=`)  : Begins with the specified value.
 *  - "ends-with" (`$=`)    : Ends with the specified value.
 *  - "less-than" (`<`)     : Numeric comparison.
 *  - "less-or-equal" (`<=`): Numeric comparison.
 *  - "greater-than" (`>`)  : Numeric comparison.
 *  - "greater-or-equal" (`>=`): Numeric comparison.
 *  - "regex"               : Matches a regular expression pattern.
 *
 */

/*
 *  Contextual Parameter: `this` Reference
 *
 *  When `this` is passed as an argument to utility functions, it can represent:
 *
 *  - The main HTML document object.
 *  - A jQuery collection (array-like object) of DOM elements, each possessing
 *    either an `href` or `src` attribute.
 *  - An independent URI parsing interface returned by `jq.webAddressUtil()`.
 *
 */

(
	function ( jq )
	{
		"use strict"; // Enforce stricter parsing and error handling.

		/*
		 *  Core regular expression for dissecting Uniform Resource Identifiers.
		 *
		 *  This pattern is adapted from a well-known URI parsing algorithm,
		 *  originally developed for robust and comprehensive web address deconstruction.
		 *  It identifies various components including protocol, authentication, host, port,
		 *  path, query string, and fragment identifier.
		 *
		 *  Pattern breakdown (simplified):
		 *  1. Protocol (e.g., 'http:')
		 *  2. User/Pass (e.g., 'user:pass@')
		 *  3. Hostname (e.g., 'www.domain.com')
		 *  4. Port (e.g., ':8080')
		 *  5. Path (e.g., '/dir/file.ext')
		 *  6. Query (e.g., '?key=value')
		 *  7. Fragment (e.g., '#anchor')
		 */
		const uriDissectionPattern = (function() {
			const protocolPart = '(?:(?![^:@]+:[^:@\\/]*@)([^:\\/?#.]+):)?';
			const authorityPart = '(?:\\/\\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))?)';
			const pathQueryFragmentPart = '(((\\/[^?#]*(?:\\.[^?#\\/.]+)?(?:[?#]|$))*(\\/[^?#\\/]*))?(?:\\?([^#]*))?(?:#(.*))?)';
			return new RegExp('^' + protocolPart + authorityPart + pathQueryFragmentPart);
		})();


		/*
		 *  A central registry for managing active observation instances.
		 *  Each entry maps a unique identifier to a collection of callbacks
		 *  and filters associated with DOM mutation monitoring.
		 *  This structure facilitates efficient lookup and management of
		 *  elements whose URL attributes are being watched for changes or additions.
		 */
		const activeObservationRegistry = Object.create(null); // Using Object.create(null) for a cleaner map without prototype pollution.

		// Additional helper variables (Type III addition)
		const PROTOCOL_SEPARATOR = '://';
		const FRAGMENT_PREFIX = '#';
		const QUERY_PREFIX = '?';

		// Placeholder for potential future validation utility (Type III addition)
		function isValidUriComponent(componentValue) {
		    // Simple check, can be expanded for more rigorous validation
		    return typeof componentValue === 'string' && componentValue.length > 0;
		}

		// Initial setup or configuration object (Type III addition)
		const config = {
			defaultProtocol: 'http:',
			defaultPort: {
				'http:': '80',
				'https:': '443',
				'ftp:': '21'
			},
			linkifyClass: 'wa-auto-link',
			noWatchClass: 'wa-no-monitor'
		};

		// The actual plugin methods would be defined here, e.g.:
		// jq.fn.webAddressUtil = function(command, ...args) { ... };
		// jq.webAddressUtil = function(uriString) { ... };

		// End of initial setup
	}
)( window.jQuery ); // Pass window.jQuery for robustness