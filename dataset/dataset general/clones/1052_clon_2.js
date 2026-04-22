var createWebServer = require('http').createServer;
var filesystemModule = require('fs');
var systemUtilities = require('sys');
// This line imports the Underscore.js utility library.
// We'll refer to its global object as `_util` throughout this code.
require('./underscore/underscore');

var webEngine = exports;

// --- Data structures for managing HTTP routes ---

// Stores functions for handling incoming GET requests, indexed by their URL patterns.
var routeRegistry = {};
// Stores functions for processing incoming POST requests, also indexed by URL patterns.
var submissionRegistry = {};

// --- Core functions for managing server paths and requests ---

/**
 * Configures a static asset path. If the path points to a directory,
 * it recursively registers all files within it. If it's a single file,
 * it sets up a GET handler to serve that file directly.
 * @param {string} basePath The foundational directory for static resources.
 * @param {string} resourcePath The specific path relative to the basePath.
 */
webEngine.configureStaticAsset = function(basePath, resourcePath) {
  // Check the file system entry's status (e.g., is it a folder or a file?)
  filesystemModule.stat(basePath + resourcePath, function(errorObject, pathStats) {
    if (pathStats.isDirectory()) {
      // If it's a directory, read its contents to find sub-items.
      filesystemModule.readdir(basePath + resourcePath, function(errorObject, folderEntries) {
        _util.each(folderEntries, function(entryName) {
          // Recursively call this configuration for each item in the directory.
          webEngine.configureStaticAsset(basePath, resourcePath + '/' + entryName);
        });
      });
    } else if (pathStats.isFile()) {
      // If it's a regular file, assign a handler to serve its content for GET requests.
      routeRegistry[resourcePath] = webEngine.serveStaticFile(basePath + resourcePath);
    } else {
      // Log an alert if the specified path isn't a valid file or folder.
      systemUtilities.puts('ALERT: Path: ' + basePath + resourcePath + ' is not a valid file or directory!');
    }
  });
};

/**
 * Registers a callback function for a specific GET request URL pattern.
 * @param {string} routePattern The URL pattern that this handler will respond to.
 * @param {Function} routeHandler The function that executes when the route matches.
 */
webEngine.registerGetRoute = function(routePattern, routeHandler) {
  routeRegistry[routePattern] = routeHandler;
};

/**
 * Registers a callback function for a specific POST request URL pattern.
 * @param {string} routePattern The URL pattern for which this handler is responsible.
 * @param {Function} routeHandler The function to be invoked upon a matching POST request.
 */
webEngine.registerPostRoute = function(routePattern, routeHandler) {
  submissionRegistry[routePattern] = routeHandler;
};

/**
 * Handles requests for resources that are not found.
 * Sends a 404 HTTP status code and a "Not Found" message.
 * @param {object} clientRequest The incoming HTTP request object.
 * @param {object} serverResponse The outgoing HTTP response object.
 */
function handleResourceNotFound(clientRequest, serverResponse) {
  const MISSING_RESOURCE_MESSAGE = 'Resource Not Found!\n';
  systemUtilities.puts('Error 404: Resource Unavailable');
  serverResponse.sendHtmlResponse(MISSING_RESOURCE_MESSAGE, 404);
}

