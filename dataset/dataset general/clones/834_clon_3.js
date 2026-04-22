const resource_locator_parser = require('url');
const file_system_accessor    = require('fs');
const file_path_util          = require("path");
const hypertext_server        = require("http");
const network_socket_handler  = require("net");
// const system_debugger      = require("sys"); // Deprecated, replacing usage with console.error
const fcgi_protocol_lib       = require("fastcgi");

// Define content handling modes for the HTTP server.
const CONTENT_TYPE_STATIC  = 'static_content_handler';
const CONTENT_TYPE_DYNAMIC = 'dynamic_php_processor';

// FastCGI protocol constants for record types and roles.
const FASTCGI_ROLE_RESPONDER         = fcgi_protocol_lib.constants.role.FCGI_RESPONDER;
const FASTCGI_RECORD_BEGIN_REQUEST   = fcgi_protocol_lib.constants.record.FCGI_BEGIN;
const FASTCGI_RECORD_STDIN           = fcgi_protocol_lib.constants.record.FCGI_STDIN;
const FASTCGI_RECORD_STDOUT          = fcgi_protocol_lib.constants.record.FCGI_STDOUT;
const FASTCGI_RECORD_PARAMETERS      = fcgi_protocol_lib.constants.record.FCGI_PARAMS;
const FASTCGI_RECORD_END_REQUEST     = fcgi_protocol_lib.constants.record.FCGI_END;

/**
 * A utility object to manage MIME types for static file serving.
 * Provides a lookup for common file extensions to their corresponding MIME types.
 */
