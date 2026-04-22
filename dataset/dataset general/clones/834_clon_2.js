var resourceLocator = require('url');
var fileSystem = require('fs');
var filePath = require("path");
var webServer = require("http");
var networkSocket = require("net");
var systemUtil = require("sys");
var fcgiProtocol = require("fastcgi");


var NODE_RESOURCE_STATIC = 'static';
var NODE_RESOURCE_FCGI = 'fcgi';


var requestParameters;


var FASTCGI_ROLE_RESPONDER = fcgiProtocol.constants.role.FCGI_RESPONDER;
var FASTCGI_RECORD_BEGIN = fcgiProtocol.constants.record.FCGI_BEGIN;
var FASTCGI_RECORD_STDIN = fcgiProtocol.constants.record.FCGI_STDIN;
var FASTCGI_RECORD_STDOUT = fcgiProtocol.constants.record.FCGI_STDOUT;
var FASTCGI_RECORD_PARAMS = fcgiProtocol.constants.record.FCGI_PARAMS;
var FASTCGI_RECORD_END = fcgiProtocol.constants.record.FCGI_END;


/**
 * Prepare HTTP headers for FastCGI Process Manager (FPM).
 *
 * Some HTTP request headers need transformation to align with the FPM
 * specification, while others do not. For example, a 'Content-Type'
 * header must be converted to uppercase, and hyphens replaced with
 * underscores. Conversely, an 'Accept' header also needs to be uppercase,
 * hyphens to underscores, but additionally, the 'HTTP_' prefix must
 * be prepended to it.
 *
 * @param  Array  clientHeaders  An array of incoming HTTP headers from the Node.js request.
 * @param  Array  paramList      An array of pre-existing parameters established in `handleFpmRequest`.
 *
 * @return Array                 A comprehensive array of all processed headers.
 */
function constructHeaders(clientHeaders, paramList) {
    if (clientHeaders.length <= 0) {
        return paramList;
    }

    for (var propertyKey in clientHeaders) {
        var headerValue = clientHeaders[propertyKey];
        propertyKey = propertyKey.replace(/-/, '_').toUpperCase();
        if (propertyKey.indexOf('CONTENT_TYPE') < 0) {
            // This is a quick adjustment for PHP; more or fewer headers might need this.
            propertyKey = 'HTTP_' + propertyKey;
        }

        paramList[paramList.length] = [propertyKey, headerValue];
    }

    return paramList;
}


/**
 * Engage with the FastCGI Process Manager.
 *
 * This routine facilitates communication via the FastCGI protocol
 * utilizing `networkSocket.Stream` and the `fcgiProtocol` module.
 *
 * We transmit the incoming HTTP request, the outgoing HTTP response,
 * various request parameters, and configuration options to manage
 * the client's response.
 *
 * @param Object httpRequest        The incoming HTTP request object.
 * @param Object httpResponse       The outgoing HTTP response object.
 * @param Array  fcgiParams         A collection of parameters to forward to FastCGI.
 * @param Array  serverConfiguration A collection of settings, e.g., the FPM server's port.
 *
 * @return void
 */
