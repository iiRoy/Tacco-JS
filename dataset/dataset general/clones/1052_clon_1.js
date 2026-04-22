/*
 * This file provides a simple web server utility,
 * offering basic routing, static file serving, and MIME type handling.
 * It leverages Node.js's built-in 'http' and 'fs' modules.
 *
 * All functions are exported via the 'b' object.
 */

// Core Node.js modules for HTTP server and file system operations.
var CS = require('http') .createServer; // HTTP server factory
var fs = require('fs') ;                  // File system module
var sys = require('sys');                 // System utility module (for console output)

// External utility library, likely Underscore.js for collection manipulation.
require('./underscore/underscore');


// Export object, aliased as 'b' for convenience.
var b = exports;


// Maps to store route handlers for GET and POST requests.
// These are global-like variables within this module's scope.
var getMap = {};
var postMap = {};


/**
 * Recursively sets up static file serving for a given path.
 * If the path is a directory, it will register all contained files.
 * If it's a file, it registers a handler to serve that specific file.
 *
 * @param {string} prefix The base directory for static assets.
 * @param {string} path   The relative path from the prefix to the file/directory.
 */
b.setStaticPath = function (prefix, path) {
    fs.stat(prefix + path, function (err, stats) {
        // Check if the current path points to a directory.
        if (stats.isDirectory()) {
            // Read directory contents and recursively set up static paths for each item.
            fs.readdir(prefix + path, function (err, files) {
                _.each(files, function (file) {
                    b.setStaticPath(prefix, path + '/' + file);
                });
            });
        }
        // If it's a regular file, register a file serving handler for its path.
        else if (stats.isFile()) {
            getMap[path] = b.sendFile(prefix + path);
        }
        // Log an error if the path is neither a file nor a directory.
        else {
            sys.puts('ERROR: Path: ' + prefix + path + ' is not a valid file or directory!');
        }
    });
};


/**
 * Registers a handler function for incoming GET requests to a specific path.
 *
 * @param {string}   path    The URL path to match.
 * @param {function} handler The function to execute when the path is matched.
 */
b.get = function (path, handler) {
    getMap[path] = handler;
};


/**
 * Registers a handler function for incoming POST requests to a specific path.
 *
 * @param {string}   path    The URL path to match.
 * @param {function} handler The function to execute when the path is matched.
 */
b.post = function (path, handler) {
    postMap[path] = handler;
};


/**
 * Default handler for requests that do not match any registered routes (404 Not Found).
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 */
function notFound(req, res) {
    var NOT_FOUND = 'Not Found\n'; // Message for 404 response

    // Log the error to the console.
    sys.puts('404 ERROR: ' + req.url);

    // Send a 404 Not Found response to the client.
    res.sendHTML(NOT_FOUND, 404);
}


/*
 * Creates the main HTTP server instance.
 * This server will handle all incoming requests and route them
 * based on the HTTP method and URL path.
 */
var server = CS(function (req, res) {

    // Augment the response object with a custom sendHTML method.
    // This simplifies sending HTML content with appropriate headers.
    res.sendHTML = function (body, code) {
        // Default status code is 200 OK.
        code = code || 200;

        // Define HTTP response headers.
        var header = [
            ['Content-Type', 'text/html; charset=utf-8'],
            ['Content-Length', body.length]
        ];

        // Write the HTTP status code and headers.
        this.writeHead(code, header);
        // Write the response body, unescaping it first.
        this.write(unescape(body));
        // End the response.
        this.end();
    };

    /*
     * This section handles routing based on the HTTP request method.
     * For GET requests, it tries to match the URL against registered handlers.
     * For POST requests, it processes the request body for form data.
     */

    // --- Handling GET requests ---
    if (req.method === 'GET') {
        var handled = false; // Flag to track if a handler was found and executed.

        // If no specific handler is provided (e.g., for dynamic routes).
        if (!handler) {
            // Iterate through all registered GET routes.
            _.each(_.keys(getMap), function (key) {
                // Attempt to match the request URL against the route key (which can be a RegExp).
                var args = new RegExp(key).exec(req.url);

                // If a match is found...
                if (args) {
                    args.shift();           // Remove the full matched string (first element).
                    args.unshift(req, res); // Add req and res objects to the beginning of arguments.
                    handled = true;         // Mark as handled.
                    getMap[key].apply(this, args); // Execute the handler with the extracted arguments.
                    _.breakLoop();          // Stop iterating after the first match.
                }
            });
        }
        // If no handler was found or executed for the GET request, send a 404.
        if (!handled) {
            notFound(req, res);
        }
    }
    // --- Handling POST requests ---
    else if (req.method === 'POST') {
        // Find the POST handler for the URL, or use the notFound handler if none exists.
        var handler = postMap[req.url] || notFound;

        // Initialize an empty string to accumulate the request body.
        req.body = '';

        // Attach a listener for 'data' events to collect chunks of the request body.
        req.addListener('data', function (chunk) {
            sys.puts("Received chunk: " + chunk); // Log incoming data chunks.
            req.body += chunk; // Append the chunk to the request body.
        });

        // Attach a listener for the 'end' event, signifying the entire body has been received.
        req.addListener('end', function () {
            // Regular expression to parse URL-encoded form data (key=value&key2=value2).
            var info = /([^=&]+)=([^&]+)/ig;
            var match; // Variable to hold regex matches.

            // Initialize req.params if it doesn't exist.
            req.params = req.params || {};

            // Parse all key-value pairs from the request body.
            while ((match = info.exec(req.body)) != null) {
                sys.puts("Parsed POST var: " + match[1] + " = " + match[2]); // Log parsed variables.
                req.params[match[1]] = match[2]; // Store parsed values in req.params.
            }
            // Execute the appropriate POST handler with the request and response objects.
            handler(req, res);
        });
    }
});