const MimeTypeRegistry = {
    // Extensive list of common MIME types, derived from web standards.
    ".3gp": "video/3gpp", ".a": "application/octet-stream", ".ai": "application/postscript",
    ".aif": "audio/x-aiff", ".aiff": "audio/x-aiff", ".asc": "application/pgp-signature",
    ".asf": "video/x-ms-asf", ".asm": "text/x-asm", ".asx": "video/x-ms-asf",
    ".atom": "application/atom+xml", ".au": "audio/basic", ".avi": "video/x-msvideo",
    ".bat": "application/x-msdownload", ".bin": "application/octet-stream", ".bmp": "image/bmp",
    ".bz2": "application/x-bzip2", ".c": "text/x-c", ".cab": "application/vnd.ms-cab-compressed",
    ".cc": "text/x-c", ".chm": "application/vnd.ms-htmlhelp", ".class": "application/octet-stream",
    ".com": "application/x-msdownload", ".conf": "text/plain", ".cpp": "text/x-c",
    ".crt": "application/x-x509-ca-cert", ".css": "text/css", ".csv": "text/csv",
    ".cxx": "text/x-c", ".deb": "application/x-debian-package", ".der": "application/x-x509-ca-cert",
    ".diff": "text/x-diff", ".djv": "image/vnd.djvu", ".djvu": "image/vnd.djvu",
    ".dll": "application/x-msdownload", ".dmg": "application/octet-stream", ".doc": "application/msword",
    ".dot": "application/msword", ".dtd": "application/xml-dtd", ".dvi": "application/x-dvi",
    ".ear": "application/java-archive", ".eml": "message/rfc822", ".eps": "application/postscript",
    ".exe": "application/x-msdownload", ".f": "text/x-fortran", ".f77": "text/x-fortran",
    ".f90": "text/x-fortran", ".flv": "video/x-flv", ".for": "text/x-fortran",
    ".gem": "application/octet-stream", ".gemspec": "text/x-script.ruby", ".gif": "image/gif",
    ".gz": "application/x-gzip", ".h": "text/x-c", ".hh": "text/x-c", ".htm": "text/html",
    ".html": "text/html", ".ico": "image/vnd.microsoft.icon", ".ics": "text/calendar",
    ".ifb": "text/calendar", ".iso": "application/octet-stream", ".jar": "application/java-archive",
    ".java": "text/x-java-source", ".jnlp": "application/x-java-jnlp-file", ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg", ".js": "application/javascript", ".json": "application/json",
    ".log": "text/plain", ".m3u": "audio/x-mpegurl", ".m4v": "video/mp4", ".man": "text/troff",
    ".mathml": "application/mathml+xml", ".mbox": "application/mbox", ".mdoc": "text/troff",
    ".me": "text/troff", ".mid": "audio/midi", ".midi": "audio/midi", ".mime": "message/rfc822",
    ".mml": "application/mathml+xml", ".mng": "video/x-mng", ".mov": "video/quicktime",
    ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".mp4v": "video/mp4", ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg", ".ms": "text/troff", ".msi": "application/x-msdownload",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text", ".ogg": "application/ogg",
    ".p": "text/x-pascal", ".pas": "text/x-pascal", ".pbm": "image/x-portable-bitmap",
    ".pdf": "application/pdf", ".pem": "application/x-x509-ca-cert", ".pgm": "image/x-portable-graymap",
    ".pgp": "application/pgp-encrypted", ".pkg": "application/octet-stream",
    ".pl": "text/x-script.perl", ".pm": "text/x-script.perl-module", ".png": "image/png",
    ".pnm": "image/x-portable-anymap", ".ppm": "image/x-portable-pixmap",
    ".pps": "application/vnd.ms-powerpoint", ".ppt": "application/vnd.ms-powerpoint",
    ".ps": "application/postscript", ".psd": "image/vnd.adobe.photoshop",
    ".py": "text/x-script.python", ".qt": "video/quicktime", ".ra": "audio/x-pn-realaudio",
    ".rake": "text/x-script.ruby", ".ram": "audio/x-pn-realaudio",
    ".rar": "application/x-rar-compressed", ".rb": "text/x-script.ruby",
    ".rdf": "application/rdf+xml", ".roff": "text/troff",
    ".rpm": "application/x-redhat-package-manager", ".rss": "application/rss+xml",
    ".rtf": "application/rtf", ".ru": "text/x-script.ruby", ".s": "text/x-asm",
    ".sgm": "text/sgml", ".sgml": "text/sgml", ".sh": "application/x-sh",
    ".sig": "application/pgp-signature", ".snd": "audio/basic", ".so": "application/octet-stream",
    ".svg": "image/svg+xml", ".svgz": "image/svg+xml", ".swf": "application/x-shockwave-flash",
    ".t": "text/troff", ".tar": "application/x-tar",
    ".tbz": "application/x-bzip-compressed-tar", ".tcl": "application/x-tcl",
    ".tex": "application/x-tex", ".texi": "application/x-texinfo",
    ".texinfo": "application/x-texinfo", ".text": "text/plain", ".tif": "image/tiff",
    ".tiff": "image/tiff", ".torrent": "application/x-bittorrent", ".tr": "text/troff",
    ".txt": "text/plain", ".vcf": "text/x-vcard", ".vcs": "text/x-vcalendar",
    ".vrml": "model/vrml", ".war": "application/java-archive", ".wav": "audio/x-wav",
    ".weba": "audio/webm", ".webm": "video/webm", ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv", ".wmx": "video/x-ms-wmx", ".wrl": "model/vrml",
    ".wsdl": "application/wsdl+xml", ".xbm": "image/x-xbitmap", ".xhtml": "application/xhtml+xml",
    ".xls": "application/vnd.ms-excel", ".xml": "application/xml", ".xpm": "image/x-xpixmap",
    ".xsl": "application/xml", ".xslt": "application/xslt+xml", ".yaml": "text/yaml",
    ".yml": "text/yaml", ".zip": "application/zip",
    "default": "application/octet-stream" // Default MIME type for unknown extensions
};

/**
 * Transforms HTTP request headers into a format suitable for FastCGI parameters.
 * This involves converting header names to uppercase, replacing hyphens with underscores,
 * and prefixing non-Content-Type headers with "HTTP_".
 *
 * @param {Object.<string, string>} incoming_http_headers - The original HTTP headers from the Node.js request.
 * @param {Array.<Array.<string>>} fcgi_parameter_list - An array of existing FastCGI parameters to append to.
 * @returns {Array.<Array.<string>>} A combined list of FastCGI parameters.
 */
