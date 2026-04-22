/*
 * S3Ajax v0.1 - A utility library for interacting with Amazon S3 via AJAX.
 *
 * Project Homepage: http://decafbad.com/trac/wiki/S3Ajax
 * Contact: l.m.orchard@pobox.com
 * License: Share and Enjoy (per original author's intent).
 *
 * Dependencies:
 *   - SHA1 hashing library: http://pajhome.org.uk/crypt/md5/sha1.js
 */

// NOTE: Investigate potential PUT/DELETE method limitations in Safari. This might be an old issue.

S3Ajax =
{
    // Configuration option to append a timestamp to GET request URLs
    // to prevent browser caching of responses.
    DEFEAT_CACHE:             false,

    // The Access Control List (ACL) to apply by default when new objects are uploaded.
    DEFAULT_ACL:              'public-read',

    // The default Content-Type header to use for new object uploads,
    // if not explicitly specified.
    DEFAULT_CONTENT_TYPE:     'text/html; charset=UTF-8',

    /*
     * !!! IMPORTANT SECURITY WARNING !!!
     *
     * Do NOT hardcode your AWS KEY_ID and SECRET_KEY directly into this file.
     * These credentials MUST be sourced dynamically from client-side input
     * (e.g., user input, temporary session tokens) and NEVER stored permanently
     * in any publicly accessible client-side or server-side code.
     *
     * Compromised credentials will grant unauthorized access to your AWS account.
     *
     * Example of safe credential handling (assuming a DOM library like Prototype.js):
     *
     * S3Ajax.KEY_ID     = $('key_id').value; // Retrieve from a form field
     * S3Ajax.SECRET_KEY = $('secret_key').value; // Retrieve from a form field
     */
    URL:              'http://s3.amazonaws.com',
    KEY_ID:           '', // Placeholder for AWS Access Key ID
    SECRET_KEY:       '', // Placeholder for AWS Secret Access Key

    // Set to 'true' to enable verbose debugging output and store last request/object.
    DEBUG:            false,

    /**
     * Retrieves the content of a specific key within an S3 bucket.
     *
     * @param {string} bucket   The name of the S3 bucket.
     * @param {string} key      The key of the object to retrieve.
     * @param {function} cb     Callback function for successful retrieval (req, responseText).
     * @param {function} err_cb Optional error callback function (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    get: function ( bucket, key, cb, err_cb )
    {
        // Delegate to the generic HTTP client for S3 operations.
        return this.httpClient(
        {
            method:     'GET',
            resource:   '/' + bucket + '/' + key,
            load:       function ( req, obj )
            {
                // If a success callback is provided, invoke it with the request and response text.
                if ( cb )
                {
                    return cb( req, req.responseText );
                }
            },
            error:      function ( req, obj )
            {
                // Prioritize the error callback if available.
                if ( err_cb )
                {
                    return err_cb( req, obj );
                }
                // Fallback to the success callback even on error if no specific error handler.
                if ( cb )
                {
                    return cb( req, req.responseText );
                }
            }
        });
    },

    /**
     * Fetches metadata for a key in a bucket without retrieving the object content.
     * This uses the HEAD HTTP method.
     *
     * @param {string} bucket   The name of the S3 bucket.
     * @param {string} key      The key of the object to check.
     * @param {function} cb     Callback function for successful HEAD (req, responseText).
     * @param {function} err_cb Optional error callback function (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    head: function ( bucket, key, cb, err_cb )
    {
        return this.httpClient(
        {
            method:     'HEAD',
            resource:   '/' + bucket + '/' + key,
            load:       function ( req, obj )
            {
                if ( cb )
                {
                    return cb( req, req.responseText );
                }
            },
            error:      function ( req, obj )
            {
                if ( err_cb )
                {
                    return err_cb( req, obj );
                }
                if ( cb )
                {
                    return cb( req, req.responseText );
                }
            }
        });
    },

    /**
     * Uploads data to a specified key within an S3 bucket.
     *
     * @param {string} bucket           The name of the S3 bucket.
     * @param {string} key              The key (path) for the object.
     * @param {any} content             The data to upload (e.g., string, Blob).
     * @param {object} [params]         Optional parameters including content_type, acl, meta.
     * @param {function} [cb]           Callback for successful upload (req).
     * @param {function} [err_cb]       Optional error callback (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    put: function ( bucket, key, content )
    {
        // This function supports optional parameters using the arguments object.
        // It expects arguments in the order: bucket, key, content, [params], [cb], [err_cb].
        var idx = 3; // Starting index for optional arguments.
        var params = {}; // Initialize parameters object.

        // Check if the fourth argument is an object, indicating it's the 'params' object.
        if ( typeof arguments[idx] == 'object' )
        {
            params = arguments[idx++]; // Assign and advance index.
        }

        // Retrieve the success callback and error callback from the arguments.
        var cb = arguments[idx++];
        var err_cb = arguments[idx++];

        // Apply default content type if not provided in params.
        if ( !params.content_type )
        {
            params.content_type = this.DEFAULT_CONTENT_TYPE;
        }

        // Apply default ACL if not provided in params.
        if ( !params.acl )
        {
            params.acl = this.DEFAULT_ACL;
        }

        return this.httpClient(
        {
            method:         'PUT',
            resource:       '/' + bucket + '/' + key,
            content:        content,
            content_type:   params.content_type,
            meta:           params.meta,
            acl:            params.acl,
            load:           function ( req, obj )
            {
                if ( cb )
                {
                    return cb( req ); // Success callback receives only the request object.
                }
            },
            error:          function ( req, obj )
            {
                if ( err_cb )
                {
                    return err_cb( req, obj ); // Error callback receives request and parsed error object.
                }
                if ( cb )
                {
                    return cb( req, obj ); // Fallback to success callback for errors if no specific error handler.
                }
            }
        });
    },

    /**
     * Lists all S3 buckets associated with the current AWS account.
     *
     * @param {function} cb         Callback for successful listing (req, obj).
     * @param {function} err_cb     Optional error callback (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    listBuckets: function ( cb, err_cb )
    {
        return this.httpClient(
        {
            method:         'GET',
            resource:       '/', // Root resource for listing buckets.
            force_lists:    [ 'ListAllMyBucketsResult.Buckets.Bucket' ], // Ensure 'Bucket' is always an array.
            load:           cb,
            error:          err_cb
        });
    },

    /**
     * Creates a new S3 bucket with the specified name.
     * Note: Bucket names must be globally unique.
     *
     * @param {string} bucket       The name of the new bucket.
     * @param {function} cb         Callback for successful creation (req, obj).
     * @param {function} err_cb     Optional error callback (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    createBucket: function ( bucket, cb, err_cb )
    {
        return this.httpClient(
        {
            method:     'PUT',
            resource:   '/' + bucket,
            load:       cb,
            error:      err_cb
        });
    },

    /**
     * Deletes an existing S3 bucket. The bucket must be empty before it can be deleted.
     *
     * @param {string} bucket       The name of the bucket to delete.
     * @param {function} cb         Callback for successful deletion (req, obj).
     * @param {function} err_cb     Optional error callback (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    deleteBucket: function ( bucket, cb, err_cb )
    {
        return this.httpClient(
        {
            method:     'DELETE',
            resource:   '/' + bucket,
            load:       cb,
            error:      err_cb
        });
    },

    /**
     * Lists the keys (objects) within a specified S3 bucket, with optional filtering parameters.
     *
     * @param {string} bucket       The name of the S3 bucket.
     * @param {object} params       Query parameters for listing (e.g., prefix, max-keys).
     * @param {function} cb         Callback for successful listing (req, obj).
     * @param {function} err_cb     Optional error callback (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    listKeys: function ( bucket, params, cb, err_cb )
    {
        return this.httpClient(
        {
            method:         'GET',
            resource:       '/' + bucket,
            force_lists:    [ 'ListBucketResult.Contents' ], // Ensure 'Contents' is always an array.
            params:         params,
            load:           cb,
            error:          err_cb
        });
    },

    /**
     * Deletes a single object (key) from an S3 bucket.
     *
     * @param {string} bucket       The name of the S3 bucket.
     * @param {string} key          The key of the object to delete.
     * @param {function} cb         Callback for successful deletion (req, obj).
     * @param {function} err_cb     Optional error callback (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    deleteKey: function ( bucket, key, cb, err_cb )
    {
        return this.httpClient(
        {
            method:     'DELETE',
            resource:   '/' + bucket + '/' + key,
            load:       cb,
            error:      err_cb
        });
    },

    /**
     * Recursively deletes a provided list of keys from an S3 bucket.
     * Provides optional callbacks for individual key deletion and overall completion.
     *
     * @param {string} bucket       The name of the S3 bucket.
     * @param {Array<string>} list  An array of keys to be deleted. This array will be modified (shifted).
     * @param {function} [one_cb]   Optional callback for each key deleted (key).
     * @param {function} [all_cb]   Optional callback for when all keys in the list have been processed.
     */
    deleteKeys: function ( bucket, list, one_cb, all_cb )
    {
        var _this = this; // Capture 'this' for use in nested callbacks.

        // Base case: If the list of keys is empty, and an 'all_cb' is provided,
        // invoke it to signal completion.
        if ( !list.length && all_cb )
        {
            return all_cb();
        }

        // Retrieve the next key from the beginning of the list for deletion.
        var key = list.shift();

        // Initiate deletion of the current key.
        this.deleteKey( bucket, key, function ()
        {
            // If an individual key callback is provided, invoke it.
            if ( one_cb )
            {
                one_cb( key );
            }

            // Recursively call deleteKeys to process the remainder of the list.
            _this.deleteKeys( bucket, list, one_cb, all_cb );
        });
    },

    /**
     * Core HTTP client for making authenticated requests to Amazon S3.
     * This method handles signing requests, setting headers, and processing responses.
     *
     * @param {object} kwArgs               An object containing request options.
     * @param {string} kwArgs.method        HTTP method (e.g., 'GET', 'PUT', 'DELETE', 'HEAD').
     * @param {string} kwArgs.resource      The S3 resource path (e.g., '/bucket/', '/bucket/key').
     * @param {object} [kwArgs.params]      Query string parameters.
     * @param {any} [kwArgs.content]        Request body content for PUT requests.
     * @param {string} [kwArgs.content_type] Content-Type header.
     * @param {string} [kwArgs.acl]         Access Control List header (e.g., 'public-read').
     * @param {object} [kwArgs.meta]        Custom metadata headers (x-amz-meta-*).
     * @param {boolean} [kwArgs.anonymous]  If true, skips authentication.
     * @param {Array<string>} [kwArgs.force_lists] Paths in XML response to always treat as arrays.
     * @param {boolean} [kwArgs.parseXML]   If false, disables XML parsing of response.
     * @param {function} kwArgs.load        Callback for successful response (req, obj).
     * @param {function} [kwArgs.error]     Callback for error response (req, obj).
     * @returns {XMLHttpRequest} The XMLHttpRequest object.
     */
    httpClient: function ( kwArgs )
    {
        var _this = this; // Preserve context for nested functions.

        // Cache busting logic: for GET/HEAD requests, append a unique timestamp parameter.
        if ( this.DEFEAT_CACHE && ( kwArgs.method == "GET" || kwArgs.method == "HEAD" ) )
        {
            if ( !kwArgs.params )
            {
                kwArgs.params = {}; // Initialize params object if it doesn't exist.
            }
            kwArgs.params["___"] = new Date().getTime(); // Add a unique timestamp.
        }

        // Construct the query string and the full URL for the request.
        var qs = ( kwArgs.params ) ? '?' + queryString( kwArgs.params ) : '';
        var url = this.URL + kwArgs.resource + qs;
        var hdrs = {}; // Object to hold HTTP headers.

        // Determine and set the Content-Type header.
        if ( !kwArgs.content_type && kwArgs.method == 'PUT' )
        {
            kwArgs.content_type = 'text/plain; charset=UTF-8'; // Default for PUT if not specified.
        }
        if ( kwArgs.content_type )
        {
            hdrs['Content-Type'] = kwArgs.content_type;
        }
        else
        {
            kwArgs.content_type = ''; // Ensure it's an empty string for signing if not present.
        }

        // Generate the HTTP Date header for the request.
        var http_date = this.httpDate();

        var content_MD5 = ''; // Placeholder for Content-MD5, currently unused.
        /*
         * // Future improvement: Implement Content-MD5 hashing for request bodies.
         * // This would require a client-side MD5 hashing utility.
         * if ( kwArgs.content && kwArgs.content.hashMD5 )
         * {
         *     content_MD5 = kwArgs.content.hashMD5();
         *     hdrs['Content-MD5'] = content_MD5;
         * }
         */

        // Handle the x-amz-acl header for access control and prepare for signing.
        var acl_header_to_sign = '';
        if ( kwArgs.acl )
        {
            hdrs['x-amz-acl'] = kwArgs.acl;
            acl_header_to_sign = "x-amz-acl:" + kwArgs.acl + "\n";
        }

        // Set the x-amz-date header and prepare for signing.
        hdrs['x-amz-date'] = http_date;
        var date_header_to_sign = "x-amz-date:" + http_date + "\n";

        // Process custom metadata headers (x-amz-meta-*) and prepare for signing.
        var meta_to_sign = '';
        if ( kwArgs.meta )
        {
            for ( var k in kwArgs.meta )
            {
                // Add the custom metadata header.
                hdrs['x-amz-meta-' + k] = kwArgs.meta[k];
                // Append to the string to be signed.
                meta_to_sign += "x-amz-meta-" + k + ":" + kwArgs.meta[k] + "\n";
            }
        }

        // Perform authentication if not an anonymous request and credentials are set.
        if ( kwArgs['anonymous'] != true && this.KEY_ID && this.SECRET_KEY )
        {
            // Build the canonical string-to-sign according to AWS S3 authentication rules.
            var s;
            s = kwArgs.method + "\n";           // HTTP-Verb
            s += "\n";                          // Content-MD5 (empty for now)
            s += kwArgs.content_type + "\n";    // Content-Type
            s += "\n";                          // Date (empty, as x-amz-date is used)
            s += acl_header_to_sign;            // CanonicalizedAmzHeaders (ACL)
            s += date_header_to_sign;           // CanonicalizedAmzHeaders (Date)
            s += meta_to_sign;                  // CanonicalizedAmzHeaders (Metadata)
            s += kwArgs.resource;               // CanonicalizedResource

            // Sign the constructed string using HMAC-SHA1 with the secret key.
            var signature = this.hmacSHA1( s, this.SECRET_KEY );
            // Set the Authorization header.
            hdrs['Authorization'] = "AWS " + this.KEY_ID + ":" + signature;
        }

        // Initialize and send the XMLHttpRequest.
        var req = getXMLHttpRequest();
        req.open( kwArgs.method, url, true ); // Asynchronous request.

        // Set all prepared HTTP headers.
        for ( var k in hdrs )
        {
            req.setRequestHeader( k, hdrs[k] );
        }

        // Define the callback for when the request state changes.
        req.onreadystatechange = function ()
        {
            if ( req.readyState == 4 ) // Request is complete.
            {
                var obj = null; // Object to hold parsed XML response.

                // Parse XML response if available and not explicitly disabled.
                if ( req.responseXML && kwArgs.parseXML != false )
                {
                    obj = _this.xmlToObj( req.responseXML, kwArgs.force_lists );
                }

                // If debugging is enabled, store the last request and parsed object for inspection.
                if ( _this.DEBUG )
                {
                    window._lastreq = req;
                    window._lastobj = obj;
                }

                // Dispatch to the appropriate handler (error or load) based on status or parsed error.
                if ( ( req.status >= 400 || ( obj && obj.Error ) ) && kwArgs.error )
                {
                    return kwArgs.error( req, obj ); // Invoke error callback.
                }
                else
                {
                    return kwArgs.load( req, obj ); // Invoke success callback.
                }
            }
        };

        // Send the request with the specified content (if any).
        req.send( kwArgs.content );
        return req; // Return the XMLHttpRequest object itself.
    },

    /**
     * Converts a simple XML DOM structure into a JavaScript object.
     * This function recursively processes child nodes, handling text content
     * and creating objects or arrays based on element names and force_lists.
     *
     * @param {Node} parent             The parent XML DOM node to convert.
     * @param {Array<string>} [force_lists] An array of full paths (e.g., "Root.Child.Item")
     *                                  to elements that should always be treated as arrays,
     *                                  even if only one instance is present.
     * @param {string} [path]           Internal parameter: current path for force_lists matching.
     * @returns {object|string} The resulting JavaScript object or string (for text nodes).
     */
    xmlToObj: function ( parent, force_lists, path )
    {
        var obj = {}; // Object to store child elements.
        var cdata = ''; // Accumulator for character data (text content).
        var is_struct = false; // Flag to indicate if this node has child elements.

        // Iterate through all child nodes of the current parent node.
        for ( var i = 0, node; node = parent.childNodes[i]; i++ )
        {
            if ( 3 == node.nodeType ) // Node.TEXT_NODE
            {
                cdata += node.nodeValue; // Accumulate text content.
            }
            else // It's an Element node.
            {
                is_struct = true; // Mark as a structured node (has child elements).
                var name = node.nodeName; // Get the tag name of the child element.
                // Construct the full path for this node, used for force_lists.
                var cpath = ( path ) ? path + '.' + name : name;

                // Recursively call xmlToObj for the child node.
                var val = arguments.callee( node, force_lists, cpath );

                // Handle adding the value to the object.
                if ( !obj[name] )
                {
                    var do_force_list = false;
                    if ( force_lists )
                    {
                        // Check if this path is in the force_lists array.
                        for ( var j = 0, item; item = force_lists[j]; j++ )
                        {
                            if ( item == cpath )
                            {
                                do_force_list = true;
                                break;
                            }
                        }
                    }
                    // If forced to be a list, or if it's the first instance, assign.
                    obj[name] = ( do_force_list ) ? [ val ] : val;
                }
                else if ( obj[name].length )
                {
                    // If 'obj[name]' is already an array (or has a 'length' property),
                    // append the new value to it.
                    obj[name].push( val );
                }
                else
                {
                    // If 'obj[name]' exists but is not an array, it means we've found a second
                    // instance of this element. Convert the existing single value to an array
                    // and then add the new value.
                    obj[name] = [ obj[name], val ];
                }
            }
        }

        // If any sub-nodes were processed, return the structured object.
        // Otherwise, return the accumulated character data (text content).
        return ( is_struct ) ? obj : cdata;
    },

    /**
     * Calculates an HMAC-SHA1 signature for the given data and secret key.
     * This method relies on an external `b64_hmac_sha1` function.
     *
     * @param {string} data     The data string to be signed.
     * @param {string} secret   The secret key for signing.
     * @returns {string} The base64-encoded HMAC-SHA1 signature, appended with an equals sign.
     */
    hmacSHA1: function ( data, secret )
    {
        // Currently uses an external library's b64_hmac_sha1 function.
        // A future enhancement could involve integrating a native or alternative implementation.
        return b64_hmac_sha1( secret, data ) + '=';
    },

    /**
     * Formats a Date object into a string suitable for HTTP Date headers (RFC 1123).
     *
     * @param {Date} [d]    The Date object to format. If not provided, the current date/time is used.
     * @returns {string} The formatted date string (e.g., "Thu, 01 Jan 1970 00:00:00 +0000").
     */
    httpDate: function ( d )
    {
        // If no date object is supplied, default to the current date and time.
        if ( !d )
        {
            d = new Date();
        }

        // Arrays for short day and month names.
        var daysShort = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
        var monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

        /**
         * Correctly determines the full year from a Date object, handling 2-digit year quirks.
         * @param {Date} theDate The date object.
         * @returns {number} The full 4-digit year.
         * @private
         */
        function takeYear ( theDate )
        {
            var x = theDate.getYear(); // Returns year minus 1900 for dates before 2000.
            var y = x % 100;           // Get the last two digits of the year.
            y += ( y < 38 ) ? 2000 : 1900; // Adjust for century (assuming 19xx or 20xx).
            return y;
        }

        /**
         * Pads a number with leading zeros to achieve a specified size.
         * @param {number} num  The number to pad.
         * @param {number} sz   The desired total length of the string.
         * @returns {string} The zero-padded string representation of the number.
         * @private
         */
        function zeropad ( num, sz )
        {
            var s_num = "" + num;
            return ( ( sz - s_num.length ) > 0 ) ? zeropad( "0" + num, sz ) : num;
        }

        /**
         * Calculates and formats the GMT offset for a given Date object.
         * @param {Date} d The date object.
         * @returns {string} The GMT offset string (e.g., "+0000" or "-0500").
         * @private
         */
        function gmtTZ ( d )
        {
            // Get the timezone offset in minutes and convert to absolute value.
            var os = Math.abs( d.getTimezoneOffset() );
            // Calculate hours and minutes.
            var h = "" + Math.floor( os / 60 );
            var m = "" + ( os % 60 );

            // Pad with leading zeros if necessary.
            h = ( h.length == 1 ) ? "0" + h : h;
            m = ( m.length == 1 ) ? "0" + m : m;

            // Determine the sign of the offset.
            return d.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
        }

        var s; // String builder for the date.
        s = daysShort[d.getDay()] + ", ";
        s += d.getDate() + " ";
        s += monthsShort[d.getMonth()] + " ";
        s += takeYear( d ) + " ";
        s += zeropad( d.getHours(), 2 ) + ":";
        s += zeropad( d.getMinutes(), 2 ) + ":";
        s += zeropad( d.getSeconds(), 2 ) + " ";
        s += gmtTZ( d );

        return s;
    },

    // This property serves as a safeguard against potential issues with trailing commas
    // in older JavaScript engines, ensuring the object literal is well-formed.
    EOF: null // End Of File marker (or End Of Object).

}; // End of S3Ajax object definition.


