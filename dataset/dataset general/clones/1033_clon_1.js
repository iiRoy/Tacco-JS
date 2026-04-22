/**
 * fluidinfo.js - a small and simple client for Fluidinfo written in Javascript.
 *
 * This file is a Type I clone, meaning its functionality is identical,
 * but whitespace and comments have been extensively altered for visual distinction.
 *
 * @author <a href="http://twitter.com/onigiri">onigiri</a>,
 *         <a href="http://twitter.com/ntoll">ntoll</a>,
 *         <a href="http://twitter.com/barshirtcliff">barshirtcliff</a> and
 *         <a href="http://twitter.com/jkakar">jkakar</a>
 * @version 0.1
 * @constructor
 * @param options {Object} This object contains various configuration parameters
 *                         for establishing a new session with the Fluidinfo service.
 * <dl>
 *   <dt>username</dt>
 *   <dd>The username required for authenticating with the Fluidinfo API.</dd>
 *   <dt>password</dt>
 *   <dd>The password corresponding to the provided username for authentication.</dd>
 *   <dt>instance</dt>
 *   <dd>Specifies the Fluidinfo instance to connect to. Valid values include
 *       "main", "sandbox", or a custom bespoke instance URL.
 *       The default value, if not specified, is "main".</dd>
 * </dl>
 * @returns {Object} An object that provides the public interface for
 *                   interacting with Fluidinfo's functionalities.
 */