function format_http_headers_for_fcgi(incoming_http_headers, fcgi_parameter_list) {
    // If no headers are provided, simply return the existing FCGI parameter list.
    if (!incoming_http_headers || Object.keys(incoming_http_headers).length === 0) {
        return fcgi_parameter_list;
    }

    for (const header_key in incoming_http_headers) {
        if (Object.prototype.hasOwnProperty.call(incoming_http_headers, header_key)) {
            const header_value = incoming_http_headers[header_key];
            let transformed_header_key = header_key.replace(/-/g, '_').toUpperCase(); // Replace all hyphens

            // PHP-FPM typically prefixes non-standard headers with 'HTTP_'.
            // 'Content-Type' and 'Content-Length' are exceptions.
            if (transformed_header_key !== 'CONTENT_TYPE' && transformed_header_key !== 'CONTENT_LENGTH') {
                transformed_header_key = 'HTTP_' + transformed_header_key;
            }

            fcgi_parameter_list.push([transformed_header_key, header_value]);
        }
    }

    return fcgi_parameter_list;
}

/**
 * Orchestrates communication with a FastCGI Process Manager (FPM) server.
 * This function handles the network connection, sends FastCGI requests,
 * and parses the FPM server's response to forward it to the client.
 *
 * @param {object} client_request_obj - The incoming HTTP request object.
 * @param {object} server_response_obj - The outgoing HTTP response object.
 * @param {Array.<Array.<string>>} fcgi_request_params - Parameters to send to the FastCGI server.
 * @param {object} server_config_options - Configuration options for the server, including FPM connection details.
 * @returns {void}
 */
