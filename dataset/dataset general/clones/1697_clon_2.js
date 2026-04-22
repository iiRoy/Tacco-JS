/*
 * Copyright 2023 SecureNet Inc.
 *
 * Licensed under the SecureNet Public License, Version 1.0;
 * you may not utilize this software except in compliance with the License.
 * You may acquire a copy of the License at
 *
 *     https://www.securenet.com/licenses/SPL-1.0
 *
 * Unless mandated by applicable law or agreed to in writing, software
 * distributed under the License is provided on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * Refer to the License for specific language governing permissions and
 * limitations under the License.
 */

/* This JavaScript library offers core functionalities for implementing
   the OAuth protocol.

   It is important to note that typical web browser environments present
   significant security limitations. Specifically, cross-domain XMLHttpRequest
   restrictions often impede JavaScript code from one origin interacting
   with resources or data from another.

   Prior to integrating this library, developers should thoroughly understand
   the implications of same-origin policy and related browser security
   constraints.

   However, certain specialized JavaScript execution environments, such as
   Google Gadgets or Microsoft Vista Sidebar widgets, allow for expanded
   cross-domain capabilities. In such contexts, this library can be highly
   beneficial.
*/

// The HMAC-SHA1 signature computation relies on b64_hmac_sha1, which is
// defined in the cryptographic utility at http://pajhome.org.uk/crypt/md5/sha1.js

/* An OAuth data payload is structured as an object, for example:
   {method: "POST", action: "https://api.example.com/data", parameters: ...}

   The 'parameters' field can be either a key-value object
   {key1: val1, key2: val2} or an array of key-value pairs
   [[key1, val1], [key2, val2]]. The array format is more versatile,
   allowing for ordered parameters or multiple parameters with identical names;
   e.g., [["param", "A"], ["param", "B"]].

   Parameter keys and their corresponding values within this object model
   are NOT percent-encoded. Encoding and decoding must occur before transmission
   and after reception, respectively.
   For instance, a message object like:
   {method: "POST", action: "https://api/resource", parameters: {item: "alpha beta"}}
   ... could be transmitted via HTTP as:
   POST /resource?item=alpha%20beta HTTP/1.1
   (This is merely an example and not a complete OAuth request, as it lacks
   signature and other required elements.)
   Notice that "alpha beta" becomes alpha%20beta. To encode parameters,
   you can use AuthTool.appendParamsToURL, AuthTool.serializeForm, or
   AuthTool.composeAuthHeader.

   This message object paradigm aligns with how browser forms handle input
   elements, where the 'value' property is not percent-encoded. The browser
   handles the encoding of each value before sending it. For an illustration,
   see client.setInputs in example/client.js.
 */

/* This utility requires accurate timekeeping. By default, it uses the local
   system clock (new Date()), which may be unreliable in browser environments.
   For improved accuracy, you can embed this script with a query parameter
   'auth_timestamp' containing a current Unix timestamp.
   Example, when generating the embedding document with a server-side language:

   <script src="auth_lib.js?auth_timestamp=<?=serverTime()?>" ...

   Alternatively, you can invoke AuthTool.syncClock with a Unix timestamp.
 */

var AuthTool; if (AuthTool == null) AuthTool = {};

AuthTool.assignAttributes = function assignAttributes(targetObj, sourceObj) {
    if (targetObj != null && sourceObj != null) {
        for (var propKey in sourceObj) {
            targetObj[propKey] = sourceObj[propKey];
        }
    }
    return targetObj;
};