// Ensure the 'queryString' utility function is available globally.
if ( !window['queryString'] )
{
    /**
     * Converts a JavaScript object into a URL-encoded query string.
     * This function is adapted from the MochiKit library.
     *
     * @param {object} params   An object where keys are parameter names and values are parameter values.
     * @returns {string} The URL-encoded query string (e.g., "key1=value1&key2=value2").
     */
    function queryString ( params )
    {
        var l = []; // Array to hold individual key-value pairs.
        // Iterate over the properties of the params object.
        for ( k in params )
        {
            // Encode each value and push the "key=value" string to the array.
            l.push( k + '=' + encodeURIComponent( params[k] ) );
        }
        // Join all parts with an ampersand.
        return l.join( "&" );
    }
}


// Ensure a cross-browser XMLHttpRequest factory function is available.
if ( !window['getXMLHttpRequest'] )
{
    /**
     * Factory function to create a new XMLHttpRequest object,
     * handling browser-specific implementations (e.g., ActiveX for older IE).
     * This implementation is derived from MochiKit/Async.js.
     *
     * @returns {XMLHttpRequest|ActiveXObject|null} A new XMLHttpRequest instance,
     *                                              or an ActiveXObject for IE, or null if unsupported.
     */
    function getXMLHttpRequest ()
    {
        var self = arguments.callee; // Reference to the current function itself.

        // If XMLHttpRequest factory hasn't been determined yet.
        if ( !self.XMLHttpRequest )
        {
            // List of potential XMLHttpRequest constructors, ordered by preference.
            var tryThese = [
                function () { return new XMLHttpRequest(); }, // Standard modern browser.
                function () { return new ActiveXObject( 'Msxml2.XMLHTTP' ); }, // Older IE.
                function () { return new ActiveXObject( 'Microsoft.XMLHTTP' ); }, // Even older IE.
                function () { return new ActiveXObject( 'Msxml2.XMLHTTP.4.0' ); }, // Specific IE version.
                function () { return null; } // Fallback if none are supported.
            ];

            // Iterate through the list to find the first working constructor.
            for ( var i = 0; i < tryThese.length; i++ )
            {
                var func = tryThese[i];
                try
                {
                    self.XMLHttpRequest = func; // Cache the successful constructor.
                    return func(); // Return a new instance from the working constructor.
                }
                catch ( e )
                {
                    // Ignore errors for non-supported constructors and try the next one.
                }
            }
        }
        // Once found and cached, directly use the stored factory function.
        return self.XMLHttpRequest();
    }
}