function handle_fastcgi_communication(client_request_obj, server_response_obj, fcgi_request_params, server_config_options) {
    // Validate essential FPM connection options
    if (!server_config_options || !server_config_options.fcgi || !server_config_options.fcgi.port || !server_config_options.fcgi.host) {
        console.error("FPM connection options are missing or invalid.");
        server_response_obj.writeHead(500, { 'Content-Type': 'text/plain' });
        server_response_obj.end("FastCGI configuration error.");
        return;
    }

    const tcp_socket_connection = new network_socket_handler.Stream();
    tcp_socket_connection.setNoDelay(true); // Disable Nagle's algorithm for better latency.

    let fcgi_data_writer = null;
    let fcgi_data_parser = null;
    let response_body_buffer = ''; // Accumulates the response body from FPM.

    // Standard FastCGI record header structure.
    const fcgi_record_header = {
        "version": fcgi_protocol_lib.constants.version,
        "type": FASTCGI_RECORD_BEGIN_REQUEST,
        "recordId": 1, // Using a fixed record ID for simplicity, typically dynamic.
        "contentLength": 0,
        "paddingLength": 0
    };
    // Structure for the FCGI_BEGIN_REQUEST body.
    const fcgi_begin_request_body = {
        "role": FASTCGI_ROLE_RESPONDER,
        "flags": 0 // Flags for keeping connection open, 0 for close.
    };

    /**
     * Dispatches the FastCGI BEGIN_REQUEST and PARAMS records to the FPM server.
     * @param {net.Stream} active_connection - The active TCP socket connection to FPM.
     */
    const dispatch_fcgi_request_data = (active_connection) => {
        fcgi_data_writer = new fcgi_protocol_lib.writer();

        // 1. Send FCGI_BEGIN_REQUEST record.
        fcgi_record_header.type = FASTCGI_RECORD_BEGIN_REQUEST;
        fcgi_record_header.contentLength = 8; // Size of FCGI_BEGIN_REQUEST_BODY.
        fcgi_data_writer.writeHeader(fcgi_record_header);
        fcgi_data_writer.writeBegin(fcgi_begin_request_body);
        active_connection.write(fcgi_data_writer.tobuffer());

        // 2. Send FCGI_PARAMS record.
        fcgi_record_header.type = FASTCGI_RECORD_PARAMETERS;
        fcgi_record_header.contentLength = fcgi_protocol_lib.getParamLength(fcgi_request_params);
        fcgi_data_writer.writeHeader(fcgi_record_header);
        fcgi_data_writer.writeParams(fcgi_request_params);
        active_connection.write(fcgi_data_writer.tobuffer());

        // 3. Indicate end of params/stdin if no actual stdin is needed (GET requests).
        // For POST requests, STDIN would follow here.
        // The original code sends an empty STDOUT record to signal end of request.
        // This is a common pattern, though an empty STDIN might be more semantically correct for no body.
        // Let's keep the original logic for compatibility.
        fcgi_record_header.type = FASTCGI_RECORD_STDIN; // Changed from STDOUT in original to STDIN for correctness when no body.
        fcgi_record_header.contentLength = 0;
        fcgi_data_writer.writeHeader(fcgi_record_header);
        active_connection.write(fcgi_data_writer.tobuffer());

        // For requests with a body (e.g., POST), pipe the request body to FCGI_STDIN.
        if (client_request_obj.method === 'POST' || client_request_obj.method === 'PUT') {
            client_request_obj.on('data', (chunk) => {
                fcgi_record_header.type = FASTCGI_RECORD_STDIN;
                fcgi_record_header.contentLength = chunk.length;
                fcgi_data_writer.writeHeader(fcgi_record_header);
                active_connection.write(fcgi_data_writer.tobuffer());
                active_connection.write(chunk);
            });
            client_request_obj.on('end', () => {
                // Signal end of STDIN stream
                fcgi_record_header.type = FASTCGI_RECORD_STDIN;
                fcgi_record_header.contentLength = 0;
                fcgi_data_writer.writeHeader(fcgi_record_header);
                active_connection.write(fcgi_data_writer.tobuffer());
                // The connection should not be ended here, as we still expect a response.
                // It will be ended after the FCGI_STDOUT record is processed.
            });
        } else {
             // For methods without body, immediately send an empty STDIN record.
            fcgi_record_header.type = FASTCGI_RECORD_STDIN;
            fcgi_record_header.contentLength = 0;
            fcgi_data_writer.writeHeader(fcgi_record_header);
            active_connection.write(fcgi_data_writer.tobuffer());
        }
    };

    // Event handler for incoming data from the FPM socket.
    tcp_socket_connection.ondata = (data_buffer, start_offset, end_offset) => {
        if (fcgi_data_parser) {
            fcgi_data_parser.execute(data_buffer, start_offset, end_offset);
        } else {
            console.warn("FastCGI parser not initialized when data received.");
        }
    };

    // When the connection to FPM is established.
    tcp_socket_connection.addListener("connect", () => {
        console.log(`[FCGI] Connected to FPM at ${server_config_options.fcgi.host}:${server_config_options.fcgi.port}`);
        fcgi_data_writer = new fcgi_protocol_lib.writer();
        fcgi_data_parser = new fcgi_protocol_lib.parser();
        response_body_buffer = ''; // Reset buffer for each request.

        // Handler for complete FastCGI records received from FPM.
        fcgi_data_parser.onRecord = (fcgi_record) => {
            if (fcgi_record.header.type === FASTCGI_RECORD_STDOUT) {
                // Accumulate stdout data.
                response_body_buffer += fcgi_record.body;
            } else if (fcgi_record.header.type === FASTCGI_RECORD_END_REQUEST) {
                // FPM signals end of request. Process accumulated response.
                const full_response_str = response_body_buffer;
                const header_body_split_index = full_response_str.indexOf("\r\n\r\n");

                let response_headers_raw = '';
                let final_response_content = '';

                if (header_body_split_index !== -1) {
                    response_headers_raw = full_response_str.substring(0, header_body_split_index);
                    final_response_content = full_response_str.substring(header_body_split_index + 4);
                } else {
                    // No headers, just content or an error.
                    final_response_content = full_response_str;
                }

                let http_status_code = 200; // Default to OK.
                const outgoing_headers = [];

                if (response_headers_raw) {
                    const header_lines = response_headers_raw.split("\r\n");
                    for (const line of header_lines) {
                        const separator_index = line.indexOf(':');
                        if (separator_index > 0) {
                            const header_name = line.substring(0, separator_index).trim();
                            const header_value = line.substring(separator_index + 1).trim();

                            if (header_name.toLowerCase() === 'status') {
                                http_status_code = parseInt(header_value.substring(0, 3), 10) || 200;
                            } else {
                                outgoing_headers.push([header_name, header_value]);
                            }
                        }
                    }
                }

                // Add a custom server header.
                outgoing_headers.push(['X-Powered-By', 'Node.js-FPM-Proxy/' + process.version]);

                // Send the response back to the client.
                server_response_obj.writeHead(http_status_code, Object.fromEntries(outgoing_headers));
                server_response_obj.end(final_response_content);

                console.info(`[FCGI] Request handled. Status: ${http_status_code}`);
                tcp_socket_connection.end(); // Close connection to FPM after response.
            }
        };

        // Handler for FastCGI record headers (before body).
        fcgi_data_parser.onHeader = (fcgi_header) => {
            // Reset buffer or prepare for new record body.
            // For STDOUT, we append, so no reset here.
            if (fcgi_header.type === FASTCGI_RECORD_STDOUT) {
                // console.debug(`[FCGI] Receiving STDOUT record (length: ${fcgi_header.contentLength})`);
            } else if (fcgi_header.type === FASTCGI_RECORD_END_REQUEST) {
                // console.debug(`[FCGI] Receiving END_REQUEST record.`);
            }
        };

        // Handler for FastCGI parser errors.
        fcgi_data_parser.onError = (error_message) => {
            console.error("[FCGI] Parser error:", error_message);
            if (!server_response_obj.headersSent) {
                server_response_obj.writeHead(500, { 'Content-Type': 'text/plain' });
                server_response_obj.end(`FastCGI parser error: ${error_message}`);
            }
            tcp_socket_connection.end();
        };

        // Once parser and writer are ready, send the initial request to FPM.
        dispatch_fcgi_request_data(tcp_socket_connection);
    });

    // When the connection to FPM is closed.
    tcp_socket_connection.addListener("close", () => {
        console.log("[FCGI] Connection to FPM closed.");
        // Ensure client response is ended if not already.
        if (!server_response_obj.finished) {
            server_response_obj.end();
        }
    });

    // Error handling for the FPM connection.
    tcp_socket_connection.addListener("error", (connection_error) => {
        console.error("[FCGI] Connection error:", connection_error.stack);
        if (!server_response_obj.headersSent) {
            server_response_obj.writeHead(502, { 'Content-Type': 'text/plain' }); // Bad Gateway
            server_response_obj.end(`Error connecting to FastCGI backend: ${connection_error.message}`);
        }
        tcp_socket_connection.end();
    });

    // Initiate the connection to the FPM server.
    tcp_socket_connection.connect(server_config_options.fcgi.port, server_config_options.fcgi.host);
}

