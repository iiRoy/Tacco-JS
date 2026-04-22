var url=require('url');
/*
 * File System module for file operations.
 */
var fs=require('fs'); // Core Node.js module for file operations.
var path=require("path"); // Utility for working with file and directory paths.
var http=require("http"); // HTTP server and client functionality.
var net=require("net"); // Networking functionalities.
var sys=require("sys"); // Legacy module for system utilities, often replaced by util.
var fastcgi=require("fastcgi"); // FastCGI protocol implementation.

// Constants for NodePHP operation modes.
var NODEPHP_STATIC = 'static'; /* Designates static file serving. */
var NODEPHP_FCGI   = 'fcgi';   /* Designates FastCGI processing. */

var params; // Global variable for request parameters, potentially reused.

// FastCGI protocol constants, retrieved from the fastcgi module.
var FCGI_RESPONDER = fastcgi.constants.role.FCGI_RESPONDER; /* Role for handling HTTP requests. */
var FCGI_BEGIN     = fastcgi.constants.record.FCGI_BEGIN;     /* Start of request record. */
var FCGI_STDIN     = fastcgi.constants.record.FCGI_STDIN;     /* Standard input stream. */
var FCGI_STDOUT    = fastcgi.constants.record.FCGI_STDOUT;    /* Standard output stream. */
var FCGI_PARAMS    = fastcgi.constants.record.FCGI_PARAMS;    /* Request parameters. */
var FCGI_END       = fastcgi.constants.record.FCGI_END;       /* End of request record. */

/**
 * Make headers for FPM.
 *
 * This function processes HTTP headers received from Node.js and
 * transforms them into a format suitable for the FPM (FastCGI Process Manager)
 * handler. Specific rules apply, such as converting hyphens to underscores
 * and uppercasing, and prepending "HTTP_" to certain headers.
 *
 * @param  array headers An array of existing user headers from the Node.js request.
 * @param  array params  An array of pre-built headers, usually initialized in `serveFpm`.
 *
 * @return array         An array of complete headers ready for FastCGI.
 */
function makeHeaders( headers, params ) {

  // If there are no existing headers, simply return the pre-built parameters.
  if ( headers.length <= 0 ) {
    return params;
  }

  // Iterate over each property (header name) in the headers object.
  for ( prop in headers ) {
    var head = headers[prop]; // Get the header value.

    // Transform the header property name: replace hyphens with underscores and convert to uppercase.
    prop = prop.replace(/-/, '_' ).toUpperCase();

    // Special handling for non-Content-Type headers: prepend "HTTP_".
    if ( prop.indexOf( 'CONTENT_TYPE' ) < 0 ) {
      // This is a common requirement for PHP's $_SERVER superglobal.
      prop = 'HTTP_' + prop;
    }

    // Add the transformed header name and its original value to the parameters array.
    params[params.length] = [prop, head];
  }

  // Return the augmented parameters array.
  return params;

}; // End of makeHeaders function.

/**
 * Interact with FPM.
 *
 * This function establishes a connection with the FastCGI Process Manager (FPM)
 * using `net.Stream` and the `fastcgi` module. It sends the HTTP request
 * details, receives the PHP application's response, and forwards it back
 * to the client.
 *
 * @param object Request  The HTTP Request object from Node.js.
 * @param object Response The HTTP Response object to send the reply.
 * @param array  Params   A list of parameters to pass to FastCGI.
 * @param array  options  A list of configuration options, e.g., FPM server port.
 *
 * @return void
 */
