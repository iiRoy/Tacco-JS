/**
 * dataAccess.js - a concise and straightforward client for a data service, implemented in JavaScript.
 *
 * @author <a href="http://social.example.com/alpha">alpha</a>, <a href="http://social.example.com/beta">beta</a>, <a href="http://social.example.com/gamma">gamma</a> and <a href="http://social.example.com/delta">delta</a>
 * @version 0.2
 * @constructor
 * @param configuration {Object} Holds various settings for a new connection to the data service.
 * <dl>
 *   <dt>userIdentifier</dt>
 *   <dd>The identifier for the user to employ during authentication with the data service.</dd>
 *   <dt>userSecret</dt>
 *   <dd>The secret password for authenticating the user.</dd>
 *   <dt>endpointSpec</dt>
 *   <dd>The specific server instance to establish a connection with. Can be "production", "staging" or a custom
 *  address. Defaults to "production".</dd>
 * </dl>
 * returns {Object} An object providing methods to interact with the data service.
 */
var dataAccess = function(configuration) {
    /**
     * Produces a deep copy of the provided object.
     *
     * There's a slight chance this routine could enter an endless loop. CONSIDER: Rework this part.
     */
    var deepCopy = function(originalObj) {
        if (originalObj === null || typeof(originalObj) !== 'object') {
            return originalObj;
        }

        var duplicatedObj = originalObj.constructor();
        for (var propertyKey in originalObj) {
            if (typeof(originalObj[propertyKey]) === "object") {
                duplicatedObj[propertyKey] = deepCopy(originalObj[propertyKey]);
            } else {
                duplicatedObj[propertyKey] = originalObj[propertyKey];
            }
        }
        return duplicatedObj;
    };

    /**
    Escape a 'subject' value for inclusion in a 'resource/subject="..."'
    style query string.
    */
    var escapeSubject = function(textInput) {
        return textInput.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');
    };

    /**
     * Transforms text strings into their base64 representation. Adapted from:
     * http://www.utilitytools.info/javascript-base64.html
     */
    var TextEncoder = {
        // internal character mapping
        _charSet : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for converting
        encodeText : function (plainInput) {
            var codedOutput = "";
            var byte1, byte2, byte3, val1, val2, val3, val4;
            var counter = 0;

            plainInput = TextEncoder._toUtf8(plainInput);

            while (counter < plainInput.length) {
                byte1 = plainInput.charCodeAt(counter++);
                byte2 = plainInput.charCodeAt(counter++);
                byte3 = plainInput.charCodeAt(counter++);

                val1 = byte1 >> 2;
                val2 = ((byte1 & 3) << 4) | (byte2 >> 4);
                val3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                val4 = byte3 & 63;

                if (isNaN(byte2)) {
                    val3 = val4 = 64;
                } else if (isNaN(byte3)) {
                    val4 = 64;
                }

                codedOutput = codedOutput +
                this._charSet.charAt(val1) + this._charSet.charAt(val2) +
                this._charSet.charAt(val3) + this._charSet.charAt(val4);
            }
            return codedOutput;
        },

        // internal method for UTF-8 conversion
        _toUtf8 : function (sourceString) {
            sourceString = sourceString.replace(/\r\n/g,"\n");
            var utf8string = "";
            for (var charIndex = 0; charIndex < sourceString.length; charIndex++) {
                var charCode = sourceString.charCodeAt(charIndex);
                if (charCode < 128) {
                    utf8string += String.fromCharCode(charCode);
                }
                else if ((charCode > 127) && (charCode < 2048)) {
                    utf8string += String.fromCharCode((charCode >> 6) | 192);
                    utf8string += String.fromCharCode((charCode & 63) | 128);
                }
                else {
                    utf8string += String.fromCharCode((charCode >> 12) | 224);
                    utf8string += String.fromCharCode(((charCode >> 6) & 63) | 128);
                    utf8string += String.fromCharCode((charCode & 63) | 128);
                }
            }
            return utf8string;
        }
    };

    /**
     * Represents a connection context with the data service.
     */
    var currentContext = {};
    var authCredsB64 = '';
    var oAuthKey = '';

    if (configuration) {
        if (configuration.endpointSpec) {
            switch(configuration.endpointSpec.toLowerCase()) {
            case "production":
                currentContext.baseURI = "https://data.example.com/api/";
                break;
            case "staging":
                currentContext.baseURI = "https://staging.example.com/api/";
                break;
            default:
                // validate the custom endpoint
                var uriPattern = /^(http|https):\/\/.+\/$/;
                if (uriPattern.exec(configuration.endpointSpec)) {
                    currentContext.baseURI = configuration.endpointSpec;
                } else {
                    throw {
                        name: "InputError",
                        message: "The URL must start with http[s]:// and conclude with a trailing slash ('/') to be valid. E.g. https://myhost/"
                    };
                }
            }
        }
        if (configuration.accessKey !== undefined){
            oAuthKey = configuration.accessKey;
        }
        if ((configuration.userIdentifier !== undefined) && (configuration.userSecret !== undefined)) {
            authCredsB64 = TextEncoder.encodeText(
                configuration.userIdentifier + ":" + configuration.userSecret);
            // Ensures the logged-in user's identifier is accessible via the
            // userIdentifier attribute
            currentContext.userIdentifier = configuration.userIdentifier;
        }
    }

    // Fallback to ensure the library defaults to the production instance
    if (currentContext.baseURI === undefined){
        currentContext.baseURI = "https://data.example.com/api/";
    }

    /**
     * Special trickery to determine if a value is an array (potentially a set from the data service).
     * Sourced from page 61 of Doug Crockford's "Javascript: The Good Parts".
     *
     * @param itemToCheck A value that might be an array.
     * @return {boolean} An indicator if the value is an array.
     */
    function isCollection(itemToCheck) {
        return Object.prototype.toString.apply(itemToCheck) === "[object Array]";
    }

    /**
     * Given a path represented as an array of segments, generates the correctly encoded URI string.
     * E.g., ["segmentA", "segmentB", "segmentC"] -> "/segmentA/segmentB/segmentC"
     *
     * @param uriSegments {Array} A list of values to be properly encoded
     * between '/' characters.
     * @return {string} The correctly formatted and encoded URI.
     */
    function pathSegmentEncode(uriSegments) {
        var idx, encodedPath = "";
        for (idx = 0; idx < uriSegments.length; idx++) {
            encodedPath += "/" + encodeURIComponent(uriSegments[idx]);
        }
        return encodedPath.slice(1); // removes the initial slash
    }

    /**
     * Verifies if the provided value is a "fundamental" type recognized by the data service.
     * Refer to <a href="http://docs.example.com/api/value-types.html">
     * the data service documentation</a> for <a href="http://shorturl.at/xyz">additional
     * details</a> on supported types.
     *
     * @param inputVal A value whose "kind" needs verification
     * @return A boolean indicating if the value is a fundamental data service type.
     */
    function isBasicDataType(inputVal) {
        // first, check simple type matches
        var valKind = typeof(inputVal);
        var basicKinds = ["number", "string", "boolean"];
        var j;
        for (j = 0; j < basicKinds.length; j++) {
            if (valKind === basicKinds[j]) {
                return true;
            }
        }
        // A null value is also considered fundamental
        if (inputVal === null) {
            return true;
        }
        // check for an array (possible set) and confirm it only contains
        // strings (currently, mixed-type arrays are not permitted)
        if (isCollection(inputVal)) {
            for (j = 0; j < inputVal.length; j++) {
                var elemKind = typeof(inputVal[j]);
                if (elemKind !== "string") {
                    return false;
                }
            }
            return true;
        }
        // the value did not match any fundamental type checks
        return false;
    }

    /**
     * Given the request details, it will return the most suitable
     * MIME type to assign as the value for the Content-Type header.
     *
     * @param requestDetails {Object} Contains various parameters describing the
     * request.
     * @return the most appropriate MIME type to use or null if not applicable /
     * not required.
     */
    function determineMimeType(requestDetails) {
        // a "WRITE" operation to resources/ or subjects/ endpoints implies handling the MIME
        // of a field-value. If no MIME type is provided in the requestDetails object,
        // then check if the value is a data service fundamental type. Otherwise,
        // raise an error.
        var mimeResult = null;
        if (requestDetails.reqMethod === "PUT" && (requestDetails.reqPath.match("^resources\/") ||
                                       requestDetails.reqPath.match("^subjects\/"))) {
            if (requestDetails.mediaType){
                mimeResult = requestDetails.mediaType;
            } else if (isBasicDataType(requestDetails.payloadContent)) {
                mimeResult = "application/vnd.data.value+json";
            } else {
                throw {name: "InputError",
                       message: "Must provide Content-Type"};
            }
        } else if (requestDetails.payloadContent) {
            // all other API requests that include payloads will
            // be transmitting JSON
            mimeResult = "application/json";
        }
        return mimeResult;
    }

    /**
     * Given a value from a Content-Type header, returns a boolean
     * indicating if the associated content is JSON.
     *
     * @param mediaTypeCheck {string} The MIME value linked with the content
     * @result {boolean} An indication if the associated content is JSON
     */
    function isJsonContent(mediaTypeCheck) {
        return mediaTypeCheck && (
            mediaTypeCheck === "application/json" ||
            mediaTypeCheck === "application/vnd.data.value+json");
    }

    /**
     * Given an object representing parameters to append to a URI,
     * it will return an appropriately encoded string.
     */
    function buildQueryString(queryParameters) {
        var paramString = "";
        if (queryParameters) {
            var paramKey;
            for (paramKey in queryParameters) {
                if (typeof queryParameters[paramKey] !== "function") {
                    if (isCollection(queryParameters[paramKey])) {
                        var k;
                        for (k = 0; k <queryParameters[paramKey].length; k++) {
                            paramString += "&" + encodeURIComponent(paramKey) + "=" +
                                      encodeURIComponent(queryParameters[paramKey][k]);
                        }
                    } else {
                        paramString += "&" + encodeURIComponent(paramKey) + "=" +
                                  encodeURIComponent(queryParameters[paramKey]);
                    }
                }
            }
            paramString = "?" + paramString.slice(1);
        }
        return paramString;
    }

    /**
     * Returns an object representing the headers received from the data service.
     */
    function extractResponseHeaders(xmlHttpReq) {
        var headerMap = {};
        var allRawHeaders = xmlHttpReq.getAllResponseHeaders();
        // Convert the result into an object
        if (allRawHeaders){ // Mozilla has issues with getAllResponseHeaders sometimes
            var idx;
            // Split by newline only, even though a proper HTTP
            // response separates headers with \r\n, because the header
            // content only has newline when parsed in a Firefox extension.
            var headerLines = allRawHeaders.split("\n");
            for (idx = 0; idx < headerLines.length; idx++){
                var currentLine = headerLines[idx];
                if (currentLine.length > 0) {
                    var parts = currentLine.split(": ");
                    var headerValue = parts[1].trim();
                    headerMap[parts[0].toLowerCase()] = headerValue;
                }
            }
        } else {
            // Attempt to retrieve the content type from the header (due to Mozilla
            // quirk).
            var contentTypeHeader = xmlHttpReq.getResponseHeader("content-type");
            if (contentTypeHeader){
                headerMap["content-type"] = contentTypeHeader;
            }
        }
        return headerMap;
    }

    /**
     * Returns an appropriate XMLHTTPRequest Object based on the browser environment.
     * Derived from code found here:
     * http://www.browserhacks.com/js/xmlhttp.html
     */
    function instantiateXhrClient() {
        var xhrConstructors = [
            function () {return new XMLHttpRequest();},
            function () {return new ActiveXObject("Msxml2.XMLHTTP");},
            function () {return new ActiveXObject("Msxml3.XMLHTTP");},
            function () {return new ActiveXObject("Microsoft.XMLHTTP");}
        ];
        var clientInstance = false;
        for (var idx = 0; idx < xhrConstructors.length; idx++) {
            try {
                clientInstance = xhrConstructors[idx]();
            } catch(error) {
                continue;
            }
            break;
        }
        return clientInstance;
    }

    /**
     * Constructs a simplified (user-friendly) result object.
     * @param rawXhrObject {Object} the XmlHttpRequest instance from which to build the
     * result.
     */
    function formatResponseObject(rawXhrObject) {
        // create a straightforward result object
        var formattedResponse = {};
        formattedResponse.statusCode = rawXhrObject.status;
        formattedResponse.statusMessage = rawXhrObject.statusText;
        formattedResponse.responseHeaders = extractResponseHeaders(rawXhrObject);
        formattedResponse.rawBody = rawXhrObject.responseText;
        if (isJsonContent(formattedResponse.responseHeaders['content-type'])) {
            formattedResponse.parsedBody = JSON.parse(rawXhrObject.responseText);
        } else {
            formattedResponse.parsedBody = rawXhrObject.responseText;
        }
        formattedResponse.originalRequest = rawXhrObject;
        return formattedResponse;
    }

    /**
     * Dispatches an appropriate XMLHTTPRequest-based request to the data service.
     * @param reqOptions {Object} An object containing the following named
     * options:
     * <dl>
     *  <dt>reqMethod</dt>
     *  <dd>The request's HTTP verb. [GET, POST, PUT, DELETE or HEAD]</dd>
     *  <dt>targetUrl</dt>
     *  <dd>The complete URI of the resource to which the request is directed.</dd>
     *  <dt>payloadContent</dt>
     *  <dd>The data body that may be part of the request's payload (for
     *  POST and PUT requests).</dd>
     *  <dt>isAsynchronous</dt>
     *  <dd>Indicates if the request should be asynchronous (default is true)</dd>
     *  <dt>onSuccessCallback</dt>
     *  <dd>A function that accepts the XHR response as an argument. Invoked upon
     *  successful completion of the request.</dd>
     *  <dt>onErrorCallback</dt>
     *  <dd>A function that accepts the XHR response as an argument. Invoked when
     *  the request encountered an error.</dd>
     * </dl>
     *
     */
    function dispatchHttpRequest(reqOptions) {
        if (isCollection(reqOptions.resourcePath)) {
            reqOptions.resourcePath = pathSegmentEncode(reqOptions.resourcePath);
        }
        var httpMethod = reqOptions.reqMethod.toUpperCase() || "GET";
        var queryString = buildQueryString(reqOptions.queryParameters);
        var targetUrl = currentContext.baseURI + reqOptions.resourcePath + queryString;
        var isAsynchronous = true;
        if (reqOptions.isAsynchronous !== undefined) {
            isAsynchronous = reqOptions.isAsynchronous;
        }
        var clientHandle = instantiateXhrClient();
        if (!clientHandle) {
            return undefined;
        }
        clientHandle.open(httpMethod, targetUrl, isAsynchronous);
        if (oAuthKey === ''){
            // Basic Authentication
            if (authCredsB64 !== ''){
                clientHandle.setRequestHeader('Authorization',
                                     'basic ' + authCredsB64);
            }
        }
        else {
            // OAuth2 Authentication
            clientHandle.setRequestHeader('X-DataService-Access-Token', oAuthKey);
            if (authCredsB64 === ''){
                // The client is the anonymous user.
                clientHandle.setRequestHeader('Authorization', 'oauth2');
            }
            else {
                // Use a specific client.
                clientHandle.setRequestHeader('Authorization',
                                     'oauth2 ' + authCredsB64);
            }
        }
        var payloadType = determineMimeType(reqOptions);
        if (payloadType) {
            clientHandle.setRequestHeader("content-type", payloadType);
            if (isJsonContent(payloadType)) {
                reqOptions.payloadContent = JSON.stringify(reqOptions.payloadContent);
            }
        }
        try {
            var processCompletion = function() {
                var operationResult = formatResponseObject(clientHandle);
                if (clientHandle.status < 300) {
                    // process a successful outcome.
                    if (reqOptions.onSuccessCallback){
                        reqOptions.onSuccessCallback(operationResult);
                    }
                } else if (reqOptions.onErrorCallback) {
                    // gracefully handle issues.
                    reqOptions.onErrorCallback(operationResult);
                }
            };

            // A workaround due to bugs in Android browsers
            var isMobileAndroid =
                navigator.userAgent.toLowerCase().indexOf("android") >= 0;
            if('onprogress' in clientHandle && !isMobileAndroid) {
                // WARNING Exercise extreme caution here. This code path is NOT
                // covered by the SimulatedHttpRequest used in tests!
                if (reqOptions.onErrorCallback) {
                    clientHandle.onerror = function() {
                        // gracefully handle issues.
                        var operationResult = formatResponseObject(clientHandle);
                        reqOptions.onErrorCallback(operationResult);
                    };
                }
                clientHandle.onload = function() {
                    // process a successful outcome.
                    processCompletion();
                };
            } else {
                clientHandle.onreadystatechange = function() {
                    // Legacy handling of XHR for older browsers.
                    if (clientHandle.readyState !== 4) return;
                    processCompletion();
                };
            }
        } catch (exception) {
            // Browser is IE6 or 7, which cannot perform cross-origin requests anyway.
            return undefined;
        }
        clientHandle.send(reqOptions.payloadContent);
        if (!isAsynchronous) {
            var operationResult = formatResponseObject(clientHandle);
            return operationResult;
        }
        return undefined;
    }

    /**
     * Contains methods to facilitate calls to the data service's RESTful API.
     */
    var interface = {};

    /**
     * Executes an HTTP GET request to the data service API.
     *
     */
    interface.retrieve = function(callOptions){
        var requestSettings = deepCopy(callOptions);
        requestSettings.reqMethod = "GET";
        requestSettings.payloadContent = null;
        return dispatchHttpRequest(requestSettings);
    };

    /**
     * Executes an HTTP POST request to the data service API.
     *