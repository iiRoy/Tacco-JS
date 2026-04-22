/*
 * File: jurlp.js
 *
 * Title: JQuery URL parser.
 *
 * JQuery URL parser plugin for parsing, manipulating, filtering and monitoring URLs in href and src attributes within arbitrary elements
 * (including document.location.href), as well as creating anchor elements from URLs found in HTML/text.
 *
 * About: Authors
 *
 * Thomas James Bonner (tom.bonner@gmail.com).
 *
 * Yonas Sandbæk (seltar@gmail.com).
 *
 * About: Version
 *
 * 1.0.4
 *
 * About: License
 *
 * Copyright (C) 2012, Thomas James Bonner (tom.bonner@gmail.com).
 *
 * MIT License:
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files ("Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * - The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/* Section: URL overview.
 *
 * URL naming scheme:
 * A quick guide to URL nomenclature in this plugin.
 *
 * Throughout this plugin, URLs are segmented and referred to in the following manner:
 *
 * > http://username:password@www.example.com:443/path/file.name?query=string#anchor
 * > |_____||______| |______| |_____________| |_||_____________||___________||_____|
 * >    |       |       |           |          |         |             |         |
 * > scheme   user   password      host       port      path         query   fragment
 * > |______________________________________________________________________________|
 * >                                        |
 * >                                       url
 *
 * Scheme:
 * Contains the protocol identifier (e.g., "https://", "ftp://").
 *
 * User:
 * Contains the username to use when connecting to the host server. This segment may be empty.
 *
 * Password:
 * Contains the password to use in conjunction with the username when connecting to the remote server.
 * This segment may be empty (and cannot be set without a user name).
 *
 * Host:
 * Contains the name or IP address of the host server (e.g., "www.example.com", or "127.0.0.1").
 *
 * Port:
 * Contains the listening port number for the host server (e.g., "80", or "8080").
 * Note that an empty port value implies the default port (80).
 *
 * Path:
 * Contains the file path (e.g., "/index.html", or "/").
 *
 * Query:
 * Contains any parameters passed in the query (e.g., "?param1=value1&param2=value2"). This segment may be empty.
 *
 * Fragment:
 * Contains any anchors/hash tags (e.g., "#elementname"). This segment may be empty.
 *
 * Section: URL Objects
 *
 * URL object definition.
 *
 * For the purposes of this plugin, URLs can be represented either as a string, for example
 * "http://www.example.com:8080/path/file.name?query=string#anchor", or as an object:
 *
 * (start code)
 * {
 *   scheme: "http://",
 *   user: "username",
 *   password: "password",
 *   host: "www.example.com",
 *   port: "8080",
 *   path: "/path/file.name",
 *   query: "?query=string",
 *   fragment: "#anchor"
 * }
 * (end code)
 *
 * Therefore, wherever URLs are supplied as a parameter to the plugin via the <url> or <proxy> methods,
 * either a string or object representation of the URL may be supplied.
 *
 * URL objects that have been returned via the parser interface can easily be converted to a string
 * by calling the objects toString() method.
 *
 * Example:
 *
 * (start code)
 * // Parse the document.location.href URL, and convert it back to a string again.
 * $(document).jurlp("url").toString();
 * (end code)
 *
 */

