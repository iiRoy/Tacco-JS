const httpModule = require('http');
const fileSystem = require('fs');
const utilModule = require('util'); // For util.log, replacing sys.puts
const _ = require('./underscore/underscore'); // Assuming underscore is still required and available

// Define a simple logger function to replace sys.puts
const appLogger = {
  info: (...messages) => {
    // Adding timestamps for better logging, a new fragment
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, ...messages);
  },
  error: (...messages) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, ...messages);
  }
};

// Main application object, exported
const webApp = exports;

// Storage for route handlers
const routeHandlers = {
  get: new Map(),
  post: new Map()
};

/**
 * Recursively registers static files or directories.
 * If a directory, it scans and registers its contents.
 * If a file, it registers a handler to serve that file.
 * @param {string} baseDir The base directory path where static files are located.
 * @param {string} currentPath The relative path within the base directory.
 */
webApp.registerAssetPath = function(baseDir, currentPath) {
  // Validate input paths early (guard clause)
  if (!baseDir || !currentPath) {
    appLogger.error("Invalid baseDir or currentPath provided for static asset registration.");
    return;
  }

  const fullPath = `${baseDir}${currentPath}`;

  fileSystem.stat(fullPath, (error, fileStats) => {
    if (error) {
      appLogger.error(`Failed to retrieve stats for path: ${fullPath}. Error: ${error.message}`);
      return; // Early exit on error
    }

    if (fileStats.isDirectory()) {
      fileSystem.readdir(fullPath, (readErr, fileNames) => {
        if (readErr) {
          appLogger.error(`Error reading directory contents: ${fullPath}. Error: ${readErr.message}`);
          return;
        }
        // Iterate over files and recursively register them
        fileNames.forEach(individualFile => {
          webApp.registerAssetPath(baseDir, `${currentPath}/${individualFile}`);
        });
      });
    } else if (fileStats.isFile()) {
      // Register a GET handler for the file
      routeHandlers.get.set(currentPath, webApp.serveStaticContent(fullPath));
      appLogger.info(`Registered static file handler for: ${currentPath}`);
    } else {
      appLogger.error(`Path: ${fullPath} is neither a valid file nor a directory. Skipping registration.`);
    }
  });
};

/**
 * Registers a GET request handler for a specific URL path.
 * @param {string} urlPath The URL path to handle.
 * @param {function} requestHandler The function to execute when the path is requested.
 */
webApp.onGet = function(urlPath, requestHandler) {
  // Add a simple validation for handler (new fragment)
  if (typeof requestHandler !== 'function') {
    appLogger.error(`Attempted to register non-function handler for GET path: ${urlPath}`);
    return;
  }
  routeHandlers.get.set(urlPath, requestHandler);
  appLogger.info(`GET handler registered for path: ${urlPath}`);
};

/**
 * Registers a POST request handler for a specific URL path.
 * @param {string} urlPath The URL path to handle.
 * @param {function} requestHandler The function to execute when the path is posted to.
 */
webApp.onPost = function(urlPath, requestHandler) {
  if (typeof requestHandler !== 'function') {
    appLogger.error(`Attempted to register non-function handler for POST path: ${urlPath}`);
    return;
  }
  routeHandlers.post.set(urlPath, requestHandler);
  appLogger.info(`POST handler registered for path: ${urlPath}`);
};

/**
 * Handles requests that do not match any registered routes.
 * @param {object} httpRequest The incoming HTTP request object.
 * @param {object} httpResponse The HTTP response object.
 */
function handleNotFound(httpRequest, httpResponse) {
  const ERROR_MESSAGE_404 = 'Page Not Found';
  appLogger.info(`404 Not Found for URL: ${httpRequest.url}`);
  httpResponse.sendResponse(ERROR_MESSAGE_404, 404, 'text/plain'); // Use the custom sendResponse
}