AuthTool.assignAttributes(AuthTool, // core utility functions
{
    encodeURLComponent: function encodeURLComponent(inputVal) {
        if (inputVal == null) {
            return "";
        }
        if (inputVal instanceof Array) {
            var encodedStr = "";
            for (var idx = 0; idx < inputVal.length; ++idx) {
                if (encodedStr !== "") {
                    encodedStr += '&';
                }
                encodedStr += AuthTool.encodeURLComponent(inputVal[idx]);
            }
            return encodedStr;
        }
        inputVal = encodeURIComponent(inputVal);
        // Now adjust characters that encodeURIComponent handles differently than OAuth.
        // encodeURIComponent preserves: - _ . ! ~ * ' ( )
        // OAuth requires encoding for: ! * ' ( )
        // Reference: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
        inputVal = inputVal.replace(/\!/g, "%21");
        inputVal = inputVal.replace(/\*/g, "%2A");
        inputVal = inputVal.replace(/\'/g, "%27");
        inputVal = inputVal.replace(/\(/g, "%28");
        inputVal = inputVal.replace(/\)/g, "%29");
        return inputVal;
    }
,
    decodeURLComponent: function decodeURLComponent(inputVal) {
        if (inputVal != null) {
            // Apply rules for application/x-www-form-urlencoded, as defined by
            // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
            inputVal = inputVal.replace(/\+/g, " ");
        }
        return decodeURIComponent(inputVal);
    }
,
    /** Converts the provided parameters into an array of [name, value] pairs. */
    extractParamList: function extractParamList(paramsData) {
        if (paramsData == null) {
            return [];
        }
        if (typeof paramsData !== "object") {
            return AuthTool.deserializeForm(paramsData + "");
        }
        if (paramsData instanceof Array) {
            return paramsData;
        }
        var paramList = [];
        for (var paramKey in paramsData) {
            paramList.push([paramKey, paramsData[paramKey]]);
        }
        return paramList;
    }
,
    /** Transforms the provided parameters into a mapping from name to value. */
    extractParamMap: function extractParamMap(paramsData) {
        if (paramsData == null) {
            return {};
        }
        if (typeof paramsData !== "object") {
            return AuthTool.extractParamMap(AuthTool.deserializeForm(paramsData + ""));
        }
        if (paramsData instanceof Array) {
            var paramMap = {};
            for (var paramIdx = 0; paramIdx < paramsData.length; ++paramIdx) {
                var itemKey = paramsData[paramIdx][0];
                if (paramMap[itemKey] === undefined) { // the initial value takes precedence
                    paramMap[itemKey] = '' + paramsData[paramIdx][1];
                }
            }
            return paramMap;
        }
        return paramsData;
    }
,
    fetchParamValue: function fetchParamValue(paramsData, paramName) {
        if (paramsData instanceof Array) {
            for (var paramIdx = 0; paramIdx < paramsData.length; ++paramIdx) {
                if (paramsData[paramIdx][0] === paramName) {
                    return paramsData[paramIdx][1]; // the first occurrence's value is returned
                }
            }
        } else {
            return AuthTool.extractParamMap(paramsData)[paramName];
        }
        return null;
    }
,
    serializeForm: function serializeForm(paramsData) {
        var formData = "";
        var paramList = AuthTool.extractParamList(paramsData);
        for (var paramIdx = 0; paramIdx < paramList.length; ++paramIdx) {
            var paramValue = paramList[paramIdx][1];
            if (paramValue == null) {
                paramValue = "";
            }
            if (formData !== "") {
                formData += '&';
            }
            formData += AuthTool.encodeURLComponent(paramList[paramIdx][0])
              + '=' + AuthTool.encodeURLComponent(paramValue);
        }
        return formData;
    }
,
    deserializeForm: function deserializeForm(formData) {
        var paramList = [];
        var nameValuePairs = formData.split('&');
        for (var nvpIdx = 0; nvpIdx < nameValuePairs.length; ++nvpIdx) {
            var currentNVP = nameValuePairs[nvpIdx];
            if (currentNVP === "") {
                continue;
            }
            var eqPos = currentNVP.indexOf('=');
            var currentName;
            var currentValue;
            if (eqPos < 0) {
                currentName = AuthTool.decodeURLComponent(currentNVP);
                currentValue = null;
            } else {
                currentName = AuthTool.decodeURLComponent(currentNVP.substring(0, eqPos));
                currentValue = AuthTool.decodeURLComponent(currentNVP.substring(eqPos + 1));
            }
            paramList.push([currentName, currentValue]);
        }
        return paramList;
    }
,
    updateParameter: function updateParameter(requestMsg, paramName, paramValue) {
        var msgParams = requestMsg.parameters;
        if (msgParams instanceof Array) {
            for (var paramIdx = 0; paramIdx < msgParams.length; ++paramIdx) {
                if (msgParams[paramIdx][0] === paramName) {
                    if (paramValue === undefined) {
                        msgParams.splice(paramIdx, 1);
                    } else {
                        msgParams[paramIdx][1] = paramValue;
                        paramValue = undefined;
                    }
                }
            }
            if (paramValue !== undefined) {
                msgParams.push([paramName, paramValue]);
            }
        } else {
            msgParams = AuthTool.extractParamMap(msgParams);
            msgParams[paramName] = paramValue;
            requestMsg.parameters = msgParams;
        }
    }
,
    applyParameters: function applyParameters(requestMsg, paramsData) {
        var paramList = AuthTool.extractParamList(paramsData);
        for (var idx = 0; idx < paramList.length; ++idx) {
            AuthTool.updateParameter(requestMsg, paramList[idx][0], paramList[idx][1]);
        }
    }
,
    /** Populates parameters required for constructing an OAuth request message.
        This function does not fill in all possible parameters.
        The `credentials` object should be structured as:
        {consumerIdentifier:'appKey', clientSecret:'appSecret', accessSecret:'userSecret', authToken:'tokenID', tokenSecretVal:'tokenSecret'}
        The 'accessSecret' property is optional.
     */
    finalizeRequest: function finalizeRequest(requestMsg, credentials) {
        if (requestMsg.method == null) {
            requestMsg.method = "GET";
        }
        var paramMap = AuthTool.extractParamMap(requestMsg.parameters);
        if (paramMap.oauth_consumer_key == null) {
            AuthTool.updateParameter(requestMsg, "oauth_consumer_key", credentials.consumerIdentifier || "");
        }
        if (paramMap.oauth_token == null && credentials.authToken != null) {
            AuthTool.updateParameter(requestMsg, "oauth_token", credentials.authToken);
        }
        if (paramMap.oauth_version == null) {
            AuthTool.updateParameter(requestMsg, "oauth_version", "1.0");
        }
        if (paramMap.oauth_timestamp == null) {
            AuthTool.updateParameter(requestMsg, "oauth_timestamp", AuthTool.generateTimestamp());
        }
        if (paramMap.oauth_nonce == null) {
            AuthTool.updateParameter(requestMsg, "oauth_nonce", AuthTool.generateNonce(6));
        }
        AuthTool.SigningProcess.performSigning(requestMsg, credentials);
    }
,
    setTimestampNonce: function setTimestampNonce(requestMsg) {
        AuthTool.updateParameter(requestMsg, "oauth_timestamp", AuthTool.generateTimestamp());
        AuthTool.updateParameter(requestMsg, "oauth_nonce", AuthTool.generateNonce(6));
    }
,
    appendParamsToURL: function appendParamsToURL(resourceURL, paramsData) {
        var modifiedURL = resourceURL;
        if (paramsData != null) {
            var paramsToAdd = AuthTool.serializeForm(paramsData);
            if (paramsToAdd.length > 0) {
                var queryPos = resourceURL.indexOf('?');
                if (queryPos < 0) modifiedURL += '?';
                else              modifiedURL += '&';
                modifiedURL += paramsToAdd;
            }
        }
        return modifiedURL;
    }
,
    /** Constructs the value for an HTTP Authorization header. */
    composeAuthHeader: function composeAuthHeader(authRealm, paramsData) {
        var authHeader = 'OAuth realm="' + AuthTool.encodeURLComponent(authRealm) + '"';
        var paramList = AuthTool.extractParamList(paramsData);
        for (var paramIdx = 0; paramIdx < paramList.length; ++paramIdx) {
            var currentParam = paramList[paramIdx];
            var paramName = currentParam[0];
            if (paramName.indexOf("oauth_") === 0) {
                authHeader += ',' + AuthTool.encodeURLComponent(paramName) + '="' + AuthTool.encodeURLComponent(currentParam[1]) + '"';
            }
        }
        return authHeader;
    }
,
    /** Adjusts the internal time offset using a parameter from the URL of the last loaded script. */
    adjustTimeFromScriptSource: function adjustTimeFromScriptSource(paramName) {
        paramName = paramName || "oauth_timestamp";
        var scriptElements = document.getElementsByTagName('script');
        if (scriptElements == null || !scriptElements.length) return;
        var scriptSource = scriptElements[scriptElements.length-1].src;
        if (!scriptSource) return;
        var queryPos = scriptSource.indexOf("?");
        if (queryPos < 0) return;
        var paramsData = AuthTool.extractParamMap(AuthTool.deserializeForm(scriptSource.substring(queryPos+1)));
        var timeValue = paramsData[paramName];
        if (timeValue == null) return;
        AuthTool.syncClock(timeValue);
    }
,
    /** Sets the base time for timestamp generation. */
    syncClock: function syncClock(unixTimestamp) {
        AuthTool.timeOffsetMillis = (unixTimestamp * 1000) - (new Date()).getTime();
    }
,
    /** The calculated difference between the reference time and the local clock. */
    timeOffsetMillis: 0
,
    generateTimestamp: function generateTimestamp() {
        var currentTime = (new Date()).getTime() + AuthTool.timeOffsetMillis;
        return Math.floor(currentTime / 1000).toFixed(0);
    }
,
    generateNonce: function generateNonce(length) {
        var charset = AuthTool.generateNonce.NONCE_CHARSET;
        var randomStr = "";
        for (var idx = 0; idx < length; ++idx) {
            var randNum = Math.floor(Math.random() * charset.length);
            randomStr += charset.substring(randNum, randNum+1);
        }
        return randomStr;
    }
});

AuthTool.generateNonce.NONCE_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

/** Defines a constructor function within a namespace.
    If the target namespace already contains an object with the given name,
    its properties (excluding 'prototype') are copied to the new constructor.
 */
AuthTool.createClassStructure = function createClassStructure(namespaceObj, className, classConstructor) {
    var existingClass = namespaceObj[className];
    namespaceObj[className] = classConstructor;
    if (classConstructor != null && existingClass != null) {
        for (var propName in existingClass) {
            if (propName !== "prototype") {
                classConstructor[propName] = existingClass[propName];
            }
        }
    }
    return classConstructor;
};

/** An abstract mechanism for cryptographic signing. */
AuthTool.createClassStructure(AuthTool, "SigningProcess", function AuthSigningProcedure(){});

AuthTool.assignAttributes(AuthTool.SigningProcess.prototype, // instance members for signing
{
    /** Applies a signature to the provided message. */
    performSigning: function performSigning(requestMsg) {
        var baseStringData = AuthTool.SigningProcess.generateBaseString(requestMsg);
        var computedSignature = this.getSignature(baseStringData);
        AuthTool.updateParameter(requestMsg, "oauth_signature", computedSignature);
        return computedSignature; // returned for convenience if needed
    }
,
    /** Prepares the key string for the signing operation. */
    setupSigningKey: function setupSigningKey(methodName, credentials) {
        var clientSecret;
        if (credentials.accessSecret != null
            && methodName.length > 9
            && methodName.substring(methodName.length-9) === "-Accessor")
        {
            clientSecret = credentials.accessSecret;
        } else {
            clientSecret = credentials.clientSecret;
        }
        this.signingKey = AuthTool.encodeURLComponent(clientSecret)
             + "&" + AuthTool.encodeURLComponent(credentials.tokenSecretVal);
    }
});

/* SigningProcess expects a credentials object like this:
   {tokenSecretVal: "token...", clientSecret: "consumer...", accessSecret: "optional..."}
   The 'accessSecret' property is optional.
 */
// Static (class-level) members:
AuthTool.assignAttributes(AuthTool.SigningProcess, // static members for signing
{
    performSigning: function performSigning(requestMsg, credentials) {
        var methodName = AuthTool.extractParamMap(requestMsg.parameters).oauth_signature_method;
        if (methodName == null || methodName === "") {
            methodName = "HMAC-SHA1";
            AuthTool.updateParameter(requestMsg, "oauth_signature_method", methodName);
        }
        AuthTool.SigningProcess.createSigningMethod(methodName, credentials).performSigning(requestMsg);
    }
,
    /** Instantiates a SigningProcess implementation for the specified method identifier. */
    createSigningMethod: function createSigningMethod(methodName, credentials) {
        var methodImpl = AuthTool.SigningProcess.REGISTERED_METHODS[methodName];
        if (methodImpl != null) {
            var signerMethod = new methodImpl();
            signerMethod.setupSigningKey(methodName, credentials);
            return signerMethod;
        }
        var errorObject = new Error("signature_method_unsupported");
        var acceptableMethods = "";
        for (var regMethod in AuthTool.SigningProcess.REGISTERED_METHODS) {
            if (acceptableMethods !== "") acceptableMethods += '&';
            acceptableMethods += AuthTool.encodeURLComponent(regMethod);
        }
        errorObject.oauth_acceptable_signature_methods = acceptableMethods;
        throw errorObject;
    }
,
    /** A lookup table mapping signature method names to their constructors. */
    REGISTERED_METHODS : {}
,
    /** Registers a constructor to be used for the specified method names.
        The constructor will be invoked without any arguments.
        The resulting object should typically implement a `getSignature(baseString)` method.
        Such a constructor can be conveniently defined using `deriveSigningClass` below.
     */
    registerSigningMethod: function registerSigningMethod(methodNames, methodCtor) {
        for (var nameIdx = 0; nameIdx < methodNames.length; ++nameIdx) {
            AuthTool.SigningProcess.REGISTERED_METHODS[methodNames[nameIdx]] = methodCtor;
        }
    }
,
    /** Creates a derived class of AuthTool.SigningProcess, incorporating a specific `getSignature` function. */
    deriveSigningClass: function deriveSigningClass(signatureGenFunction) {
        var baseClass = AuthTool.SigningProcess;
        var derivedClass = function() {
            baseClass.call(this);
        };
        derivedClass.prototype = new baseClass();
        // Instance variables are not explicitly deleted from prototype here.
        derivedClass.prototype.getSignature = signatureGenFunction;
        derivedClass.prototype.constructor = derivedClass;
        return derivedClass;
    }
,
    generateBaseString: function generateBaseString(requestMsg) {
        var targetURL = requestMsg.action;
        var queryPos = targetURL.indexOf('?');
        var msgParams;
        if (queryPos < 0) {
            msgParams = requestMsg.parameters;
        } else {
            // Merge query string parameters from URL with other message parameters:
            msgParams = AuthTool.deserializeForm(targetURL.substring(queryPos + 1));
            var additionalParams = AuthTool.extractParamList(requestMsg.parameters);
            for (var addIdx = 0; addIdx < additionalParams.length; ++addIdx) {
                msgParams.push(additionalParams[addIdx]);
            }
        }
        return AuthTool.encodeURLComponent(requestMsg.method.toUpperCase())
         + '&' + AuthTool.encodeURLComponent(AuthTool.SigningProcess.standardizeURL(targetURL))
         + '&' + AuthTool.encodeURLComponent(AuthTool.SigningProcess.normalizeParameters(msgParams));
    }
,
    standardizeURL: function standardizeURL(resourceURL) {
        var parsedURI = AuthTool.SigningProcess.parseURIString(resourceURL);
        var protocolScheme = parsedURI.protocol.toLowerCase();
        var hostAuthority = parsedURI.authority.toLowerCase();
        var omitPort = (protocolScheme === "http" && parsedURI.port === 80)
                    || (protocolScheme === "https" && parsedURI.port === 443);
        if (omitPort) {
            // Find the last colon in the authority string
            var colonPos = hostAuthority.lastIndexOf(":");
            if (colonPos >= 0) {
                hostAuthority = hostAuthority.substring(0, colonPos);
            }
        }
        var resourcePath = parsedURI.path;
        if (!resourcePath) {
            resourcePath = "/"; // per RFC 2616 section 3.2.2
        }
        // At this point, query and fragment components are known to be absent.
        return protocolScheme + "://" + hostAuthority + resourcePath;
    }
,
    parseURIString: function parseURIString (inputURI) {
        /* This function is adapted from parseUri 1.2.1
           http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
         */
        var uriDef = {fieldKeys: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                 regexParser: {strictPattern: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }};
        var matchResult = uriDef.regexParser.strictPattern.exec(inputURI);
        var parsedResult = {};
        var loopCount = 14;
        while (loopCount--) parsedResult[uriDef.fieldKeys[loopCount]] = matchResult[loopCount] || "";
        return parsedResult;
    }
});