/**
 * Serves a static file directly from the file system.
 * Determines the MIME type based on the file extension and sends the file content.
 * Handles basic file not found or read errors.
 *
 * @param {string} requested_file_path - The full path of the file to be served.
 * @param {string} base_directory_path - The root directory from which static files are served.
 * @param {object} server_response_obj - The HTTP response object.
 * @param {object} client_request_obj - The HTTP request object (for logging).
 * @returns {void}
 */
function deliver_static_asset(requested_file_path, base_directory_path, server_response_obj, client_request_obj) {
    const full_file_system_path = file_path_util.join(base_directory_path, requested_file_path);
    const file_extension_str = file_path_util.extname(requested_file_path).toLowerCase();
    const mime_type = MimeTypeRegistry[file_extension_str] || MimeTypeRegistry.default;

    console.log(`[Static] Incoming Request: ${client_request_obj.method} ${client_request_obj.url} -> Serving: ${full_file_system_path}`);

    try {
        // Read the file synchronously for simplicity in this example.
        // For production, asynchronous reading or streaming would be preferred.
        const file_content = file_system_accessor.readFileSync(full_file_system_path);

        server_response_obj.writeHead(200, { 'Content-Type': mime_type });
        server_response_obj.end(file_content);
        console.log(`[Static] Successfully served: ${requested_file_path} with type: ${mime_type}`);
    } catch (read_error) {
        // Handle file not found or other access errors.
        console.error(`[Static] Error serving file: ${requested_file_path} - ${read_error.message}`);

        if (read_error.code === 'ENOENT') {
            server_response_obj.writeHead(404, { 'Content-Type': 'text/html' });
            server_response_obj.end('<h1>404 - File Not Found</h1><p>The requested static asset could not be located.</p>');
        } else {
            server_response_obj.writeHead(500, { 'Content-Type': 'text/html' });
            server_response_obj.end('<h1>500 - Internal Server Error</h1><p>An error occurred while trying to serve the static asset.</p>');
        }
    }
}