/**
 * Helper function to asynchronously retrieve POST parameters from a request.
 * This function seems to be an alternative or older way to handle POST data
 * compared to the `req.addListener('data')` approach in the server.
 *
 * @param {object}   req      The HTTP request object.
 * @param {function} callback A callback function to be executed with the parsed body.
 */
b.getPostParams = function (req, callback) {
    var body = ''; // Buffer for the request body.

    // Listen for 'body' chunks and 'complete' event (likely custom events or an older API).
    req.addListener('body', function (chunk) {
        body += chunk;
    })
        .addListener('complete', function () {
            // Callback with the unescaped and space-replaced body.
            // Note: `substring(8)` implies skipping a prefix, which might be specific to a use case.
            callback(unescape(body.substring(8).replace(/\+/g, ' ')));
        });
};


/**
 * Starts the HTTP server, making it listen for incoming connections.
 *
 * @param {number} port The port number to listen on.
 * @param {string} host The host address to bind to (e.g., '127.0.0.1' or '0.0.0.0').
 */
b.listen = function (port, host) {
    server.listen(port, host); // Start listening.

    // Log the server's listening address.
    sys.puts('Server at http://' + (host || '127.0.0.1') + ':' + port.toString() + '/');
};


/**
 * Extracts the file extension from a given path.
 *
 * @param {string} path The file path.
 * @returns {string} The file extension, including the leading dot (e.g., '.html'), or an empty string if no extension.
 */
function extname(path) {
    var index = path.lastIndexOf('.'); // Find the last dot in the path.
    return index < 0 ? '' : path.substring(index); // Return extension or empty string.
}


/**
 * Creates a request handler function for serving a specific static file.
 * This handler will read the file once and cache its content and headers for subsequent requests.
 *
 * @param {string} filename The full path to the file to be served.
 * @returns {function} An HTTP request handler function (req, res).
 */
b.sendFile = function (filename) {
    var body, headers; // Variables to cache file content and HTTP headers.

    // Determine the content type based on the file extension.
    var content_type = b.mime.lookupExtension(extname(filename));

    /**
     * Internal function to load file data and set headers.
     * It checks if data is already loaded to avoid redundant file reads.
     * @param {function} callback Function to call once data is loaded.
     */
    function loadResponseData(callback) {
        // If body and headers are already cached, just call the callback.
        if (body && headers) {
            callback();
            return;
        }

        sys.puts("Loading static file: " + filename + '...'); // Log file loading.

        // Asynchronously read the file content.
        var file = fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
                sys.puts('Error ' + err + ' while loading ' + filename); // Log file read errors.
                // In a real app, you might want to send a 500 error here.
                // For now, it might just serve an empty or malformed response.
            }
            body = data; // Cache the file content.
            // Prepare and cache HTTP headers.
            headers = [
                ['Content-Type', content_type],
                ['Content-Length', data.length]
            ];
            sys.puts('Static file ' + filename + ' successfully loaded and cached.'); // Confirmation log.
            callback(); // Execute the callback after data is loaded.
        });
    }

    // Return the actual request handler function.
    return function (req, res) {
        loadResponseData(function () {
            // Once data is loaded (or retrieved from cache), send the response.
            res.writeHead(200, headers); // Write 200 OK status and cached headers.
            res.write(body);             // Write the cached file content.
            res.end();                   // End the response.
        });
    };
};


/*
 * MIME type utility object.
 * This part is "stolen from jack" (likely a reference to the Jack web server framework).
 */
b.mime = {
    /**
     * Looks up the MIME type for a given file extension.
     *
     * @param {string} ext     The file extension (e.g., '.html').
     * @param {string} fallback An optional fallback MIME type if the extension is not found.
     * @returns {string} The determined MIME type or 'application/octet-stream' as a default fallback.
     */
    lookupExtension: function (ext, fallback) {
        return b.mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
    },

    // A comprehensive list of common MIME types, derived from Rack (a Ruby web server interface).
    TYPES: {
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
        ".zip": "application/zip"
    }
};