// Initialize the main HTTP server.
var httpServerInstance = createWebServer(function(clientRequest, serverResponse) {
  // Extend the server response object with a utility method for sending HTML.
  serverResponse.sendHtmlResponse = function(contentBody, httpStatusCode) {
    // Default to a 200 OK status if no specific code is provided.
    httpStatusCode = httpStatusCode || 200;
    // Construct the HTTP response headers.
    let responseHeaders = [
      ['Content-Type', 'text/html; charset=utf-8'],
      ['Content-Length', contentBody.length]
    ];
    // Write the HTTP status line and headers to the response.
    this.writeHead(httpStatusCode, responseHeaders);
    // Write the decoded HTML content to the response body.
    this.write(decodeURIComponent(contentBody));
    // Signal the end of the response.
    this.end();
  };

  // --- Request routing and processing logic ---
  // For GET requests, the URL is the primary focus.
  // For POST requests, the body often contains submitted form data.
  // The parsed POST parameters will be accessible via `clientRequest.requestParameters`,
  // and the raw body will be in `clientRequest.requestBody`.

  if (clientRequest.method === 'GET') {
    let requestProcessed = false;
    // Iterate through all defined GET routes to find a match.
    _util.each(_util.keys(routeRegistry), function(routeKey) {
      // Attempt to execute the regular expression route against the request URL.
      let routeParameters = new RegExp(routeKey).exec(clientRequest.url);
      if (routeParameters) {
        // Remove the full matched string (first element) from the parameters array.
        routeParameters.shift();
        // Prepend the request and response objects to the parameters.
        routeParameters.unshift(clientRequest, serverResponse);
        requestProcessed = true;
        // Invoke the registered handler with the prepared arguments.
        routeRegistry[routeKey].apply(this, routeParameters);
        return false; // Break out of the _util.each loop.
      }
    });
    // If no specific handler processed the request, return a 404.
    if (!requestProcessed) handleResourceNotFound(clientRequest, serverResponse);
  } else if (clientRequest.method === 'POST') {
    // For POST requests, find the corresponding handler or default to 404.
    let currentHandler = submissionRegistry[clientRequest.url] || handleResourceNotFound;
    clientRequest.requestBody = ''; // Initialize an empty string to build the request body.
    // Attach a listener to accumulate data chunks as they arrive.
    clientRequest.addListener('data', function(dataChunk) {
      systemUtilities.puts("Received POST chunk = " + dataChunk);
      clientRequest.requestBody += dataChunk;
    });
    // Attach a listener for when the entire request body has been received.
    clientRequest.addListener('end', function() {
      // Regular expression to parse URL-encoded key-value pairs from the body.
      const formParsingRegex = /([^=&]+)=([^&]+)/ig;
      let currentMatch;

      clientRequest.requestParameters = clientRequest.requestParameters || {}; // Ensure the parameters object exists.
      // Loop through the body, extracting and storing each key-value pair.
      while ((currentMatch = formParsingRegex.exec(clientRequest.requestBody)) != null) {
        systemUtilities.puts("Parsed POST variable: " + currentMatch[1] + " = " + currentMatch[2]);
        clientRequest.requestParameters[currentMatch[1]] = currentMatch[2];
      }
      // Execute the appropriate handler with the request and response objects.
      currentHandler(clientRequest, serverResponse);
    });
  }
});

/**
 * Asynchronously retrieves and decodes POST parameters from a client request.
 * @param {object} clientRequest The HTTP request object containing the POST body.
 * @param {Function} completionCallback A callback to be invoked with the parsed parameters.
 */
webEngine.extractPostParameters = function(clientRequest, completionCallback) {
  var receivedBody = '';
  clientRequest.addListener('body', function(dataChunk) {
      receivedBody += dataChunk;
    })
    .addListener('complete', function() {
      // Decode the URL-encoded body, removing a potential prefix and replacing '+' with spaces.
      completionCallback(decodeURIComponent(receivedBody.substring(8).replace(/\+/g, ' ')));
    });
};

/**
 * Initiates the HTTP server, making it listen for incoming connections.
 * @param {number} listenPort The network port number on which the server will listen.
 * @param {string} listenHost The network interface address to bind the server to.
 */
webEngine.startListening = function(listenPort, listenHost) {
  httpServerInstance.listen(listenPort, listenHost);
  systemUtilities.puts('Web server operational at http://' + (listenHost || '127.0.0.1') + ':' + listenPort.toString() + '/');
};

/**
 * Utility function to extract the file extension from a given file path.
 * @param {string} fullPath The complete path of the file.
 * @returns {string} The file extension (e.g., ".txt", ".html"), or an empty string if none is found.
 */
function getFileExtension(fullPath) {
  var lastDotIndex = fullPath.lastIndexOf('.');
  return lastDotIndex < 0 ? '' : fullPath.substring(lastDotIndex);
}

/**
 * Creates a request handler function for serving a specific static file.
 * This function optimizes performance by caching the file's content and headers
 * after the initial read operation.
 * @param {string} resourceIdentifier The absolute path to the static file.
 * @returns {Function} An HTTP request handler that serves the specified file.
 */