function processFastCGIRequest(httpRequest, httpResponse, fcgiParams, serverConfiguration) {
    var socketConnection = new networkSocket.Stream();
    socketConnection.setNoDelay(true);

    var protocolWriter = null;
    var protocolParser = null;

    var fcgiHeader = {
        "protocolVersion": fcgiProtocol.constants.version,
        "recordType": FASTCGI_RECORD_BEGIN,
        "recordIdentifier": 0,
        "dataLength": 0,
        "dataPadding": 0
    };
    var beginRequest = {
        "requestRole": FASTCGI_ROLE_RESPONDER,
        "roleFlags": 0
    };

    function dispatchFastCGIRequest(socketConnection) {
        fcgiHeader.recordType = FASTCGI_RECORD_BEGIN;
        fcgiHeader.dataLength = 8;
        protocolWriter.writeHeader(fcgiHeader);
        protocolWriter.writeBegin(beginRequest);
        socketConnection.write(protocolWriter.tobuffer());

        fcgiHeader.recordType = FASTCGI_RECORD_PARAMS;
        fcgiHeader.dataLength = fcgiProtocol.getParamLength(fcgiParams);
        protocolWriter.writeHeader(fcgiHeader);
        protocolWriter.writeParams(fcgiParams);
        socketConnection.write(protocolWriter.tobuffer());

        fcgiHeader.recordType = FASTCGI_RECORD_STDOUT;
        protocolWriter.writeHeader(fcgiHeader);
        socketConnection.write(protocolWriter.tobuffer());

        socketConnection.end();
    }

    socketConnection.ondata = function(bufferData, startIndex, endIndex) {
        protocolParser.execute(bufferData, startIndex, endIndex);
    };

    socketConnection.addListener("connect", function() {
        protocolWriter = new fcgiProtocol.writer();
        protocolParser = new fcgiProtocol.parser();

        var recordBodyData = "";

        protocolParser.onRecord = function(protocolRecord) {
            if (protocolRecord.header.recordType == FASTCGI_RECORD_STDOUT) {
                recordBodyData = protocolRecord.body;

                var bodySections = recordBodyData.split("\r\n\r\n");

                var responseHeadersText = bodySections[0];
                var headerLines = responseHeadersText.split("\r\n");

                recordBodyData = bodySections[1];

                var httpStatusCode = 200;

                var responseHeaders = [];
                try {
                    for (var idx in headerLines) {
                        var currentHeaderPair = headerLines[idx].split(': ');
                        if (currentHeaderPair[0].indexOf('Status') >= 0) {
                            httpStatusCode = currentHeaderPair[1].substring(0, 3);
                            continue;
                        }

                        responseHeaders.push([currentHeaderPair[0], currentHeaderPair[1]]);
                    }
                } catch (errorObject) {
                    // systemUtil.log(errorObject); // Optionally log errors
                }

                responseHeaders.push(['X-NodeProxy', 'Node.js-' + process.version]);
                httpResponse.writeHead(httpStatusCode, responseHeaders);
                httpResponse.end(recordBodyData);

                systemUtil.log('  --> Request Outcome Status: "' + httpStatusCode + '"');
            }
        };

        protocolParser.onHeader = function(recordHeader) {
            recordBodyData = '';
        };

        protocolParser.onError = function(errorObject) {
            // systemUtil.log(errorObject); // Optionally log protocol errors
        };

        dispatchFastCGIRequest(socketConnection);
    });

    socketConnection.addListener("close", function() {
        socketConnection.end();
    });

    socketConnection.addListener("error", function(errorObject) {
        systemUtil.puts(systemUtil.inspect(errorObject.stack));
        socketConnection.end();
    });

    socketConnection.connect(serverConfiguration.fcgi.listenPort, serverConfiguration.fcgi.listenHost);
}


/**
 * Provide a static file to the client.
 *
 * This routine is responsible for serving static content to users.
 * A static file is identified by checking a predefined mapping of
 * file extensions to MIME types. The file is then read from disk,
 * served with its corresponding 'Content-Type' header, and finally,
 * the response object signals completion.
 *
 * @param  String requestedFile   The filename from the request to be processed.
 * @param  String baseDirectory   The base directory path to the file.
 * @param  Object httpResponse    The HTTP response object.
 * @param  Object httpRequest     The HTTP request object.
 *
 * @return void
 */
function deliverStaticFile(requestedFile, baseDirectory, httpResponse, httpRequest) {
    // MIME type list adapted from djangode
    // @see https://github.com/simonw/djangode/blob/master/djangode.js
    var mimeTypeMap = {
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
        ".weba": "audio/webm",
        ".webm": "video/webm",
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
    };

    systemUtil.log('Incoming HTTP request: ' + httpRequest.method + ' ' + httpRequest.url);
    try {
        httpResponse.writeHead(200, {
            'Content-Type': mimeTypeMap[requestedFile.substring(requestedFile.lastIndexOf('.'), requestedFile.length)]
        });
        httpResponse.write(fileSystem.readFileSync(baseDirectory + requestedFile, 'utf8'));
        httpResponse.end();
    } catch (caughtException) {
        httpResponse.writeHead(404, {
            'Content-Type': mimeTypeMap[requestedFile.substring(requestedFile.lastIndexOf('.'), requestedFile.length)]
        });
        httpResponse.write('<h2>Error page not found</h2>');
        systemUtil.log('  ---> Issue retrieving file: ' + requestedFile);
        httpResponse.end();
    }
}


/**
 * Process the PHP file via FPM.
 *
 * This function is dedicated to serving PHP files by invoking the
 * FastCGI Process Manager. Several crucial parameters, such as
 * SCRIPT_FILENAME, QUERY_STRING, etc., are configured directly within
 * this method.
 *
 * All parameters configured here are essential for the FPM
 * handler to successfully process the incoming request.
 *
 * @param  String targetScriptFile The PHP file to be processed.
 * @param  String scriptBaseDir    The directory containing the script file.
 * @param  Object httpRequest      The incoming HTTP request object.
 * @param  Object httpResponse     The outgoing HTTP response object.
 * @param  Array  fcgiParamsList   A list of parameters to convey.
 * @param  Array  serverConfig     A collection of server configuration options.
 */