/*
 * Section: Quick overview
 *
 * Useful example code snippets.
 *
 * (start code)
 *
 * // Parse and set the element(s) URL
 * $("a").jurlp("url");
 * $("a").jurlp("url", "http://www.example.com/");
 *
 * // Get or set individual URL segments for the element(s)
 * $("a").jurlp("scheme");
 * $("a").jurlp("scheme", "https://");
 *
 * $("a").jurlp("user");
 * $("a").jurlp("user", "username");
 *
 * $("a").jurlp("password");
 * $("a").jurlp("password", "password");
 *
 * $("a").jurlp("host");
 * $("a").jurlp("host", "www.example.com");
 *
 * $("a").jurlp("port");
 * $("a").jurlp("port", "8080");
 *
 * $("a").jurlp("path");
 * $("a").jurlp("path", "../file.name");
 *
 * $("a").jurlp("query");
 * $("a").jurlp("query", { "param": "value" });
 *
 * $("a").jurlp("fragment");
 * $("a").jurlp("fragment", "elementid");
 *
 * // Filter on URL segments
 * $("a") .jurlp("filter", "scheme", "^=", "http")
 *        .jurlp("filter", "user", "=", "user")
 *        .jurlp("filter", "password", "=", "password")
 *        .jurlp("filter", "host", "=", "www.example.com")
 *        .jurlp("filter", "port", "!=", "8080")
 *        .jurlp("filter", "path", "$=", ".html")
 *        .jurlp("filter", "query", "*=", "param=value")
 *        .jurlp("filter", "fragment", "regex", /(\#)/);
 *
 * // Watch a selector for new nodes
 * $("a:eq(0)")
 *   .jurlp("watch", function(element, selector) { /* console.log("New element:", element, "Selector:", selector); */ /* })
 *   .jurlp("filter", "host", "=", "www.example.com")
 *   .jurlp("query", { "found": "example" });
 *
 * $("body").prepend("<a href='http://www.example.com/'></a>");
 *
 * $("a:eq(0)").jurlp("unwatch");
 *
 * // Parse an element's text for URLs and create/return anchor elements
 * $("<div>www.example.com</div>").jurlp();
 *
 * // Get an interface for parsing/manipulating the supplied URL
 * var url = $.jurlp("http://www.example.com:80/path/file.name?param1=value1#fragment");
 *
 * // Parse the URL to an object.
 * url.url();
 *
 * // Get the URL scheme.
 * url.scheme();
 *
 * // Get the URL user name.
 * url.user();
 *
 * // Get the URL password.
 * url.password();
 *
 * // Get the URL host.
 * url.host();
 *
 * // Get the URL port.
 * url.port();
 *
 * // Get the URL path.
 * url.path();
 *
 * // Get the URL query.
 * url.query();
 *
 * // Get a specific parameter value from the URL query.
 * url.query().param1;
 *
 * // Get the URL fragment.
 * url.fragment();
 *
 * // Set the full URL.
 * url.url("http://www.example.com:80/path/file.name?param1=value1#fragment");
 *
 * // Set the URL scheme.
 * url.scheme("https://");
 *
 * // Set the URL user name.
 * url.user("user");
 *
 * // Set the URL password.
 * url.password("password");
 *
 * // Set the URL host.
 * url.host("www.newexample.com");
 *
 * // Set the URL port.
 * url.port("80");
 *
 * // Set the URL path.
 * url.path("/newpath/newfile.file");
 *
 * // Append to the URL path.
 * url.path("./newfile.file");
 *
 * // Remove two path elements and append to the URL path.
 * url.path("../../newfile.file");
 *
 * // Set the URL query.
 * url.query("?param=value");
 *
 * // Append/modify the URL query (string or object)
 * url.query("param=value");
 * url.query({ "param": "value" });
 *
 * // Remove the URL query
 * url.query("");
 * url.query({});
 *
 * // Set the URL fragment.
 * url.fragment("#newfragment");
 *
 * (end code)
 *
 */

/*
 * Section: Parsing document.location.href
 *
 * Parsing the document URL.
 *
 * The document URL (document.location.href) can be parsed by specifying the HTML document element to the parser
 * in the following manner:
 *
 * (start code)
 * // Parse the document.location.href URL string into a URL object
 * $( document ).jurlp( "url" );
 * (end code)
 *
 * Similarly, the document URL can be modified by the plugin, but it is worth noting that changes will not be directly applied
 * to document.location.href until <goto> is explicitly called on the element, and instead, a working copy of the URL is stored
 * under the documents "data-href" attribute.
 *
 * (start code)
 * // Does not modify document.location.href (updates $(document).data("href"))
 * $(document).jurlp("url", "www.example.com");
 *
 * // Does modify document.location.href (from $(document).data("href"))
 * $(document).jurlp("goto");
 * (end code)
 *
 */

/*
 * Section: Parsing elements with an "href" or "src" attribute.
 *
 * Parsing "href" or "src" attributes.
 *
 * Elements with an "href" or "src" attribute
 * (e.g., <a href="">, <base href="">, <link href="">, <img src="">, <script src=""> or <iframe src="">)
 * can be parsed by specifying the element(s) to the parser in the following manner:
 *
 * (start code)
 * // Parse all anchor element URLs into an array
 * $("a").jurlp("url");
 * (end code)
 *
 * Any modifications made to the URL will modify the relevant "href" or "src" attribute directly.
 * If you want to visit the URL within an element's "href" or "src" attribute,
 * it is possible to call <goto> on the element.
 *
 * (start code)
 * // Directly set the first anchor element's URL, and then navigate to it!
 * $("a:eq(0)").jurlp("url", "www.example.com").jurlp("goto");
 * (end code)
 *
 */

/*
 * Section: Parsing element text/HTML.
 *
 * Parsing text/HTML for URLs.
 *
 * It is possible for the URL parser to find URLs within text/HTML,
 * and convert them into HTML anchor elements.
 *
 * (start code)
 * // Parse the HTML for URLs, and convert all URLs found in the text to anchors.
 * $("<div>Here are URLs: www.example1.com, www.example2.com</div>").jurlp();
 *
 * // HTML becomes:
 * <div>
 *   Here are URLs:
 *   <a href="http://www.example1.com/" class="jurlp-no-watch">www.example1.com</a>,
 *   <a href="http://www.example2.com/" class="jurlp-no-watch">www.example2.com</a>
 * </div>
 * (end code)
 *
 */

