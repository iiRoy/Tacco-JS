/*
 * Copyright (C) 2011,2012 pdfcrowd.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var http = require('http'); // HTTP module for making requests
var querystring = require('querystring'); // Query string parsing and stringifying
var fs = require('fs'); // File system module for file operations


/*
 * Main Pdfcrowd constructor.
 * Initializes the client with user credentials and an optional host.
 */
var Pdfcrowd = function (username, apikey, host) {
    if ( ! username ) {
        throw new Error('Missing username.');
    }

    if ( ! apikey ) {
        throw new Error('Missing apikey.');
    }

    this.username = username;
    this.apikey = apikey;
    this.host = host || "pdfcrowd.com";
};


/*
 * Converts raw HTML code to PDF.
 * @param {string} html - The HTML string to convert.
 * @param {object} callbacks - Callback functions for success, error, and end.
 * @param {object} options - API options for the conversion.
 */
Pdfcrowd.prototype.convertHtml = function ( html, callbacks, options ) {
    if ( ! html )
        throw 'convertHtml: zero size HTML document.';

    requestQueue.addRequest([
        this,
        {
            src: html,
            endpoint: '/api/pdf/convert/html/',
            callbacks: prepareCallbacks(callbacks),
            apiOptions: options
        }
    ]);
};


/*
 * Converts a web page from a given URI to PDF.
 * @param {string} uri - The URL of the web page to convert.
 * @param {object} callbacks - Callback functions.
 * @param {object} options - API options.
 */
Pdfcrowd.prototype.convertURI = function(uri, callbacks, options) {
    if (!uri) {
        throw 'convertURI: invalid URL.';
    }

    requestQueue.addRequest([
        this,
        {
            src: uri,
            endpoint: '/api/pdf/convert/uri/',
            callbacks: prepareCallbacks(callbacks),
            apiOptions: options
        }
    ]);
};


/*
 * Converts a local HTML file to PDF.
 * @param {string} fname - The path to the local HTML file.
 * @param {object} callbacks - Callback functions.
 * @param {object} options - API options.
 */
Pdfcrowd.prototype.convertFile = function ( fname, callbacks, options ) {
    var that = this; // Store context for callback

    fs.readFile(fname, function ( err, data ) {
        if ( err ) {
            throw err;
        }

        if ( ! data ) {
            throw "convertFile: " + fname + " has zero size";
        }

        requestQueue.addRequest([
            that,
            {
                fname: fname,
                data: data.toString('binary'),
                endpoint: '/api/pdf/convert/html/',
                callbacks: prepareCallbacks(callbacks),
                apiOptions: options
            }
        ]);
    });
};


/*
 * Returns a callback object that saves the generated PDF to a specified file.
 * @param {string} fname - The name of the file to save the PDF to.
 * @returns {object} - Callback object.
 */
var saveToFile = function ( fname ) {
    return {
        pdf: function ( rstream ) {
            var wstream = fs.createWriteStream(fname);
            rstream.pipe(wstream);
        },
        error: function ( errMessage, statusCode ) {
            console.log("ERROR: " + errMessage);
        },
        end: function () {
            // No specific action needed on end for file saving
        },
    };
};


/*
 * Returns a callback object that sends the generated PDF as an HTTP response.
 * @param {ServerResponse} response - The HTTP response object.
 * @param {string} disposition - Content-Disposition header value (e.g., "attachment", "inline").
 * @param {string} fname - The suggested filename for the downloaded PDF.
 * @returns {object} - Callback object.
 */
var sendHttpResponse = function ( response, disposition, fname ) {
    disposition = disposition || "attachment";
    fname = fname || "generated.pdf";

    return {
        pdf: function ( rstream ) {
            response.setHeader("Content-Type", "application/pdf");
            response.setHeader("Cache-Control", "max-age=0");
            response.setHeader("Accept-Ranges", "none");
            response.setHeader("Content-Disposition", disposition + "; filename=\"" + fname + "\"");
            rstream.pipe(response);
        },
        error: function ( errMessage, statusCode ) {
            response.setHeader("Content-Type", "text/plain");
            response.end('ERROR: ' + errMessage);
        },
        end: function () {
            // No specific action needed on end for http response
        },
    };
};


/*
 * Module exports.
 * Provides the Pdfcrowd constructor and helper functions.
 */
module.exports = {
    Pdfcrowd: Pdfcrowd,
    saveToFile: saveToFile,
    sendHttpResponse: sendHttpResponse,
};


// ---------------------------------------------------------------------------
//                                  PRIVATE IMPLEMENTATION DETAILS

/*
 * Prepares the callbacks object by adding default implementations
 * for any missing callback functions (pdf, error, end).
 * @param {object} callbacks - User-provided callbacks.
 * @returns {object} - Normalized callbacks object.
 */