function server( request, response, params, options ) {
  // Establish a new network stream for the FastCGI connection.
  var connection = new net.Stream();
  connection.setNoDelay( true ); // Disable Nagle's algorithm for better performance.

  var writer = null; // FastCGI writer instance.
  var parser = null; // FastCGI parser instance.

  // Initialize FastCGI header object.
  var header = {
    "version": fastcgi.constants.version,
    "type": FCGI_BEGIN,
    "recordId": 0,
    "contentLength": 0,
    "paddingLength": 0
  };

  // Initialize FastCGI BEGIN record payload.
  var begin = {
    "role": FCGI_RESPONDER, // The role is to respond to HTTP requests.
    "flags": 0 // Flags for the begin record.
  };

  /**
   * Sends the FastCGI request to the FPM server.
   * This involves sending the FCGI_BEGIN, FCGI_PARAMS, and FCGI_STDOUT records.
   * @param {net.Stream} connection The established network connection to FPM.
   */
  function sendRequest( connection ) {
    // 1. Send FCGI_BEGIN record.
    header.type = FCGI_BEGIN;
    header.contentLength = 8; // BEGIN record always has a content length of 8.
    writer.writeHeader( header );
    writer.writeBegin( begin );
    connection.write( writer.tobuffer() ); // Write the buffered data to the connection.

    // 2. Send FCGI_PARAMS record.
    header.type = FCGI_PARAMS;
    // Calculate the length of the parameters for the content length.
    header.contentLength = fastcgi.getParamLength( params );
    writer.writeHeader( header );
    writer.writeParams( params );
    connection.write( writer.tobuffer() );

    // 3. Send FCGI_STDOUT record (empty for now, FPM will fill it).
    // This signifies that the client expects output.
    header.type = FCGI_STDOUT;
    writer.writeHeader( header );
    connection.write( writer.tobuffer() );

    // End the connection's write stream, indicating no more data will be sent from our side.
    connection.end();
  };

  // Event handler for incoming data from the FPM server.
  connection.ondata = function ( buffer, start, end ) {
    parser.execute( buffer, start, end ); // Parse the incoming FastCGI stream.
  };

  // Event listener for when the connection to FPM is successfully established.
  connection.addListener( "connect", function () {
    writer = new fastcgi.writer(); // Initialize FastCGI writer.
    parser = new fastcgi.parser(); // Initialize FastCGI parser.

    var body = ""; // Accumulator for the response body.

    // Callback when a complete FastCGI record is parsed.
    parser.onRecord = function ( record ) {
      // Check if the record type is standard output.
      if ( record.header.type == FCGI_STDOUT ) {
        body = record.body; // Extract the body content from the record.

        // PHP responses typically have headers and body separated by double CRLF.
        var parts = body.split( "\r\n\r\n" );

        var headers = parts[0]; // The first part is the HTTP headers.
        var headerParts = headers.split( "\r\n" ); // Split individual header lines.

        body = parts[1]; // The second part is the HTTP response body.

        var responseStatus = 200; // Default HTTP status code.

        headers = []; // Array to store processed HTTP headers.
        try {
          // Process each header line.
          for ( i in headerParts ) {
            var header = headerParts[i].split( ': ' ); // Split header name and value.
            // Special handling for the 'Status' header, which dictates the HTTP status code.
            if ( header[0].indexOf( 'Status' ) >= 0 ) {
              responseStatus = header[1].substr( 0, 3 ); // Extract the 3-digit status code.
              continue; // Move to the next header.
            }
            // Add other headers to the response headers array.
            headers.push( [header[0], header[1]] );
          }
        } catch ( err ) {
          // console.log(err); // Log parsing errors, if any.
        }

        // Add a custom server header to the response.
        headers.push( ['X-Server', 'Node.js-' + process.version] );

        // Write the HTTP response headers and status code.
        response.writeHead( responseStatus, headers );
        response.end( body ); // Send the response body and end the HTTP response.

        console.log( '  --> Request Response Status Code: "' + responseStatus + '"' );
      }
    };

    // Callback when a FastCGI header is parsed (before its body).
    parser.onHeader = function ( header ) {
      body = ''; // Reset body accumulator for a new record.
    };

    // Callback for any parsing errors.
    parser.onError = function ( err ) {
      // console.log(err); // Log parsing errors.
    };

    sendRequest( connection ); // Initiate sending the FastCGI request.
  } );

  // Event listener for when the connection to FPM is closed.
  connection.addListener( "close", function () {
    connection.end(); // Ensure the network connection is fully closed.
  } );

  // Event listener for network errors.
  connection.addListener( "error", function ( err ) {
    sys.puts( sys.inspect( err.stack ) ); // Log the error stack.
    connection.end(); // Close the connection on error.
  } );

  // Connect to the FastCGI server using the provided options.
  connection.connect( options.fcgi.port, options.fcgi.host );

} // End of server function.