// Global server instance
const applicationServer = httpModule.createServer((incomingRequest, serverResponse) => {
  // Extend the response object with a utility method for sending HTML
  serverResponse.sendResponse = function(contentBody, statusCode = 200, contentType = 'text/html; charset=utf-8') {
    // Ensure contentBody is treated as a string for length calculation
    const bodyString = String(contentBody);
    const responseHeaders = [
      ['Content-Type', contentType],
      ['Content-Length', Buffer.byteLength(bodyString, 'utf8')] // Use byteLength for accuracy
    ];
    this.writeHead(statusCode, responseHeaders);
    this.write(bodyString); // No unescape needed here, write raw string
    this.end();
  };

  const requestMethod = incomingRequest.method;
  const requestUrl = incomingRequest.url;
  appLogger.info(`Incoming request: ${requestMethod} ${requestUrl}`);

  if (requestMethod === 'GET') {
    let routeFound = false;
    // Iterate through registered GET handlers
    // Using `some` to break the loop once a handler is found
    routeHandlers.get.forEach((handlerFunction, registeredPath) => {
      // Use a more robust regex for path matching, supporting dynamic segments
      // Example: /users/(\d+)
      const pathRegex = new RegExp(`^${registeredPath.replace(/:\w+/g, '([^/]+)')}$`);
      const pathMatches = pathRegex.exec(requestUrl);

      if (pathMatches) {
        // Extract route parameters if any
        const routeParams = pathMatches.slice(1);
        handlerFunction(incomingRequest, serverResponse, ...routeParams);
        routeFound = true;
        // In a forEach, we can't 'break'. A traditional for-loop or `some` would be better.
        // For simplicity, we'll just set a flag and rely on the subsequent if.
        // Or, for a true Type III change, use Array.prototype.some if `routeHandlers.get` was an array of objects.
        // Since it's a Map, we'll continue the forEach but the 'routeFound' flag will prevent `handleNotFound`.
        // Better: refactor to use a more efficient lookup or iteration for dynamic paths.
        // For now, let's make it a bit more efficient by using a custom iteration that can break.
        // This is a structural change.
        if (routeFound) return; // This only breaks the current iteration, not the forEach.
      }
    });

    // Re-implementing the GET handler lookup with a breakable mechanism
    let matchedGetHandler = null;
    let matchedGetParams = [];
    for (const [registeredPath, handlerFunc] of routeHandlers.get.entries()) {
      const pathRegex = new RegExp(`^${registeredPath.replace(/:\w+/g, '([^/]+)')}$`);
      const pathMatches = pathRegex.exec(requestUrl);
      if (pathMatches) {
        matchedGetHandler = handlerFunc;
        matchedGetParams = pathMatches.slice(1);
        break; // Found a match, exit loop
      }
    }

    if (matchedGetHandler) {
      matchedGetHandler(incomingRequest, serverResponse, ...matchedGetParams);
    } else {
      handleNotFound(incomingRequest, serverResponse);
    }

  } else if (requestMethod === 'POST') {
    let postBodyData = '';
    // Use 'on' instead of 'addListener' for event handling (modern Node.js style)
    incomingRequest.on('data', (dataChunk) => {
      postBodyData += dataChunk;
      // Optional: guard against excessively large bodies
      const MAX_POST_BODY_SIZE = 1e6; // 1MB
      if (postBodyData.length > MAX_POST_BODY_SIZE) {
        appLogger.error(`POST body too large for URL: ${requestUrl}. Aborting request.`);
        incomingRequest.destroy();
        serverResponse.sendResponse('Request Entity Too Large', 413, 'text/plain');
      }
    });

    incomingRequest.on('end', () => {
      // Initialize a parameters object on the request
      incomingRequest.postParameters = {};

      if (postBodyData) {
        // More robust URL-encoded body parsing
        const paramsArray = postBodyData.split('&');
        for (const paramPair of paramsArray) {
          const parts = paramPair.split('=');
          if (parts.length === 2) {
            const key = decodeURIComponent(parts[0].replace(/\+/g, ' '));
            const value = decodeURIComponent(parts[1].replace(/\+/g, ' '));
            incomingRequest.postParameters[key] = value;
          }
        }
        appLogger.info(`Parsed POST parameters for ${requestUrl}:`, incomingRequest.postParameters);
      } else {
        appLogger.info(`No POST body data for ${requestUrl}.`);
      }

      // Look up the POST handler
      const postHandler = routeHandlers.post.get(requestUrl) || handleNotFound;
      postHandler(incomingRequest, serverResponse);
    });

    incomingRequest.on('error', (err) => {
      appLogger.error(`Error during POST request for ${requestUrl}:`, err);
      serverResponse.sendResponse('Internal Server Error', 500, 'text/plain');
    });

  } else {
    // Handle other HTTP methods not explicitly supported
    appLogger.info(`Unsupported HTTP method: ${requestMethod} for URL: ${requestUrl}`);
    serverResponse.sendResponse(`Method ${requestMethod} Not Allowed`, 405, 'text/plain');
  }
});

/**
 * Retrieves POST parameters from a request body asynchronously.
 * This function's utility is somewhat redundant with the server's POST handling,
 * but is kept and refactored as a Type III change.
 * @param {object} req The HTTP request object.
 * @param {function} completionCallback The callback to execute with the parsed parameters.
 */
webApp.fetchPostParameters = function(req, completionCallback) {
  let accumulatedBody = '';
  req.on('data', (dataPart) => {
    accumulatedBody += dataPart;
  });
  req.on('end', () => {
    // Assuming application/x-www-form-urlencoded
    const params = new URLSearchParams(accumulatedBody);
    const parsedParams = {};
    for (const [key, value] of params.entries()) {
      parsedParams[key] = value;
    }
    completionCallback(parsedParams);
  });
  req.on('error', (err) => {
    appLogger.error('Error fetching POST parameters:', err);
    completionCallback({}); // Return empty params on error
  });
};