var prepareCallbacks = function ( callbacks ) {
    callbacks = callbacks || {};

    if ( typeof callbacks.pdf !== "function" ) {
        callbacks.pdf = function ( rstream ) {
            rstream.destroy(); // Destroy the stream if no handler is provided
            console.warn('WARNING: [Pdfcrowd] Unhandled PDF generation.');
        };
    }

    if ( typeof callbacks.error !== "function" ) {
        callbacks.error = function ( errMessage, statusCode ) {
            console.warn("WARNING: [Pdfcrowd] Unhandled error: %d - %s", statusCode, errMessage);
        };
    }

    if ( typeof callbacks.end !== "function" ) {
        callbacks.end = function () { /* Default empty end handler */ };
    }

    return callbacks;
};


/*
 * Guesses the MIME type of a file based on its extension.
 * Currently only checks for HTML.
 * @param {string} fname - The filename.
 * @returns {string} - The guessed MIME type.
 */
var guess_mimetype = function ( fname ) {
    if ( ( /.*\.html?$/i ).test(fname) ) {
        return 'text/html';
    }

    return 'application/octet-stream';
};

var boundary = '----------ThIs_Is_tHe_bOUnDary_$'; // Boundary string for multipart/form-data


/*
 * Encodes POST data for multipart/form-data requests.
 * Used when uploading a file.
 * @param {object} postData - Key-value pairs for form fields.
 * @param {string} fname - The filename of the uploaded file.
 * @param {Buffer} data - The binary content of the file.
 * @returns {string} - The multipart encoded body.
 */
var encodeMultipartPostData = function ( postData, fname, data ) {
    var body = new Array();

    for ( var field in postData ) {
        if ( postData[field] ) {
            body.push('--' + boundary);
            body.push('Content-Disposition: form-data; name="' + field + '"');
            body.push('');
            body.push(postData[field].toString());
        }
    }

    // Add the file part
    body.push('--' + boundary);
    body.push('Content-Disposition: form-data; name="src"; filename="' + fname + '"');
    body.push('Content-Type: ' + guess_mimetype(fname));
    body.push('');
    body.push(data);

    // Finalize the body with the closing boundary
    body.push('--' + boundary + '--');
    body.push('');

    return body.join('\r\n');
};

/*
 * Internal function to make the API call to Pdfcrowd.
 * Handles both URL-encoded and multipart requests.
 * @param {Pdfcrowd} that - The Pdfcrowd client instance.
 * @param {object} opts - Options for the request, including source, endpoint, callbacks, and API options.
 */
var convertInternal = function ( that, opts ) {
    // Formulate POST data
    var postData = clone_object(opts.apiOptions);
    postData['username'] = that.username;
    postData['key'] = that.apikey;

    var contentType;

    if ( opts.src ) {
        contentType = "application/x-www-form-urlencoded";
        postData['src'] = opts.src;
        postData = querystring.stringify(postData);
    } else {
        contentType = "multipart/form-data; boundary=" + boundary;
        postData = encodeMultipartPostData(postData, opts.fname, opts.data);
    }

    // HTTP request options
    var httpOptions = {
        host: that.host,
        port: 80,
        method: 'POST',
        path: opts.endpoint,
        headers: {
            'content-length': postData.length,
            'content-type': contentType,
            'user-agent': 'node-pdfcrowd client'
        },
    };

    var callbacks = opts.callbacks;

    var req = http.request(httpOptions, function ( res ) {
        if ( res.statusCode < 300 ) {
            res.on('end', function () {
                callbacks.end();
                requestQueue.requestDone();
            });

            res.on('error', function ( exc ) {
                callbacks.error(exc.toString());
                requestQueue.requestDone();
            });

            callbacks.pdf(res);
        } else {
            var err = [];
            res.on('data', function ( chunk ) {
                err.push(chunk.toString());
            });
            res.on('end', function () {
                callbacks.error(err.join(''), res.statusCode);
                requestQueue.requestDone();
            });
        }
    });

    req.on('error', function ( res ) {
        callbacks.error(res.toString(), res.statusCode);
        requestQueue.requestDone();
    });

    req.write(postData, 'binary');
    req.end();
};


/*
 * A global request queue that serializes API calls to prevent
 * overwhelming the server or hitting rate limits.
 */
var requestQueue = {
    init: function () {
        this.queue = [];     // Stores pending requests
        this.working = 0;    // Flag to indicate if a request is currently being processed
    },

    addRequest: function ( req ) {
        this.queue.push(req);
        this.processRequest(); // Attempt to process the request immediately
    },

    requestDone: function () {
        this.working = 0;    // Reset working flag
        this.processRequest(); // Process the next request in queue if available
    },

    processRequest: function () {
        if ( this.queue.length > 0 && ! this.working ) {
            this.working = 1; // Set working flag
            var args = this.queue.shift(); // Get the next request
            convertInternal.apply(null, args); // Execute the request
        }
    }
};
requestQueue.init(); // Initialize the request queue on load


/*
 * Clones a simple object (shallow clone).
 * Used to copy API options without modifying the original.
 * @param {object} obj - The object to clone.
 * @returns {object} - A new object with the same properties.
 */
var clone_object = function ( obj ) {
    var prop, cloned = {};
    for ( prop in obj ) {
        if ( typeof obj[prop] !== 'function' ) { // Only copy non-function properties
            cloned[prop] = obj[prop];
        }
    }
    return cloned;
};