function handleFpmRequest(targetScriptFile, scriptBaseDir, httpRequest, httpResponse, fcgiParamsList, serverConfig) {
    try {
        fileSystem.readFileSync(scriptBaseDir + targetScriptFile, 'utf8');
    } catch (readError) {
        systemUtil.log('  ---> Failed to load script: ' + targetScriptFile);
        httpResponse.writeHead(404, {});
        httpResponse.end();
        return;
    }

    var queryString = resourceLocator.parse(httpRequest.url).query ? resourceLocator.parse(httpRequest.url).query : '';
    fcgiParamsList = constructHeaders(httpRequest.headers, [
        ["SCRIPT_FILENAME", scriptBaseDir + '/' + targetScriptFile],
        ["QUERY_STRING", queryString],
        ["REQUEST_METHOD", httpRequest.method],
        ["SCRIPT_NAME", targetScriptFile],
        ["DOCUMENT_URI", targetScriptFile],
        ["REQUEST_URI", httpRequest.url],
        ["DOCUMENT_ROOT", scriptBaseDir],
        ["PHP_SELF", targetScriptFile],
        ["GATEWAY_PROTOCOL", "CGI/1.1"],
        ["SERVER_SOFTWARE", "nodeProxy/" + process.version]
    ]);

    systemUtil.log('Received HTTP request: ' + httpRequest.method + ' ' + httpRequest.url);
    processFastCGIRequest(httpRequest, httpResponse, fcgiParamsList, serverConfig);
}


/**
 * Initialize the core web server.
 *
 * This function acts as the primary constructor, where we supply
 * configuration options and routing definitions. From this, a server
 * is launched that can serve both static files and FastCGI-processed
 * (FPM) files.
 *
 * The `userOptions` object should be structured as follows:
 * <pre><code>
 * {
 *     fastcgiConfig: { listenPort: 9000, listenHost: 'localhost' },
 *     httpServerConfig: { serverListenPort: 9001 }
 * }
 * </code></pre>
 *
 * The `routeMapping` parameter defines the rules for how different
 * resource types are handled:
 * <pre><code>
 * {
 *     "\\.(js|css)$": 'static',
 * }
 * </code></pre>
 *
 * @param Object userOptions    Configuration overrides for the server.
 * @param Object routeMapping   Mapping of URL patterns to handler types.
 */
function initializeWebServer(userOptions, routeMapping) {

    // Let's merge the provided options.
    var effectiveOptions = Object.create({
        fastcgiConfig: {
            listenPort: 9000,
            listenHost: 'localhost', // Can also be a Unix domain socket path.
        },
        httpServerConfig: {
            serverListenPort: 9001,
        }
    });
    Object.assign(effectiveOptions, userOptions); // Assuming `extend` meant a simple merge.

    webServer.createServer(function(incomingRequest, outgoingResponse) {
        /**
         * A checklist of items for future enhancements:
         *
         *  - Accurately determine the invoked script by parsing `incomingRequest.url`
         *    and analyzing the filename.
         *  - Implement URL rewriting rules.
         *  - Define location-based routing blocks.
         *  - Extract and correctly inject HTTP headers into FastCGI parameters.
         */

        // We assume that if the root path "/" is requested, it should resolve to "index.php".
        var targetScriptPath = incomingRequest.url == '/' ? '/index.php' : resourceLocator.parse(incomingRequest.url).pathname;
        var scriptBaseName = targetScriptPath.substring(1, targetScriptPath.length);

        // For simplicity, we use the current working directory as the base.
        // This allows running the server with the current directory as its root.
        var currentWorkingDirectory = process.cwd();

        // Determine the file extension for routing.
        var requestPath = resourceLocator.parse(incomingRequest.url).pathname;
        var fileExtension = requestPath.substring(requestPath.lastIndexOf('.'), requestPath.length);

        for (var routeRule in routeMapping) {
            if (routeRule == 'index') {
                continue;
            }
            if (requestPath.match(routeRule)) {
                if (routeMapping[routeRule] == NODE_RESOURCE_STATIC) {
                    return deliverStaticFile(requestPath, currentWorkingDirectory, outgoingResponse, incomingRequest);
                } else if (routeMapping[routeRule] == NODE_RESOURCE_FCGI) {
                    return handleFpmRequest(targetScriptPath, currentWorkingDirectory, incomingRequest, outgoingResponse, requestParameters, effectiveOptions);
                }
            }
        }

        // If execution reaches this point, neither a PHP file nor a static file
        // matched the routing rules. This might indicate a need for a rewrite,
        // often defaulting to an index page like `/index.php`.
        var fallbackIndexPage = routeMapping['index'] || '/index.php';
        handleFpmRequest(fallbackIndexPage, currentWorkingDirectory, incomingRequest, outgoingResponse, requestParameters, effectiveOptions);

    }).listen(effectiveOptions.httpServerConfig.serverListenPort);
}