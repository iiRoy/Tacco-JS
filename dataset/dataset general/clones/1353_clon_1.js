/*
 * This file implements a WebSocket server module.
 * It provides basic WebSocket handshake and data handling.
 * This is a Type I clone, preserving all original code tokens
 * but altering whitespace and comments extensively.
 */

exports.ws = function (net, sys) {

    // Default port for the WebSocket server
    this.port = 8080;

    // Default IP address for the WebSocket server
    this.ip = '127.0.0.1';

    // Server instance, initially null
    this.server = null;

    // Object to store connected clients, keyed by SID
    var clients = {},
        // Object to store routing functions for different resources
        routes = {},
        // Reference to the current 'this' context
        that = this,
        // Regular expressions for parsing WebSocket handshake request headers
        requestHeaders = [
            /^GET (.*) HTTP\/1\.1$/,
            /^Upgrade: WebSocket$/,
            /^Connection: Upgrade$/,
            /^Host: (.*)$/,
            /^Origin: (.*)$/,
            /^Sec-WebSocket-Protocol: (.*)$/,
            /^Sec-WebSocket-Key1: (.*)$/,
            /^Sec-WebSocket-Key2: (.*)$/
        ],
        // Response headers for the WebSocket handshake
        responseHeaders = [
            'HTTP/1.1 101 WebSocket Protocol Handshake',
            'Upgrade: WebSocket',
            'Connection: Upgrade',
            'Sec-WebSocket-Origin: {ORIGIN}',
            'Sec-WebSocket-Location: {LOCATION}',
            'Sec-WebSocket-Protocol: {PROTOCOL}'
        ];

    // Object to store parsed parameters from the handshake request
    var responseParam = {};


    /**
     * Aborts a stream connection.
     * @param {net.Socket} stream - The network stream to abort.
     */
    function _abort(stream) {
        stream.end();
    }


    /**
     * Packs a 32-bit integer into a 4-byte Buffer.
     * Used for calculating the WebSocket handshake response.
     * @param {number} num - The number to pack.
     * @returns {Buffer} A 4-byte Buffer representing the number.
     */
    function pack(num) {
        return new Buffer([
            num >> 24 & 0xFF,
            num >> 16 & 0xFF,
            num >> 8 & 0xFF,
            num & 0xFF
        ]);
    };


    /**
     * Parses the WebSocket handshake request data to extract parameters.
     * @param {Buffer} _data - The raw request data buffer.
     * @param {Array<RegExp>} _requestHeaders - Array of regex rules for parsing headers.
     * @returns {Object} An object containing parsed request parameters.
     */
    function _getParams(_data, _requestHeaders) {
        // Initialize an object to hold all potential response parameters
        var _responseParam = {
            resource: null,
            upgrade: null,
            connection: null,
            host: null,
            port: null,
            origin: null,
            protocol: null,
            chalenge: null, // Typo in original code, preserving it
            key1: null,
            key2: null,
            key3: null,
            location: null,
            k1s: null, // Key 1 spaces count
            k2s: null  // Key 2 spaces count
        };

        // Convert data to UTF-8 string and split into individual header fields
        var data1 = _data.toString('utf8', 0, _data.length);
        var fields = data1.split('\r\n');

        // Iterate over each field to match against request header rules
        fields.map(function (item) {
            _requestHeaders.map(function (rule, j) {
                var matches = [],
                    t; // Temporary variable

                matches = item.match(rule);

                if (matches && matches.length > 0) {
                    // Process matches based on the rule index
                    switch (j) {
                        case 0: // GET /resource HTTP/1.1
                            if (matches.length == 2)
                                _responseParam.resource = matches[1];
                            break;
                        case 1: // Upgrade: WebSocket
                            if (matches.length == 1)
                                _responseParam.upgrade = matches[0];
                            break;
                        case 2: // Connection: Upgrade
                            if (matches.length == 1)
                                _responseParam.connection = matches[0];
                            break;
                        case 3: // Host: hostname:port
                            if (matches.length == 2)
                                t = matches[1];
                            if (t.indexOf(':') > -1) {
                                t = t.split(':');
                                _responseParam.host = t[0];
                                _responseParam.port = t[1];
                            } else {
                                _responseParam.host = t;
                            }
                            break;
                        case 4: // Origin: origin_url
                            if (matches.length == 2)
                                _responseParam.origin = matches[1];
                            break;
                        case 5: // Sec-WebSocket-Protocol: protocol_name
                            if (matches.length == 2)
                                _responseParam.protocol = matches[1];
                            break;
                        case 6: // Sec-WebSocket-Key1: key1_value
                            if (matches.length == 2)
                                t = parseInt(matches[1].replace(/[^\d]/g, ''), 10); // Extract digits, convert to int
                            _responseParam.k1s = matches[1].replace(/[^ ]/g, '').length; // Count spaces
                            // Validate Key1
                            if (0 === (t % _responseParam.k1s) && _responseParam.k1s !== 0 && t < 4294967295) {
                                _responseParam.key1 = t / _responseParam.k1s;
                            }
                            break;
                        case 7: // Sec-WebSocket-Key2: key2_value
                            if (matches.length == 2)
                                t = parseInt(matches[1].replace(/[^\d]/g, '')); // Extract digits, convert to int
                            _responseParam.k2s = matches[1].replace(/[^ ]/g, '').length; // Count spaces
                            // Validate Key2
                            if (0 === (t % _responseParam.k2s) && _responseParam.k2s !== 0 && t < 4294967295) {
                                _responseParam.key2 = t / _responseParam.k2s;
                            }
                            break;
                    }
                }
            });
        });

        // Search for the 8-byte challenge key (Key3) at the end of the headers
        for (var m = 0; m < _data.length; m++) {
            if (_data[m] == 0x0D && _data[m + 1] == 0x0A && _data[m + 2] == 0x0D && _data[m + 3] == 0x0A) {
                _responseParam.key3 = _data.slice(m + 4, m + 12);
                break;
            }
        }

        return _responseParam;
    }


    /**
     * Checks if all required parameters for a valid WebSocket handshake are present.
     * @param {Object} _responseParam - The parsed request parameters.
     * @returns {boolean} True if the request is valid, false otherwise.
     */
    function _checkRequestValid(_responseParam) {
        var required = [
            'resource',
            'upgrade',
            'connection',
            'host',
            'origin',
            'key1',
            'key2',
            'key3'
        ];
        var flag = true;

        required.map(function (item) {
            if (!_responseParam[item]) {
                sys.log('client handshake invalid: ' + item);
                flag = false;
            }
        });

        return flag;
    }


    /**
     * Handles the WebSocket handshake process.
     * @param {Buffer} data - The raw request data.
     * @param {Array<RegExp>} requestHeaders - The rules for parsing request headers.
     * @param {net.Socket} stream - The client network stream.
     * @param {Object} state - The connection state object.
     */
    function _handshake(data, requestHeaders, stream, state) {
        // Parse parameters from the incoming data
        responseParam = _getParams(data, requestHeaders);

        sys.log('param got');

        // Validate the request and check if the resource has a registered route
        if (!_checkRequestValid(responseParam) || !_checkRoute(responseParam.resource)) {
            _abort(stream);
            sys.log(responseParam.resource);
            sys.log('param no valid');
            return; // Exit if handshake is invalid
        }

        sys.log('client handshake is valid.');

        // Construct the Sec-WebSocket-Location header value
        responseParam.location = 'ws://' + responseParam.host + (responseParam.port ? ':' + responseParam.port : '') + responseParam.resource;

        // Prepare the response header string
        var responseHeader = responseHeaders.concat('', '').join('\r\n');

        // Calculate the MD5 hash for the handshake response
        var md5 = require('crypto').createHash('md5');
        md5.update(pack(parseInt(responseParam.key1)).toString('binary'));
        md5.update(pack(parseInt(responseParam.key2)).toString('binary'));
        md5.update(responseParam.key3.toString('binary', 0, responseParam.key3.length));

        // Replace placeholders in the response header
        responseHeader = responseHeader.replace(/\{ORIGIN\}/, responseParam.origin)
            .replace(/\{LOCATION\}/, responseParam.location)
            .replace(/\{PROTOCOL\}/, responseParam.protocol);

        // Send the handshake response back to the client
        stream.write(responseHeader + md5.digest('binary'), 'binary');
        sys.log('server handshake sent ok.');

        state.handshaked = true; // Mark connection as handshaked
        return;
    }


    /**
     * Checks if a given resource path has a registered route.
     * @param {string} curr - The current resource path.
     * @returns {boolean} True if a route exists, false otherwise.
     */
    function _checkRoute(curr) {
        for (var i in routes) {
            if (routes.hasOwnProperty(i)) {
                if (i === curr)
                    return true;
            }
        }
        return false;
    }


    /**
     * Receives and processes data frames from a WebSocket client.
     * @param {Buffer} data - The raw data frame.
     * @param {Object} clients - Object containing all connected clients.
     * @param {string} sid - The session ID of the current client.
     */
    function _receiveData(data, clients, sid) {
        // Handle close frame (0xFF 0x00)
        if (data.length == 2) {
            if (data[0] == 0xFF && data[1] == 0x00) {
                _abort(clients[sid]);
                return;
            }
        }

        // Check for opening frame marker (0x00)
        if (data[0] != 0x00) {
            return;
        }

        /*
        // This commented block was part of the original code,
        // now uncommented for demonstration of comment modification.
        function writePacket(s, stream) {
            stream.write(new Buffer([0]));
            stream.write(s, 'utf8');
            stream.write(new Buffer([255]));
        }
        */

        // Extract content from the data frame (excluding 0x00 and 0xFF markers)
        var content = data.toString('utf8', 1, data.length - 1);
        sys.log('frame data: ' + content);

        // If a route exists for the resource, call its handler function
        if (_checkRoute(responseParam.resource)) {
            if (!(undefined === routes[responseParam.resource]) && (typeof routes[responseParam.resource]).toLowerCase() === 'function') {
                routes[responseParam.resource].call(this, content, clients, sid);
            }
        }

        /*
        // Another commented block from the original code, now re-formatted.
        (function (content, clients, sid) {
            var sync = null;
            try {
                sync = JSON.parse(content).sync;
            } catch (e) {
                sys.log(e);
            }
            for (var i in clients) {
                if (clients.hasOwnProperty(i) && (sync == "all" || (sync == "other" && i != sid) || (sync == "self" && i == sid))) {
                    this.writePacket(content, clients[i]);
                }
            }
        }).call(this, content, clients, sid);
        */
    }


    /**
     * Writes a WebSocket data packet to a stream.
     * This method is exposed publicly.
     * @param {string} s - The string content to send.
     * @param {net.Socket} stream - The network stream to write to.
     */
    this.writePacket = function (s, stream) {
        stream.write(new Buffer([0]));   // Frame start marker
        stream.write(s, 'utf8');         // Actual data
        stream.write(new Buffer([255])); // Frame end marker
    };


    /**
     * Starts the WebSocket server.
     * @param {number} port - The port number to listen on.
     * @param {string} ip - The IP address to bind to.
     * @returns {Object} The current instance of the WebSocket server.
     */
    this.start = function (port, ip) {
        this.port = port || 8080; // Use provided port or default
        this.ip = ip || '127.0.0.1'; // Use provided IP or default
        var that = this; // Capture 'this' for use in closures

        // Create the TCP server instance
        this.server = net.createServer(function (stream) {
            // State object for the current connection
            var state = {
                handshaked: false
            };

            // Event listener for 'connect'
            stream.on('connect', function () {
                // Generate a unique session ID for the client
                this.sid = this.remoteAddress + ((new Date().getTime()) + Math.random() * 100);
                clients[this.sid] = stream; // Store the stream
                sys.log('client connected. sid: [' + this.sid + ']');
                sys.log('clients length: ' + clients.length);
            });

            // Event listener for 'data'
            stream.on('data', function (data) {
                if (!state.handshaked) {
                    // If not handshaked, perform the handshake
                    _handshake(data, requestHeaders, stream, state);
                } else {
                    // If handshaked, process the data frame
                    _receiveData.call(that, data, clients, this.sid);
                    //sys.log('data received.'); // Original commented line
                }
            });

            // Event listener for 'end'
            stream.on('end', function () {
                stream.end(); // Ensure stream is fully ended
                sys.log('client end');
            });

            // Event listener for 'close'
            stream.on('close', function () {
                stream.destroy(); // Destroy the stream resources
                delete clients[this.sid]; // Remove client from the list
                sys.log('client: [' + this.sid + '] closed');
            });
        });

        // Event listener for server 'close'
        this.server.on('close', function () {
            sys.log('server closed');
        });

        // Start listening for incoming connections
        this.server.listen(this.port, this.ip);
        return this; // Allow chaining
    };


    /**
     * Closes the WebSocket server and all active client connections.
     */
    this.close = function () {
        // Iterate through all connected clients and close their streams
        for (i in clients) {
            clients[i].end();
            clients[i].destroy();
            delete clients[i];
        }
        this.server.close(); // Close the server itself
    };


    /**
     * Registers a route handler for a specific WebSocket resource path.
     * @param {string} rs - The resource path (e.g., "/echo").
     * @param {Function} cb - The callback function to execute when data is received for this resource.
     * @returns {Object} The current instance of the WebSocket server.
     */
    this.route = function (rs, cb) {
        if ((typeof cb).toLowerCase() == 'function') {
            routes[rs] = cb; // Assign the callback to the resource route
        }
        return this; // Allow chaining
    };
};