/**
 * Serve a static file.
 *
 * This function handles serving static files (e.g., CSS, JS, images)
 * directly from the file system. It determines the correct Content-Type
 * based on the file extension and reads the file content to send it
 * as the HTTP response.
 *
 * @param  string file     The requested file name (e.g., "/style.css").
 * @param  string path     The base path to the directory containing the file.
 * @param  object response The HTTP Response object to send the file.
 * @param  object request  The HTTP Request object (currently unused in this function).
 *
 * @return void
 */
function serveStatic( file, path, response, request ) {
  // List of common MIME types, adapted from djangode.
  // @link https://github.com/simonw/djangode/blob/master/djangode.js
  var types = {
    ".3gp"   : "video/3gpp",
    ".a"     : "application/octet-stream",
    ".ai"    : "application/postscript",
    ".aif"   : "audio/x-aiff",
    ".aiff"  : "audio/x-aiff",
    ".asc"   : "application/pgp-signature",
    ".asf"   : "video/x-ms-asf",
    ".asm"   : "text/x-asm",
    ".asx"   : "video/x-ms-asf",
    ".atom"  : "application/atom+xml",
    ".au"    : "audio/basic",
    ".avi"   : "video/x-msvideo",
    ".bat"   : "application/x-msdownload",
    ".bin"   : "application/octet-stream",
    ".bmp"   : "image/bmp",
    ".bz2"   : "application/x-bzip2",
    ".c"     : "text/x-c",
    ".cab"   : "application/vnd.ms-cab-compressed",
    ".cc"    : "text/x-c",
    ".chm"   : "application/vnd.ms-htmlhelp",
    ".class" : "application/octet-stream",
    ".com"   : "application/x-msdownload",
    ".conf"  : "text/plain",
    ".cpp"   : "text/x-c",
    ".crt"   : "application/x-x509-ca-cert",
    ".css"   : "text/css",
    ".csv"   : "text/csv",
    ".cxx"   : "text/x-c",
    ".deb"   : "application/x-debian-package",
    ".der"   : "application/x-x509-ca-cert",
    ".diff"  : "text/x-diff",
    ".djv"   : "image/vnd.djvu",
    ".djvu"  : "image/vnd.djvu",
    ".dll"   : "application/x-msdownload",
    ".dmg"   : "application/octet-stream",
    ".doc"   : "application/msword",
    ".dot"   : "application/msword",
    ".dtd"   : "application/xml-dtd",
    ".dvi"   : "application/x-dvi",
    ".ear"   : "application/java-archive",
    ".eml"   : "message/rfc822",
    ".eps"   : "application/postscript",
    ".exe"   : "application/x-msdownload",
    ".f"     : "text/x-fortran",
    ".f77"   : "text/x-fortran",
    ".f90"   : "text/x-fortran",
    ".flv"   : "video/x-flv",
    ".for"   : "text/x-fortran",
    ".gem"   : "application/octet-stream",
    ".gemspec": "text/x-script.ruby",
    ".gif"   : "image/gif",
    ".gz"    : "application/x-gzip",
    ".h"     : "text/x-c",
    ".hh"    : "text/x-c",
    ".htm"   : "text/html",
    ".html"  : "text/html",
    ".ico"   : "image/vnd.microsoft.icon",
    ".ics"   : "text/calendar",
    ".ifb"   : "text/calendar",
    ".iso"   : "application/octet-stream",
    ".jar"   : "application/java-archive",
    ".java"  : "text/x-java-source",
    ".jnlp"  : "application/x-java-jnlp-file",
    ".jpeg"  : "image/jpeg",
    ".jpg"   : "image/jpeg",
    ".js"    : "application/javascript",
    ".json"  : "application/json",
    ".log"   : "text/plain",
    ".m3u"   : "audio/x-mpegurl",
    ".m4v"   : "video/mp4",
    ".man"   : "text/troff",
    ".mathml"  : "application/mathml+xml",
    ".mbox"  : "application/mbox",
    ".mdoc"  : "text/troff",
    ".me"    : "text/troff",
    ".mid"   : "audio/midi",
    ".midi"  : "audio/midi",
    ".mime"  : "message/rfc822",
    ".mml"   : "application/mathml+xml",
    ".mng"   : "video/x-mng",
    ".mov"   : "video/quicktime",
    ".mp3"   : "audio/mpeg",
    ".mp4"   : "video/mp4",
    ".mp4v"  : "video/mp4",
    ".mpeg"  : "video/mpeg",
    ".mpg"   : "video/mpeg",
    ".ms"    : "text/troff",
    ".msi"   : "application/x-msdownload",
    ".odp"   : "application/vnd.oasis.opendocument.presentation",
    ".ods"   : "application/vnd.oasis.opendocument.spreadsheet",
    ".odt"   : "application/vnd.oasis.opendocument.text",
    ".ogg"   : "application/ogg",
    ".p"     : "text/x-pascal",
    ".pas"   : "text/x-pascal",
    ".pbm"   : "image/x-portable-bitmap",
    ".pdf"   : "application/pdf",
    ".pem"   : "application/x-x509-ca-cert",
    ".pgm"   : "image/x-portable-graymap",
    ".pgp"   : "application/pgp-encrypted",
    ".pkg"   : "application/octet-stream",
    ".pl"    : "text/x-script.perl",
    ".pm"    : "text/x-script.perl-module",
    ".png"   : "image/png",
    ".pnm"   : "image/x-portable-anymap",
    ".ppm"   : "image/x-portable-pixmap",
    ".pps"   : "application/vnd.ms-powerpoint",
    ".ppt"   : "application/vnd.ms-powerpoint",
    ".ps"    : "application/postscript",
    ".psd"   : "image/vnd.adobe.photoshop",
    ".py"    : "text/x-script.python",
    ".qt"    : "video/quicktime",
    ".ra"    : "audio/x-pn-realaudio",
    ".rake"  : "text/x-script.ruby",
    ".ram"   : "audio/x-pn-realaudio",
    ".rar"   : "application/x-rar-compressed",
    ".rb"    : "text/x-script.ruby",
    ".rdf"   : "application/rdf+xml",
    ".roff"  : "text/troff",
    ".rpm"   : "application/x-redhat-package-manager",
    ".rss"   : "application/rss+xml",
    ".rtf"   : "application/rtf",
    ".ru"    : "text/x-script.ruby",
    ".s"     : "text/x-asm",
    ".sgm"   : "text/sgml",
    ".sgml"  : "text/sgml",
    ".sh"    : "application/x-sh",
    ".sig"   : "application/pgp-signature",
    ".snd"   : "audio/basic",
    ".so"    : "application/octet-stream",
    ".svg"   : "image/svg+xml",
    ".svgz"  : "image/svg+xml",
    ".swf"   : "application/x-shockwave-flash",
    ".t"     : "text/troff",
    ".tar"   : "application/x-tar",
    ".tbz"   : "application/x-bzip-compressed-tar",
    ".tcl"   : "application/x-tcl",
    ".tex"   : "application/x-tex",
    ".texi"  : "application/x-texinfo",
    ".texinfo" : "application/x-texinfo",
    ".text"  : "text/plain",
    ".tif"   : "image/tiff",
    ".tiff"  : "image/tiff",
    ".torrent" : "application/x-bittorrent",
    ".tr"    : "text/troff",
    ".txt"   : "text/plain",
    ".vcf"   : "text/x-vcard",
    ".vcs"   : "text/x-vcalendar",
    ".vrml"  : "model/vrml",
    ".war"   : "application/java-archive",
    ".wav"   : "audio/x-wav",
    ".weba"  : "audio/webm",
    ".webm"  : "video/webm",
    ".wma"   : "audio/x-ms-wma",
    ".wmv"   : "video/x-ms-wmv",
    ".wmx"   : "video/x-ms-wmx",
    ".wrl"   : "model/vrml",
    ".wsdl"  : "application/wsdl+xml",
    ".xbm"   : "image/x-xbitmap",
    ".xhtml"   : "application/xhtml+xml",
    ".xls"   : "application/vnd.ms-excel",
    ".xml"   : "application/xml",
    ".xpm"   : "image/x-xpixmap",
    ".xsl"   : "application/xml",
    ".xslt"  : "application/xslt+xml",
    ".yaml"  : "text/yaml",
    ".yml"   : "text/yaml",
    ".zip"   : "application/zip"
  };

  console.log( 'Incoming Request: ' + request.method + ' ' + request.url );

  try {
    // Determine Content-Type from file extension.
    var fileExtension = file.substr( file.lastIndexOf( '.' ), file.length );
    var contentType = types[fileExtension];

    // Write HTTP headers: 200 OK and the determined Content-Type.
    response.writeHead( 200, {'Content-Type': contentType} );
    // Read the file synchronously and write its content to the response.
    response.write( fs.readFileSync( path + file, 'utf8' ) );
    response.end(); // End the response.
  } catch ( Exception ) {
    // If an error occurs (e.g., file not found).
    response.writeHead( 400, {'Content-Type': types[file.substr( file.lastIndexOf( '.' ), file.length )]} );
    response.write( '<h2>404 - Not Found</h2>' ); // Send a simple 404 message.
    console.log( '  ---> Error loading file: ' + file );
    response.end();
  }
}; // End of serveStatic function.