var fluidinfo = function ( options ) {

    /**
     * Recursively creates a deep clone of the provided object.
     *
     * Note: There's a theoretical, albeit low, possibility of an infinite loop
     *       if the object contains circular references.
     * TODO: This cloning mechanism could potentially be replaced with a more
     *       robust utility or a standardized library function.
     * @param {Object} obj The object to be cloned.
     * @returns {Object} A new object that is a deep copy of the original.
     */
    var clone = function ( obj ) {
        // If the value is a primitive or null, return it directly as it cannot be cloned.
        if ( obj === null || typeof ( obj ) !== 'object' ) {
            return obj;
        }

        // Create a new object using the constructor of the original object to maintain type.
        var temp = obj.constructor();

        // Iterate over all enumerable properties of the object.
        for ( var key in obj ) {
            // If a property's value is an object, recursively clone it.
            if ( typeof ( obj[key] ) === "object" ) {
                temp[key] = clone ( obj[key] );
            }
            // Otherwise, assign the primitive value directly.
            else {
                temp[key] = obj[key];
            }
        }
        return temp;
    };


    /**
     * Prepares a string value to be safely embedded within an 'about' query
     * parameter in Fluidinfo, specifically for "fluiddb/about="..." type queries.
     * This involves escaping backslashes and double quotes.
     * @param {string} s The string to be quoted.
     * @returns {string} The escaped string, suitable for Fluidinfo 'about' queries.
     */
    var quoteAbout = function ( s ) {
        return s.replace ( /\\/g, '\\\\' ) .replace ( /\"/g, '\\"' ) ;
    };


    /**
     * Provides functionality to encode strings into Base64 format.
     * This implementation is derived from the example found at:
     * http://www.webtoolkit.info/javascript-base64.html
     */
    var Base64 = {
        // Private property: the Base64 character set mapping.
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // Public method for Base64 encoding.
        /**
         * Encodes a given string into Base64 format.
         * @param {string} input The string to encode.
         * @returns {string} The Base64 encoded string.
         */
        encode : function ( input ) {
            var output = "";
            var chr1, chr2, chr3; // Three 8-bit ASCII characters.
            var enc1, enc2, enc3, enc4; // Four 6-bit Base64 characters.
            var i = 0;

            // First, ensure the input string is UTF-8 encoded.
            input = Base64._utf8_encode ( input );

            // Process the input string in chunks of 3 characters.
            while ( i < input.length ) {
                chr1 = input.charCodeAt ( i++ );
                chr2 = input.charCodeAt ( i++ );
                chr3 = input.charCodeAt ( i++ );

                enc1 = chr1 >> 2;
                enc2 = ( ( chr1 & 3 ) << 4 ) | ( chr2 >> 4 );
                enc3 = ( ( chr2 & 15 ) << 2 ) | ( chr3 >> 6 );
                enc4 = chr3 & 63;

                // Handle padding for strings whose length is not a multiple of 3.
                if ( isNaN ( chr2 ) ) {
                    enc3 = enc4 = 64; // '=' padding.
                } else if ( isNaN ( chr3 ) ) {
                    enc4 = 64; // '=' padding.
                }

                // Append the Base64 characters to the output string.
                output = output +
                         this._keyStr.charAt ( enc1 ) + this._keyStr.charAt ( enc2 ) +
                         this._keyStr.charAt ( enc3 ) + this._keyStr.charAt ( enc4 );
            }
            return output;
        },

        // Private method for UTF-8 encoding.
        /**
         * Converts a JavaScript string to its UTF-8 encoded representation.
         * @param {string} string The string to convert.
         * @returns {string} The UTF-8 encoded string.
         */
        _utf8_encode : function ( string ) {
            string = string.replace ( /\r\n/g, "\n" ); // Normalize newlines.
            var utftext = "";

            for ( var n = 0; n < string.length; n++ ) {
                var c = string.charCodeAt ( n );

                if ( c < 128 ) {
                    utftext += String.fromCharCode ( c );
                }
                else if ( ( c > 127 ) && ( c < 2048 ) ) {
                    utftext += String.fromCharCode ( ( c >> 6 ) | 192 );
                    utftext += String.fromCharCode ( ( c & 63 ) | 128 );
                }
                else {
                    utftext += String.fromCharCode ( ( c >> 12 ) | 224 );
                    utftext += String.fromCharCode ( ( ( c >> 6 ) & 63 ) | 128 );
                    utftext += String.fromCharCode ( ( c & 63 ) | 128 );
                }
            }
            return utftext;
        }
    };


    /**
     * The `session` object holds state information pertinent to the current
     * interaction with the Fluidinfo service, such as the base URL.
     */
    var session = {};

    // Stores the Base64 encoded 'username:password' string for HTTP Basic Authentication.
    var authorizationBase64Fragment = '';

    // Stores the OAuth2 access token if provided for authentication.
    var OAuthAccessToken = '';

    // Process provided options to configure the session.
    if ( options ) {
        // Configure the base URL based on the 'instance' option.
        if ( options.instance ) {
            switch ( options.instance.toLowerCase() ) {
                case "main":
                    session.baseURL = "https://fluiddb.fluidinfo.com/";
                    break;
                case "sandbox":
                    session.baseURL = "https://sandbox.fluidinfo.com/";
                    break;
                default:
                    // For bespoke instances, validate the URL format.
                    var urlRegex = /^(http|https):\/\/.+\/$/;
                    if ( urlRegex.exec ( options.instance ) ) {
                        session.baseURL = options.instance;
                    } else {
                        // Throw an error if the bespoke instance URL is invalid.
                        throw {
                            name: "ValueError",
                            message: "The URL must start with http[s]:// and have a trailing slash ('/') to be valid. E.g. https://localhost/"
                        };
                    }
            }
        }

        // If an OAuth access token is provided, store it.
        if ( options.access_token !== undefined ) {
            OAuthAccessToken = options.access_token;
        }

        // If both username and password are provided, set up basic authentication.
        if ( ( options.username !== undefined ) && ( options.password !== undefined ) ) {
            authorizationBase64Fragment = Base64.encode (
                options.username + ":" + options.password
            );
            // Additionally, store the username in the session for easy access.
            session.username = options.username;
        }
    }

    // Ensure `session.baseURL` always has a default value (main instance)
    // if no specific instance was provided or successfully configured.
    if ( session.baseURL === undefined ) {
        session.baseURL = "https://fluiddb.fluidinfo.com/";
    }


    /**
     * A robust method to determine if a given value is an array.
     * This technique is recommended by Doug Crockford in "Javascript: The Good Parts" (page 61).
     * It avoids issues with `instanceof` across different JavaScript contexts (e.g., iframes).
     *
     * @param value A variable whose type needs to be checked.
     * @return {boolean} Returns `true` if the value is an array, `false` otherwise.
     */
    function isArray ( value ) {
        return Object.prototype.toString.apply ( value ) === "[object Array]";
    }


    /**
     * Converts an array of path elements into a correctly encoded URL path string.
     * For example, `["a", "b", "c"]` will be transformed into `"/a/b/c"`.
     * Each element is URL-encoded to handle special characters safely.
     *
     * @param {Array<string>} path An array where each element is a segment of the URL path.
     * @return {string} The properly encoded and concatenated URL path,
     *                  without a leading slash, suitable for appending to a base URL.
     */
    function encodeURL ( path ) {
        var i,
            result = ""; // Initialize an empty string to build the URL.

        for ( i = 0; i < path.length; i++ ) {
            result += "/" + encodeURIComponent ( path[i] );
        }
        // Remove the initial '/' added by the first iteration to make it a relative path.
        return result.slice ( 1 );
    }


    /**
     * Determines whether a given JavaScript value corresponds to a Fluidinfo "primitive" type.
     * Fluidinfo primitives include numbers, strings, booleans, null, and arrays of strings (representing sets).
     * For more details, refer to the official Fluidinfo documentation on tag values:
     * <a href="http://doc.fluidinfo.com/fluidDB/api/tag-values.html">Fluidinfo Docs</a>
     * and <a href="http://bit.ly/hmrMzT">more information</a>.
     *
     * @param value The value to check against Fluidinfo's primitive types.
     * @return {boolean} `true` if the value is a Fluidinfo primitive, `false` otherwise.
     */
    function isPrimitive ( value ) {
        // First, check for direct matches with basic JavaScript primitive types.
        var valueType = typeof ( value );
        var primitiveTypes = [ "number", "string", "boolean" ];
        var i;
        for ( i = 0; i < primitiveTypes.length; i++ ) {
            if ( valueType === primitiveTypes[i] ) {
                return true;
            }
        }

        // 'null' is also considered a primitive type in Fluidinfo.
        if ( value === null ) {
            return true;
        }

        // Check for arrays, which are primitive if all their members are strings (representing a Fluidinfo set).
        // Fluidinfo currently does not support arrays with mixed types or non-string members as primitives.
        if ( isArray ( value ) ) {
            for ( i = 0; i < value.length; i++ ) {
                var memberType = typeof ( value[i] );
                if ( memberType !== "string" ) {
                    return false; // If any member is not a string, it's not a primitive set.
                }
            }
            return true; // All members are strings, so it's a primitive set.
        }

        // If none of the above conditions are met, the value is not a Fluidinfo primitive.
        return false;
    }


    /**
     * Analyzes the request options to determine the most appropriate `Content-Type`
     * MIME header value to send with the HTTP request.
     *
     * @param options {Object} An object containing various parameters that describe the request,
     *                         such as `type`, `path`, `data`, and `contentType`.
     * @returns {string|null} The determined MIME type string, or `null` if no `Content-Type`
     *                        header is required (e.g., for GET requests without a body).
     * @throws {ValueError} If a `PUT` request to a tag-value endpoint has data but no
     *                      explicit `contentType` and the data is not a Fluidinfo primitive.
     */
    function detectContentType ( options ) {
        var result = null;

        // Special handling for PUT requests targeting tag-value endpoints (`objects/` or `about/`).
        // For these, the content type is crucial for Fluidinfo to interpret the tag value correctly.
        if ( options.type === "PUT" && ( options.path.match ( "^objects\/" ) ||
                                         options.path.match ( "^about\/" ) ) ) {
            if ( options.contentType ) {
                result = options.contentType; // Use explicitly provided content type.
            } else if ( isPrimitive ( options.data ) ) {
                // If data is a Fluidinfo primitive and no content type is given, default to Fluidinfo's JSON value type.
                result = "application/vnd.fluiddb.value+json";
            } else {
                // If it's not primitive and no content type is specified, it's an error.
                throw {
                    name: "ValueError",
                    message: "Must supply Content-Type"
                };
            }
        }
        // For any other request type that includes a data payload, assume JSON.
        else if ( options.data ) {
            result = "application/json";
        }
        return result;
    }


    /**
     * Checks if a given `Content-Type` header value indicates that the associated
     * content is in JSON format, including Fluidinfo's specific JSON value type.
     *
     * @param {string} contentType The MIME type string from a `Content-Type` header.
     * @returns {boolean} `true` if the content type is `application/json` or
     *                    `application/vnd.fluiddb.value+json`, `false` otherwise.
     */
    function isJSONData ( contentType ) {
        return contentType && (
            contentType === "application/json" ||
            contentType === "application/vnd.fluiddb.value+json"
        );
    }


    /**
     * Converts an object of key-value pairs into a URL-encoded query string.
     * This function properly handles array values by repeating the parameter key
     * for each element, following standard URL query string conventions.
     *
     * @param {Object} args An object where keys represent query parameter names
     *                      and values represent their corresponding data.
     * @returns {string} The URL-encoded query string (e.g., `"?key1=value1&key2=value2"`),
     *                   or an empty string if no arguments are provided.
     */
    function createArgs ( args ) {
        var result = "";

        if ( args ) {
            var arg;
            for ( arg in args ) {
                // Skip properties that are functions.
                if ( typeof args[arg] !== "function" ) {
                    // If the argument value is an array, iterate and append each element.
                    if ( isArray ( args[arg] ) ) {
                        var j;
                        for ( j = 0; j < args[arg].length; j++ ) {
                            result += "&" + encodeURIComponent ( arg ) + "=" +
                                      encodeURIComponent ( args[arg][j] );
                        }
                    }
                    // For single values, append directly.
                    else {
                        result += "&" + encodeURIComponent ( arg ) + "=" +
                                  encodeURIComponent ( args[arg] );
                    }
                }
            }
            // Prepend '?' and remove the leading '&' from the concatenated string.
            result = "?" + result.slice ( 1 );
        }
        return result;
    }


    /**
     * Extracts and parses HTTP response headers from an XMLHttpRequest object
     * into a more accessible JavaScript object format. Header names are converted
     * to lowercase for consistent access.
     *
     * @param xhr {XMLHttpRequest} The XMLHttpRequest instance from which to retrieve headers.
     * @returns {Object} An object where keys are lowercase header names and values are
     *                   the corresponding header strings.
     */
    function getHeaders ( xhr ) {
        var result = {};
        var rawHeaders = xhr.getAllResponseHeaders();

        // Process the raw header string if available.
        // Note: Some browsers (e.g., older Mozilla) might not fully support getAllResponseHeaders,
        // or might return headers separated by '\n' instead of '\r\n'.
        if ( rawHeaders ) {
            var i;
            var splitHeaders = rawHeaders.split ( "\n" ); // Split by newline character.
            for ( i = 0; i < splitHeaders.length; i++ ) {
                var rawHeader = splitHeaders[i];
                if ( rawHeader.length > 0 ) {
                    var splitHeader = rawHeader.split ( ": " ); // Split into name and value.
                    var value = splitHeader[1].trim(); // Trim whitespace from the value.
                    result[ splitHeader[0].toLowerCase() ] = value; // Store with lowercase name.
                }
            }
        }
        else {
            // Fallback for environments where getAllResponseHeaders is problematic.
            // Attempt to get the 'content-type' header specifically if it's not available.
            var contentType = xhr.getResponseHeader ( "content-type" );
            if ( contentType ) {
                result[ "content-type" ] = contentType;
            }
        }
        return result;
    }


    /**
     * Creates and returns an appropriate XMLHttpRequest object,
     * abstracting away browser-specific differences (e.g., ActiveX for older IE).
     * This utility function is based on patterns found in:
     * http://www.quirksmode.org/js/xmlhttp.html
     *
     * @returns {XMLHttpRequest|ActiveXObject|boolean} A new XMLHttpRequest object,
     *                                                 or `false` if no compatible object can be created.
     */
    function createXMLHTTPObject () {
        // A list of factory functions, ordered by preference/compatibility.
        var XMLHttpFactories = [
            function () { return new XMLHttpRequest(); },
            function () { return new ActiveXObject ( "Msxml2.XMLHTTP" ); },
            function () { return new ActiveXObject ( "Msxml3.XMLHTTP" ); },
            function () { return new ActiveXObject ( "Microsoft.XMLHTTP" ); }
        ];
        var xhr = false; // Initialize xhr to false.

        // Iterate through the factory functions, attempting to create an XHR object.
        for ( var i = 0; i < XMLHttpFactories.length; i++ ) {
            try {
                xhr = XMLHttpFactories[i](); // Try to instantiate.
            } catch ( e ) {
                continue; // If an error occurs (e.g., object not supported), try the next.
            }
            break; // Successfully created an XHR object, exit loop.
        }
        return xhr;
    }


    /**
     * Constructs a simplified and user-friendly result object from a raw
     * XMLHttpRequest instance. This object encapsulates key response details
     * and attempts to parse JSON data if indicated by the Content-Type header.
     *
     * @param xhr {XMLHttpRequest} The XMLHttpRequest instance whose response
     *                             is to be processed.
     * @returns {Object} A structured object containing:
     *                   `status`, `statusText`, `headers` (parsed), `rawData`,
     *                   `data` (parsed JSON or raw text), and the original `request` (xhr object).
     */
    function createNiceResult ( xhr ) {
        var result = {}; // Initialize the result object.

        // Populate basic response properties.
        result.status = xhr.status;
        result.statusText = xhr.statusText;
        result.headers = getHeaders ( xhr ); // Parse and get headers.
        result.rawData = xhr.responseText;

        // Attempt to parse `responseText` as JSON if the Content-Type header indicates JSON.
        if ( isJSONData ( result.headers['content-type'] ) ) {
            result.data = JSON.parse ( xhr.responseText );
        } else {
            // Otherwise, store the raw response text as data.
            result.data = xhr.responseText;
        }

        result.request = xhr; // Provide access to the original XHR object.
        return result;
    }


    /**
     * Dispatches an XMLHttpRequest-based HTTP request to the Fluidinfo API.
     * This function centralizes the logic for request setup, authentication,
     * content handling, and asynchronous/synchronous execution with callbacks.
     *
     * @param options {Object} An object defining the request parameters:
     * <dl>
     *  <dt>type</dt>
     *  <dd>The HTTP method (e.g., "GET", "POST", "PUT", "DELETE", "HEAD").</dd>
     *  <dt>path</dt>
     *  <dd>The API endpoint path (e.g., "objects", "tags/user/tagname"). Can be an array.</dd>
     *  <dt>args</dt>
     *  <dd>An object of query string parameters to append to the URL.</dd>
     *  <dt>data</dt>
     *  <dd>The payload for requests like POST or PUT.</dd>
     *  <dt>async</dt>
     *  <dd>Boolean indicating if the request should be asynchronous (defaults to `true`).</dd>
     *  <dt>onSuccess</dt>
     *  <dd>A callback function `function(result)` to execute upon a successful response (HTTP status < 300).</dd>
     *  <dt>onError</dt>
     *  <dd>A callback function `function(result)` to execute upon an error response (HTTP status >= 300).</dd>
     *  <dt>contentType</dt>
     *  <dd>Optional. Explicitly sets the `Content-Type` header for the request body.</dd>
     * </dl>
     * @returns {Object|undefined} For synchronous requests, returns the `createNiceResult` object.
     *                             For asynchronous requests, returns `undefined` as results are handled via callbacks.
     */
    function sendRequest ( options ) {
        // If the path is provided as an array, encode it into a URL string.
        if ( isArray ( options.path ) ) {
            options.path = encodeURL ( options.path );
        }

        // Determine the HTTP method, defaulting to "GET" if not specified.
        var method = options.type.toUpperCase() || "GET";

        // Construct the URL query string from the `args` object.
        var args = createArgs ( options.args );

        // Assemble the complete request URL.
        var url = session.baseURL + options.path + args;

        // Determine if the request should be asynchronous; defaults to `true`.
        var async = true;
        if ( options.async !== undefined ) {
            async = options.async;
        }

        // Create an XMLHttpRequest object compatible with the current browser.
        var xhr = createXMLHTTPObject();
        if ( !xhr ) {
            return undefined; // If XHR object cannot be created, return undefined.
        }

        // Open the HTTP connection with the specified method, URL, and async setting.
        xhr.open ( method, url, async );

        // Set authentication headers based on whether OAuth2 or Basic Auth is used.
        if ( OAuthAccessToken === '' ) {
            // Basic Authentication: if `authorizationBase64Fragment` is present.
            if ( authorizationBase64Fragment !== '' ) {
                xhr.setRequestHeader ( 'Authorization',
                                       'basic ' + authorizationBase64Fragment );
            }
        }
        else {
            // OAuth2 Authentication: set the access token.
            xhr.setRequestHeader ( 'X-FluidDB-Access-Token', OAuthAccessToken );
            // Determine if an anonymous or specific consumer is used for OAuth.
            if ( authorizationBase64Fragment === '' ) {
                xhr.setRequestHeader ( 'Authorization', 'oauth2' ); // Anonymous consumer.
            }
            else {
                xhr.setRequestHeader ( 'Authorization',
                                       'oauth2 ' + authorizationBase64Fragment ); // Specific consumer.
            }
        }

        // Detect and set the `Content-Type` header if a request body (`data`) is present.
        var contentType = detectContentType ( options );
        if ( contentType ) {
            xhr.setRequestHeader ( "content-type", contentType );
            // If the content type is JSON, stringify the data payload.
            if ( isJSONData ( contentType ) ) {
                options.data = JSON.stringify ( options.data );
            }
        }

        try {
            // Define the common result handling logic.
            var handleResult = function () {
                var result = createNiceResult ( xhr ); // Create a friendly result object.

                if ( xhr.status < 300 ) {
                    // Call the `onSuccess` callback for successful HTTP status codes.
                    if ( options.onSuccess ) {
                        options.onSuccess ( result );
                    }
                } else if ( options.onError ) {
                    // Call the `onError` callback for error HTTP status codes.
                    options.onError ( result );
                }
            };

            // Check for Android browsers due to known bugs with `onprogress` event handling.
            var isAndroid = navigator.userAgent.toLowerCase().indexOf ( "android" ) >= 0;

            if ( 'onprogress' in xhr && !isAndroid ) {
                // Modern event handling for most browsers (excluding Android due to issues).
                // WARNING: This specific branch might not be fully covered by FakeXHRHttpRequest
                //          in test environments, requiring careful manual verification.
                if ( options.onError ) {
                    xhr.onerror = function () {
                        // Handle network-level errors or request failures.
                        var result = createNiceResult ( xhr );
                        options.onError ( result );
                    };
                }
                xhr.onload = function () {
                    // `onload` fires when the transaction completes successfully.
                    handleResult();
                };
            } else {
                // Fallback for older browsers or Android, using the `onreadystatechange` event.
                xhr.onreadystatechange = function () {
                    // Only process when the request is fully complete (readyState 4).
                    if ( xhr.readyState !== 4 ) return;
                    handleResult();
                };
            }
        } catch ( e ) {
            // Catch block for browser-specific issues, typically related to cross-origin
            // requests in older browsers like IE6/7, which are not supported.
            return undefined;
        }

        // Send the HTTP request with the prepared data payload.
        xhr.send ( options.data );

        // For synchronous requests, return the result directly.
        if ( !async ) {
            var result = createNiceResult ( xhr );
            return result;
        }
        // For asynchronous requests, the result is handled by callbacks, so return undefined.
        return undefined;
    }


    /**
     * The `api` object serves as the public interface for making calls to
     * the Fluidinfo REST API. It exposes convenience methods for common HTTP verbs.
     */
    var api = {};


    /**
     * Executes an HTTP GET request to the Fluidinfo API.
     * This is a wrapper around `sendRequest` that configures the request type.
     *
     * @param opts {Object} An options object, which will be cloned to prevent
     *                      unintended side effects. It should include `path`,
     *                      `args`, `onSuccess`, `onError`, etc.
     * @returns {Object|undefined} The result object for synchronous requests,
     *                             or `undefined` for asynchronous requests.
     */
    api.get = function ( opts ) {
        var options = clone ( opts ); // Create a deep clone of the options object.
        options.type = "GET";         // Explicitly set the HTTP method to GET.
        options.data = null;          // GET requests typically do not carry a body.
        return sendRequest ( options );
    };


    /**
     * Executes an HTTP POST request to the Fluidinfo API.
     * This method acts as a convenience wrapper for the `sendRequest` function.
     *
     * @param opts {Object} An options object, which is cloned to ensure immutability.
     *                      It should specify `path`, `data` (the request body),
     *                      `onSuccess`, `onError`, and other relevant parameters.
     * @returns {Object|undefined} Returns the result object for synchronous requests,
     *                             or `undefined` for asynchronous requests.
     */