/*
 * Section: Parsing URL strings directly.
 *
 * How to directly parse, modify or monitor an arbitrary URL string.
 *
 * (start code)
 * // Get an interface for parsing the document URL...
 * var url = $.jurlp();
 *
 * // ... or get an interface for parsing your own URL.
 * url = $.jurlp("www.example.com");
 *
 * // Parse the URL to an object.
 * url.url();
 *
 * // Get the URL scheme.
 * url.scheme();
 *
 * // Get the URL host.
 * url.host();
 *
 * // Get the URL port.
 * url.port();
 *
 * // Get the URL path.
 * url.path();
 *
 * // Get the URL query.
 * url.query();
 *
 * // Get a specific parameter value from the URL query.
 * url.query().parameter;
 *
 * // Get the URL fragment.
 * url.fragment();
 *
 * // Create a watch for new URLs that contain "example.com" in the host name
 * var watch = $.jurlp("example.com").watch(function(element, selector) {
 *   // Log details when an example.com URL is found.
 *   console.log("Found example.com URL!", element, selector);
 * });
 *
 * // We can even apply filters to the watch to be sure!
 * watch.jurlp("filter", "host", "*=", "example.com");
 *
 * // Append a new URL, which will trigger the watch
 * $("body").append("<a href=\"www.example.com\"></a>");
 *
 * // Stop watching for "example.com" URLs.
 * watch.jurlp("unwatch");
 * (end code)
 *
 */

/*
 * Section: Unknown URLs.
 *
 * Overview of unknown URL parsing.
 *
 * Unknown scheme:
 * The parser will attempt to parse any type of URL it encounters based on its scheme.
 * However, not all URLs are parsable, for example "spotify:track:<trackid>".
 * In this case, the following URL object is returned:
 *
 * (start code)
 * {
 *   scheme: "spotify:",
 *   url: "track:<trackid>"
 * }
 * (end code)
 *
 * The unknown URL object will always contain the scheme (if present), for filtering purposes,
 * and also contains a toString() method, which will convert the URL object back to the original URL string.
 *
 * mailto:
 * "mailto:" URLs are parsable in the same manner as a regular HTTP URL.
 * For example, the following URL object is returned for a URL with a "mailto:" scheme:
 *
 * (start code)
 * {
 *   scheme: "mailto:",
 *   user: "username",
 *   password: "",
 *   host: "www.example.com",
 *   port: "",
 *   path: "",
 *   query: "?subject=subject&body=body",
 *   fragment: ""
 * }
 * (end code)
 *
 * Therefore, "mailto:" URLs can be fully parsed using this parser,
 * but note that it is not possible to set the password, port or fragment strings on a "mailto:" URL.
 *
 * javascript:
 * "javascript" URLs are parsable in the same manner as a regular HTTP URL.
 * For example, the following URL object is returned for a URL with a "javascript:" scheme:
 *
 * (start code)
 * {
 *   scheme: "javascript:",
 *   user: "",
 *   password: "",
 *   host: "www.example.com",
 *   port: "",
 *   path: "/",
 *   query: "",
 *   fragment: "",
 *   javascript: "alert('!');"
 * }
 * (end code)
 *
 * Therefore, "javascript:" URLs can be fully parsed using this parser,
 * but note that the current "document.location.href" will always be parsed/returned as the main URL object.
 *
 */

/*
 * Section: Operators.
 *
 * Overview of filter operators.
 *
 * The following filter operators may be specified as the "operator" parameter to the <filter> method.
 *
 * URL filter operators:
 *
 *  "="   - Equal to.
 *  "!="  - Not equal to.
 *  "*="  - Contains.
 *  "<"   - Less than.
 *  "<="  - Less than or equal to.
 *  ">"   - Greater than.
 *  ">="  - Greater than or equal to.
 *  "^="  - Starts with.
 *  "$="  - Ends with.
 *  "regex" - Regular expression.
 *
 */

/*
 * Section: this parameter.
 *
 * Where "this" is referred to as an argument to the method functions, it may be one of the following:
 *
 * - An HTML document element.
 * - An array of 1 or more elements with a "href" or "src" attribute.
 * - A URL parser interface returned from $.jurlp().
 *
 */

( function ( $ ) {
  // This function encapsulates the plugin's logic to avoid polluting the global scope.

  /**
   * Regular expression for parsing URLs.
   * This regex is adapted from parseUri 1.2, originally by Steven Levithan.
   * Source: http://blog.stevenlevithan.com/archives/parseuri
   * It's designed to break down a URL into its constituent parts.
   */
  var urlRegEx = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;


  /*
   * This is a global object intended to store watched selectors
   * and their corresponding arrays of callback functions (callstacks).
   * It's crucial for the "watch" functionality of the plugin.
   */