/**
 * Serve the PHP file to FPM.
 *
 * This function prepares and dispatches a request for a PHP file
 * to the FastCGI Process Manager (FPM). It sets up essential FastCGI
 * parameters like SCRIPT_FILENAME, QUERY_STRING, and HTTP headers,
 * then invokes the `server` function to handle the actual FastCGI communication.
 *
 * @param  string script_file  The name of the PHP script file to process (e.g., "index.php").
 * @param  string script_dir   The directory path where the PHP script resides.
 * @param  object request      The Node.js HTTP Request object.
 * @param  object response     The Node.js HTTP Response object.
 * @param  array  params       An array of FastCGI parameters to be sent.
 * @param  array  options      Configuration options, including FPM server details.
 */
function serveFpm( script_file, script_dir, request, response, params, options ) {

  // First, check if the PHP script file actually exists.
  try {
    fs.readFileSync( script_dir + script_file, 'utf8' );
  } catch ( err ) {
    // If the file does not exist, log an error and send a 404 response.
    console.log( '  ---> Error loading file: ' + script_file );
    response.writeHead( 404, {} );
    response.end();
    return; // Exit the function as the file is not found.
  }

  // Parse the query string from the request URL.
  var qs = url.parse( request.url ).query ? url.parse( request.url ).query : '';

  // Prepare FastCGI parameters.
  // This includes standard CGI variables and transformed HTTP headers.
  params = makeHeaders( request.headers, [
    ["SCRIPT_FILENAME", script_dir + '/' + script_file], // Full path to the script.
    ["QUERY_STRING", qs],                               // URL query string.
    ["REQUEST_METHOD", request.method],                 // HTTP request method (GET, POST, etc.).
    ["SCRIPT_NAME", script_file],                       // Script filename.
    ["DOCUMENT_URI", script_file],                      // Document URI.
    ["REQUEST_URI", request.url],                       // Full request URI.
    ["DOCUMENT_ROOT", script_dir],                      // Document root directory.
    ["PHP_SELF", script_file],                          // PHP_SELF variable.
    ["GATEWAY_PROTOCOL", "CGI/1.1"],                    // CGI protocol version.
    ["SERVER_SOFTWARE", "nodephp/" + process.version]   // Server software identification.
  ] );

  console.log( 'Incoming Request: ' + request.method + ' ' + request.url );

  // Delegate the actual FastCGI communication to the `server` function.
  server( request, response, params, options );

}; // End of serveFpm function.