webEngine.serveStaticFile = function(resourceIdentifier) {
  var fileContent, fileHeaders;
  // Determine the appropriate MIME type for the file based on its extension.
  var contentTypeValue = webEngine.mimeHelper.getExtensionType(getFileExtension(resourceIdentifier));

  /**
   * Internal helper function to load the file's data and prepare response headers.
   * Caches the data to avoid repeated file system access on subsequent requests.
   * @param {Function} dataReadyCallback The callback to execute once file data is loaded.
   */
  function prepareResourceData(dataReadyCallback) {
    if (fileContent && fileHeaders) {
      // If the content is already in cache, directly invoke the callback.
      dataReadyCallback();
      return;
    }
    systemUtilities.puts("Loading static resource: " + resourceIdentifier + '...');
    // Read the file asynchronously from the filesystem.
    var fileReadOperation = filesystemModule.readFile(resourceIdentifier, 'utf8', function(readError, readData) {
      if (readError) {
        systemUtilities.puts('Encountered error: ' + readError + ' while attempting to load ' + resourceIdentifier);
      }
      fileContent = readData;
      fileHeaders = [
        ['Content-Type', contentTypeValue],
        ['Content-Length', readData.length]
      ];
      systemUtilities.puts('Static file ' + resourceIdentifier + ' has been loaded and cached.');
      dataReadyCallback();
    });
  }
  // Return the actual HTTP request handler function.
  return function(clientRequest, serverResponse) {
    prepareResourceData(function() {
      // Once the resource data is ready (either from cache or disk), send the response.
      serverResponse.writeHead(200, fileHeaders);
      serverResponse.write(fileContent);
      serverResponse.end();
    });
  };
};