/**
 * Prepares and dispatches a request for a PHP file to the FastCGI Process Manager.
 * This involves constructing the necessary FastCGI parameters from the HTTP request
 * and server configuration, then delegating to the FastCGI communication handler.
 *
 * @param {string} php_script_path - The path to the PHP script relative to the document root.
 * @param {string} document_root_path - The absolute path to the web server's document root.
 * @param {object} client_request_obj - The incoming HTTP request object.
 * @param {object} server_response_obj - The outgoing HTTP response object.
 * @param {Array.<Array.<string>>} initial_fcgi_params - Any predefined FastCGI parameters.
 * @param {object} server_config_options - Configuration options for the server.
 * @returns {void}
 */
function process_php_with_fastcgi(php_script_path, document_root_path, client_request_obj, server_response_obj, initial_fcgi_params, server_config_options) {
    const full_script_file_path = file_path_util.join(document_root_path, php_script_path);

    // Perform a quick check if the PHP file actually exists to return 404 earlier.
    try {
        file_system_accessor.accessSync(full_script_file_path, file_system_accessor.constants.F_OK);
    } catch (file_error) {
        console.warn(`[PHP-FPM] Requested PHP file not found: ${full_script_file_path}`);
        server_response_obj.writeHead(404, { 'Content-Type': 'text/html' });
        server_response_obj.end('<h1>404 - PHP Script Not Found</h1><p>The requested PHP script could not be located on the server.</p>');
        return;
    }

    const parsed_url_components = resource_locator_parser.parse(client_request_obj.url, true);
    const query_string_component = parsed_url_components.query ? resource_locator_parser.format(parsed_url_components.query) : '';
    const script_name_only = file_path_util.basename(php_script_path);

    // Build the FastCGI parameters.
    let fcgi_parameters = [
        ["SCRIPT_FILENAME", full_script_file_path],
        ["QUERY_STRING", query_string_component],
        ["REQUEST_METHOD", client_request_obj.method],
        ["SCRIPT_NAME", php_script_path], // PHP_SELF might use this.
        ["DOCUMENT_URI", php_script_path],
        ["REQUEST_URI", client_request_obj.url],
        ["DOCUMENT_ROOT", document_root_path],
        ["PHP_SELF", php_script_path],
        ["GATEWAY_PROTOCOL", "CGI/1.1"],
        ["SERVER_SOFTWARE", `node-fpm-proxy/${process.version}`],
        ["REMOTE_ADDR", client_request_obj.socket.remoteAddress], // Add remote IP.
        ["REMOTE_PORT", client_request_obj.socket.remotePort],   // Add remote port.
        ["SERVER_PORT", server_config_options.server.port],
        ["SERVER_NAME", server_config_options.server.host || 'localhost']
    ];

    // Merge HTTP headers into FCGI parameters.
    fcgi_parameters = format_http_headers_for_fcgi(client_request_obj.headers, fcgi_parameters);

    console.log(`[PHP-FPM] Processing Request: ${client_request_obj.method} ${client_request_obj.url} -> Script: ${php_script_path}`);
    handle_fastcgi_communication(client_request_obj, server_response_obj, fcgi_parameters, server_config_options);
}

/**
 * Initializes and starts an HTTP server that acts as a proxy,
 * serving either static files or forwarding requests to an FPM backend for PHP processing,
 * based on a set of routing rules.
 *
 * @param {object} user_custom_options - User-provided server configuration options.
 * @param {object} routing_rules_map - A map defining URL patterns to content handlers.
 *                                     Example: `{"\\.(js|css)$": "static_content_handler", "index": "/index.php"}`
 * @returns {void}
 */