/**
 * Create the actual HTTP server.
 *
 * This is the main entry point for configuring and starting the Node.js
 * HTTP server. It takes options for FastCGI and the HTTP server itself,
 * along with a block configuration that defines how different URL patterns
 * should be handled (e.g., static files or FastCGI processing).
 *
 * The `options` object defines network configurations:
 * <code>
 * {
 *     fcgi: {port: 9000, host: 'localhost'},
 *     server: {port: 9001}
 * }
 * </code>
 *
 * The `block` parameter specifies routing rules:
 * <code>
 * {
 *     "\.(js|css)$": 'static', // Serve JavaScript and CSS files statically.
 *     "/api/.*": 'fcgi',       // Process API requests via FastCGI.
 *     "index": "/index.php"    // Default index file for root requests.
 * }
 * </code>
 *
 * @param  object opts  User-provided options to override defaults.
 * @param  object block Routing configuration for URL patterns.
 */
function createServer( opts, block ) {

  // Initialize options with defaults and extend them with user-provided `opts`.
  var options = Object.create( {
    fcgi: {
      port: 9000,       // Default FastCGI server port.
      host: 'localhost', // Default FastCGI server host (can be a socket path).
    },
    server: {
      port: 9001,       // Default HTTP server port.
    }
  } );
  // Note: Assuming `options.extend` is a custom method or mixin not provided here.
  // In a real scenario, this would likely be `Object.assign` or a similar utility.
  options.extend( opts );

  // Create the HTTP server instance.
  http.createServer( function ( request, response ) {
    /**
     * Inside this callback, incoming HTTP requests are processed.
     *
     * Future improvements could include:
     *  - More sophisticated URL parsing to retrieve the correct script.
     *  - Implementation of rewrite rules based on configuration.
     *  - Support for location blocks similar to Nginx or Apache.
     *  - Robust extraction and insertion of HTTP headers into FastCGI parameters.
     */

    // Determine the script file. If the URL is '/', default to '/index.php'.
    var script_file = request.url == '/' ? '/index.php' : url.parse( request.url ).pathname;
    // Extract the script name without the leading slash.
    var script_name = script_file.substr( 1, script_file.length );

    // For simplicity, the document root is set to the current working directory.
    var __script_dir__ = process.cwd();

    // Get the pathname and file extension for routing.
    var pathname = url.parse( request.url ).pathname;
    var extension = pathname.substr( pathname.lastIndexOf( '.' ), pathname.length );

    // Iterate through the routing block rules.
    for ( rule in block ) {
      if ( rule == 'index' ) {
        continue; // Skip the 'index' rule for pattern matching.
      }
      // If the pathname matches a defined rule.
      if ( pathname.match( rule ) ) {
        if ( block[rule] == NODEPHP_STATIC ) {
          // If the rule specifies static serving.
          return serveStatic( pathname, __script_dir__, response, request );
        } else if ( block[rule] == NODEPHP_FCGI ) {
          // If the rule specifies FastCGI processing.
          return serveFpm( script_file, __script_dir__, request, response, params, options );
        }
      }
    }

    // If no specific rule matched, fall back to serving the default index file via FPM.
    // This handles cases like requests to '/' or other paths that should be handled by PHP's index.
    var default_index = block['index'] || '/index.php'; // Use configured index or default to /index.php.
    serveFpm( default_index, __script_dir__, request, response, params, options );

  } ).listen( options.server.port ); // Start the HTTP server on the configured port.

} // End of createServer function.