/**
 * Starts the HTTP server on the specified port and host.
 * @param {number} listeningPort The port number to listen on.
 * @param {string} [listeningHost='127.0.0.1'] The host address to bind to.
 */
webApp.beginListening = function(listeningPort, listeningHost = '127.0.0.1') {
  applicationServer.listen(listeningPort, listeningHost, () => {
    appLogger.info(`Web server active at http://${listeningHost}:${listeningPort}/`);
    appLogger.info('Press Ctrl+C to terminate the server process.');
  });
  applicationServer.on('error', (err) => {
    appLogger.error(`Server failed to start or encountered an error: ${err.message}`);
    // Potentially add more specific error handling, e.g., for EADDRINUSE
    process.exit(1); // Exit process on critical server error
  });
};

/**
 * Extracts the file extension from a given path.
 * @param {string} fullFilePath The full path to the file.
 * @returns {string} The file extension (e.g., ".html", ".js"), or an empty string if none.
 */
function retrieveFileExtension(fullFilePath) {
  const lastDotIndex = fullFilePath.lastIndexOf('.');
  // Check if dot is the first character (hidden file) or if no dot exists
  if (lastDotIndex <= 0) {
    return '';
  }
  return fullFilePath.slice(lastDotIndex);
}

/**
 * Creates a request handler function to serve a specified file.
 * This handler caches the file content and headers after the first load.
 * @param {string} targetFilePath The absolute path to the file to serve.
 * @returns {function} An HTTP request handler.
 */
webApp.serveStaticContent = function(targetFilePath) {
  let cachedFileBody = null;
  let cachedResponseHeaders = null;
  const fileExtension = retrieveFileExtension(targetFilePath);
  const mimeType = webApp.mediaTypes.determineType(fileExtension);

  /**
   * Internal function to load file data and set cache.
   * @param {function} completionCallback Callback to execute once data is loaded/available.
   */
  const ensureFileDataLoaded = (completionCallback) => {
    // If data is already cached, just call the callback
    if (cachedFileBody && cachedResponseHeaders) {
      process.nextTick(completionCallback); // Call asynchronously to maintain consistent behavior
      return;
    }

    appLogger.info(`Initiating load for static file: ${targetFilePath}...`);
    fileSystem.readFile(targetFilePath, (readError, fileData) => { // Read as Buffer by default
      if (readError) {
        appLogger.error(`Failed to load file ${targetFilePath}. Error: ${readError.message}`);
        // Invalidate cache on error to retry next time
        cachedFileBody = null;
        cachedResponseHeaders = null;
        // Pass error to callback if it expects it, or handle here
        completionCallback(readError);
        return;
      }

      cachedFileBody = fileData; // Store as Buffer
      cachedResponseHeaders = [
        ['Content-Type', mimeType],
        ['Content-Length', fileData.length] // Buffer.length gives byte length
      ];
      appLogger.info(`Static file ${targetFilePath} successfully loaded and cached.`);
      completionCallback(null); // No error
    });
  };

  // Return the actual request handler
  return (req, res) => {
    ensureFileDataLoaded((loadError) => {
      if (loadError) {
        // If file load failed, send a 500 error
        res.sendResponse('Internal Server Error: Could not serve file.', 500, 'text/plain');
      } else {
        res.writeHead(200, cachedResponseHeaders);
        res.write(cachedFileBody); // Write Buffer directly
        res.end();
      }
    });
  };
};

/**
 * MIME type utility object, adapted from Rack.
 * Provides functionality to determine MIME types based on file extensions.
 * (Comment rewritten for Type III)
 */
webApp.mediaTypes = {
  /**
   * Retrieves the MIME type for a given file extension.
   * @param {string} fileExt The file extension (e.g., ".txt", "html").
   * @param {string} [defaultType='application/octet-stream'] The default MIME type if the extension is not found.
   * @returns {string} The corresponding MIME type.
   */
  determineType: function(fileExt, defaultType = 'application/octet-stream') {
    // Ensure extension is clean and lowercase for lookup
    const normalizedExt = fileExt.toLowerCase().startsWith('.') ? fileExt.toLowerCase() : `.${fileExt.toLowerCase()}`;
    return webApp.mediaTypes.typeMap[normalizedExt] || defaultType;
  },

  // Comprehensive mapping of file extensions to their respective MIME types.
  // This map is frequently updated to include new types and ensure broad compatibility.
  typeMap: {
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
    ".webp": "image/webp", // Added a new common type
    ".mpga": "audio/mpeg" // Added another common type
  }
};