// --- MIME Type Utility Module (inspired by the 'jack' library) ---
webEngine.mimeHelper = {
  /**
   * Looks up the MIME type associated with a given file extension.
   * @param {string} fileExtension The extension of the file (e.g., ".js", ".css").
   * @param {string} defaultType A fallback MIME type if the extension isn't found in the map.
   * @returns {string} The resolved MIME type, or 'application/octet-stream' as a final default.
   */
  getExtensionType: function(fileExtension, defaultType) {
    return webEngine.mimeHelper.MIME_TYPES[fileExtension.toLowerCase()] || defaultType || 'application/octet-stream';
  },

  // A comprehensive dictionary of common MIME types, originally derived from the Rack web server framework.
  MIME_TYPES: {
    ".3gp": "video/3gpp",
    ".a": "application/octet-stream",
    ".ai": "application/postscript",
    ".aif": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".asc": "application/pgp-signature",
    ".asf": "video/x-ms-asf",
    ".asm": "text/x-asm",
    ".asx": "video/x-ms-asf",
    ".atom": "application/atom+xml",
    ".au": "audio/basic",
    ".avi": "video/x-msvideo",
    ".bat": "application/x-msdownload",
    ".bin": "application/octet-stream",
    ".bmp": "image/bmp",
    ".bz2": "application/x-bzip2",
    ".c": "text/x-c",
    ".cab": "application/vnd.ms-cab-compressed",
    ".cc": "text/x-c",
    ".chm": "application/vnd.ms-htmlhelp",
    ".class": "application/octet-stream",
    ".com": "application/x-msdownload",
    ".conf": "text/plain",
    ".cpp": "text/x-c",
    ".crt": "application/x-x509-ca-cert",
    ".css": "text/css",
    ".csv": "text/csv",
    ".cxx": "text/x-c",
    ".deb": "application/x-debian-package",
    ".der": "application/x-x509-ca-cert",
    ".diff": "text/x-diff",
    ".djv": "image/vnd.djvu",
    ".djvu": "image/vnd.djvu",
    ".dll": "application/x-msdownload",
    ".dmg": "application/octet-stream",
    ".doc": "application/msword",
    ".dot": "application/msword",
    ".dtd": "application/xml-dtd",
    ".dvi": "application/x-dvi",
    ".ear": "application/java-archive",
    ".eml": "message/rfc822",
    ".eps": "application/postscript",
    ".exe": "application/x-msdownload",
    ".f": "text/x-fortran",
    ".f77": "text/x-fortran",
    ".f90": "text/x-fortran",
    ".flv": "video/x-flv",
    ".for": "text/x-fortran",
    ".gem": "application/octet-stream",
    ".gemspec": "text/x-script.ruby",
    ".gif": "image/gif",
    ".gz": "application/x-gzip",
    ".h": "text/x-c",
    ".hh": "text/x-c",
    ".htm": "text/html",
    ".html": "text/html",
    ".ico": "image/vnd.microsoft.icon",
    ".ics": "text/calendar",
    ".ifb": "text/calendar",
    ".iso": "application/octet-stream",
    ".jar": "application/java-archive",
    ".java": "text/x-java-source",
    ".jnlp": "application/x-java-jnlp-file",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript",
    ".json": "application/json",
    ".log": "text/plain",
    ".m3u": "audio/x-mpegurl",
    ".m4v": "video/mp4",
    ".man": "text/troff",
    ".mathml": "application/mathml+xml",
    ".mbox": "application/mbox",
    ".mdoc": "text/troff",
    ".me": "text/troff",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mime": "message/rfc822",
    ".mml": "application/mathml+xml",
    ".mng": "video/x-mng",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".mp4v": "video/mp4",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".ms": "text/troff",
    ".msi": "application/x-msdownload",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".ogg": "application/ogg",
    ".p": "text/x-pascal",
    ".pas": "text/x-pascal",
    ".pbm": "image/x-portable-bitmap",
    ".pdf": "application/pdf",
    ".pem": "application/x-x509-ca-cert",
    ".pgm": "image/x-portable-graymap",
    ".pgp": "application/pgp-encrypted",
    ".pkg": "application/octet-stream",
    ".pl": "text/x-script.perl",
    ".pm": "text/x-script.perl-module",
    ".png": "image/png",
    ".pnm": "image/x-portable-anymap",
    ".ppm": "image/x-portable-pixmap",
    ".pps": "application/vnd.ms-powerpoint",
    ".ppt": "application/vnd.ms-powerpoint",
    ".ps": "application/postscript",
    ".psd": "image/vnd.adobe.photoshop",
    ".py": "text/x-script.python",
    ".qt": "video/quicktime",
    ".ra": "audio/x-pn-realaudio",
    ".rake": "text/x-script.ruby",
    ".ram": "audio/x-pn-realaudio",
    ".rar": "application/x-rar-compressed",
    ".rb": "text/x-script.ruby",
    ".rdf": "application/rdf+xml",
    ".roff": "text/troff",
    ".rpm": "application/x-redhat-package-manager",
    ".rss": "application/rss+xml",
    ".rtf": "application/rtf",
    ".ru": "text/x-script.ruby",
    ".s": "text/x-asm",
    ".sgm": "text/sgml",
    ".sgml": "text/sgml",
    ".sh": "application/x-sh",
    ".sig": "application/pgp-signature",
    ".snd": "audio/basic",
    ".so": "application/octet-stream",
    ".svg": "image/svg+xml",
    ".svgz": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".t": "text/troff",
    ".tar": "application/x-tar",
    ".tbz": "application/x-bzip-compressed-tar",
    ".tcl": "application/x-tcl",
    ".tex": "application/x-tex",
    ".texi": "application/x-texinfo",
    ".texinfo": "application/x-texinfo",
    ".text": "text/plain",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".torrent": "application/x-bittorrent",
    ".tr": "text/troff",
    ".txt": "text/plain",
    ".vcf": "text/x-vcard",
    ".vcs": "text/x-vcalendar",
    ".vrml": "model/vrml",
    ".war": "application/java-archive",
    ".wav": "audio/x-wav",
    ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv",
    ".wmx": "video/x-ms-wmx",
    ".wrl": "model/vrml",
    ".wsdl": "application/wsdl+xml",
    ".xbm": "image/x-xbitmap",
    ".xhtml": "application/xhtml+xml",
    ".xls": "application/vnd.ms-excel",
    ".xml": "application/xml",
    ".xpm": "image/x-xpixmap",
    ".xsl": "application/xml",
    ".xslt": "application/xslt+xml",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".zip": "application/zip",
  }
};