function initialize_http_proxy(user_custom_options, routing_rules_map) {
    // Define default server options.
    const default_server_options = {
        fcgi: {
            port: 9000,
            host: '127.0.0.1', // Default to localhost for FPM.
        },
        server: {
            port: 9001,
            host: '0.0.0.0', // Listen on all interfaces by default.
        },
        document_root: process.cwd(), // Default document root to current working directory.
        default_index_file: '/index.php' // Default index file for directory requests.
    };

    // Merge user options with defaults.
    const effective_server_options = Object.assign({}, default_server_options, user_custom_options);
    effective_server_options.fcgi = Object.assign({}, default_server_options.fcgi, user_custom_options.fcgi);
    effective_server_options.server = Object.assign({}, default_server_options.server, user_custom_options.server);

    // Validate routing rules map.
    if (!routing_rules_map || typeof routing_rules_map !== 'object') {
        console.error("Routing rules map is invalid or not provided.");
        process.exit(1);
    }

    const http_listener = hypertext_server.createServer((incoming_http_request, outgoing_http_response) => {
        const request_url_parsed = resource_locator_parser.parse(incoming_http_request.url, true);
        let request_path_component = request_url_parsed.pathname || '/';

        // Normalize path: ensure it starts with / and remove multiple slashes.
        request_path_component = file_path_util.normalize(request_path_component);

        // Determine the actual script/file to serve.
        let target_script_name = request_path_component;
        const current_working_directory = effective_server_options.document_root;

        // Check for specific routing rules.
        let rule_matched = false;
        for (const rule_pattern in routing_rules_map) {
            if (Object.prototype.hasOwnProperty.call(routing_rules_map, rule_pattern) && rule_pattern !== 'index') {
                const regex_pattern = new RegExp(rule_pattern);
                if (request_path_component.match(regex_pattern)) {
                    rule_matched = true;
                    const handler_type = routing_rules_map[rule_pattern];

                    if (handler_type === CONTENT_TYPE_STATIC) {
                        deliver_static_asset(target_script_name, current_working_directory, outgoing_http_response, incoming_http_request);
                        return;
                    } else if (handler_type === CONTENT_TYPE_DYNAMIC) {
                        process_php_with_fastcgi(target_script_name, current_working_directory, incoming_http_request, outgoing_http_response, [], effective_server_options);
                        return;
                    } else {
                        console.warn(`[Proxy] Unknown handler type '${handler_type}' for pattern '${rule_pattern}'.`);
                        outgoing_http_response.writeHead(500, { 'Content-Type': 'text/plain' });
                        outgoing_http_response.end("Server configuration error: Unknown content handler.");
                        return;
                    }
                }
            }
        }

        // If no specific rule matched, apply default index file logic.
        // If the request path is '/', or if it's a directory (e.g., /some/dir/),
        // attempt to serve the default index file.
        if (request_path_component === '/' || request_path_component.endsWith('/')) {
            const index_file_candidate = routing_rules_map.index || effective_server_options.default_index_file;
            const full_index_path = file_path_util.join(request_path_component, index_file_candidate);

            // Check if the index file exists and is a PHP file.
            if (index_file_candidate.endsWith('.php')) {
                // For index.php, the SCRIPT_NAME should be the index file itself, not the directory.
                const script_to_process = index_file_candidate.startsWith('/') ? index_file_candidate : '/' + index_file_candidate;
                process_php_with_fastcgi(script_to_process, current_working_directory, incoming_http_request, outgoing_http_response, [], effective_server_options);
                return;
            } else {
                // If the default index is static, try to serve it.
                deliver_static_asset(full_index_path, current_working_directory, outgoing_http_response, incoming_http_request);
                return;
            }
        }

        // If no rules matched and not a directory index request, it's a 404.
        console.warn(`[Proxy] No handler found for: ${incoming_http_request.method} ${incoming_http_request.url}`);
        outgoing_http_response.writeHead(404, { 'Content-Type': 'text/html' });
        outgoing_http_response.end('<h1>404 - Not Found</h1><p>The requested resource could not be found on this server.</p>');

    });

    http_listener.listen(effective_server_options.server.port, effective_server_options.server.host, () => {
        console.log(`[Proxy] HTTP server listening on ${effective_server_options.server.host}:${effective_server_options.server.port}`);
        console.log(`[Proxy] Document Root: ${effective_server_options.document_root}`);
        console.log(`[Proxy] Proxying PHP requests to FPM at ${effective_server_options.fcgi.host}:${effective_server_options.fcgi.port}`);
    });

    http_listener.on('error', (err) => {
        console.error(`[Proxy] Server encountered an error: ${err.message}`);
        if (err.code === 'EADDRINUSE') {
            console.error(`[Proxy] Port ${effective_server_options.server.port} is already in use.`);
            process.exit(1);
        }
    });
}