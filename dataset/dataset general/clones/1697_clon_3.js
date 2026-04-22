/*
 * Core utility functions for OAuth 1.0a protocol operations.
 *
 * This module provides functionalities for handling request parameters,
 * URL manipulation, timestamp generation, and signature base string construction,
 * essential for creating and verifying OAuth requests.
 *
 * It's important to be aware of browser security restrictions,
 * especially regarding cross-origin XMLHttpRequest, when using this library
 * in a web browser environment. For platforms that allow broader network access,
 * such as server-side JavaScript runtimes or specific client-side environments
 * like Google Gadgets, this library can be highly beneficial.
 */

// Placeholder for the main utility object.
// We check for its existence to allow for modular loading or pre-defined properties.
var AuthUtil;
if (AuthUtil === null || typeof AuthUtil === 'undefined') {
    AuthUtil = {};
}

/**
 * Assigns properties from a source object to a target object.
 * This is a shallow merge operation.
 *
 * @param {object} targetObj - The object to which properties will be assigned.
 * @param {object} sourceObj - The object from which properties will be copied.
 * @returns {object} The modified target object.
 */
AuthUtil.assignProps = function assignProps(targetObj, sourceObj) {
    if (!targetObj || !sourceObj) {
        return targetObj; // Return target unchanged if either is null/undefined
    }
    // Use Object.assign for modern environments, fall back to loop for older ones.
    if (typeof Object.assign === 'function') {
        return Object.assign(targetObj, sourceObj);
    } else {
        for (const propKey in sourceObj) {
            // Ensure property belongs to the source object itself, not its prototype chain
            if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                targetObj[propKey] = sourceObj[propKey];
            }
        }
        return targetObj;
    }
};

AuthUtil.assignProps(AuthUtil, // Core utility functions
{
    /**
     * Encodes a string for URL components according to OAuth 1.0a specifications.
     * This is stricter than standard encodeURIComponent.
     *
     * @param {string|null|undefined} inputVal - The string value to encode.
     * @returns {string} The percent-encoded string.
     */
    encodeURLComponentStrict: function encodeURLComponentStrict(inputVal) {
        if (inputVal === null || typeof inputVal === 'undefined') {
            return "";
        }
        // Ensure input is treated as a string before encoding.
        let encodedStr = encodeURIComponent(String(inputVal));

        // OAuth requires specific characters to be encoded that encodeURIComponent leaves unencoded.
        // These are: '!', '*', '(', ')'.
        // encodeURIComponent ignores: - _ . ! ~ * ' ( )
        // OAuth dictates the only ones you can ignore are: - _ . ~
        // We replace them with their percent-encoded equivalents.
        encodedStr = encodedStr.replace(/[!*()'~]/g, function(char) {
            switch(char) {
                case '!': return '%21';
                case '*': return '%2A';
                case "'": return '%27';
                case '(': return '%28';
                case ')': return '%29';
                case '~': return '%7E'; // encodeURIComponent typically leaves '~' alone, but good to be explicit
                default: return char;
            }
        });
        return encodedStr;
    },

    /**
     * Decodes a percent-encoded URL component string.
     * Handles '+' as a space, common in application/x-www-form-urlencoded.
     *
     * @param {string|null|undefined} encodedVal - The string value to decode.
     * @returns {string} The decoded string.
     */
    decodeURLComponentLenient: function decodeURLComponentLenient(encodedVal) {
        if (encodedVal === null || typeof encodedVal === 'undefined') {
            return "";
        }
        // Replace '+' with ' ' before decoding, as per application/x-www-form-urlencoded.
        const normalizedVal = String(encodedVal).replace(/\+/g, " ");
        return decodeURIComponent(normalizedVal);
    },

    /**
     * Converts various parameter representations into an Array of name-value pairs.
     *
     * @param {object|Array|string|null} requestParams - Parameters as an object, array of pairs, or form string.
     * @returns {Array<Array<string>>} An array of `[name, value]` pairs.
     */
    extractParamList: function extractParamList(requestParams) {
        if (requestParams === null || typeof requestParams === 'undefined') {
            return [];
        }
        if (Array.isArray(requestParams)) {
            return requestParams;
        }
        if (typeof requestParams === "string") {
            return AuthUtil.deserializeForm(requestParams);
        }
        // If it's an object (map), convert to array of pairs.
        const paramList = [];
        for (const propName in requestParams) {
            if (Object.prototype.hasOwnProperty.call(requestParams, propName)) {
                paramList.push([propName, requestParams[propName]]);
            }
        }
        return paramList;
    },

    /**
     * Converts various parameter representations into a map from name to value.
     * For duplicate names, the first encountered value is retained.
     *
     * @param {object|Array|string|null} requestParams - Parameters as an object, array of pairs, or form string.
     * @returns {object} A map of parameter names to their values.
     */
    extractParamMap: function extractParamMap(requestParams) {
        if (requestParams === null || typeof requestParams === 'undefined') {
            return {};
        }
        if (typeof requestParams === "string") {
            // First decode the form, then convert the resulting list to a map.
            return AuthUtil.extractParamMap(AuthUtil.deserializeForm(requestParams));
        }
        if (Array.isArray(requestParams)) {
            const paramMap = {};
            for (let idx = 0; idx < requestParams.length; ++idx) {
                const pair = requestParams[idx];
                // Ensure pair is an array of at least 2 elements
                if (Array.isArray(pair) && pair.length >= 2) {
                    const paramName = pair[0];
                    // Only assign if the key doesn't already exist (first value wins).
                    if (paramMap[paramName] === undefined) {
                        paramMap[paramName] = String(pair[1]); // Ensure value is a string
                    }
                }
            }
            return paramMap;
        }
        // If it's already an object, return a shallow copy to prevent external modification
        return { ...requestParams };
    },

    /**
     * Retrieves the value of a specific parameter from a parameter collection.
     * For arrays, it returns the value of the first occurrence.
     *
     * @param {object|Array|string} requestParams - The parameter collection.
     * @param {string} paramName - The name of the parameter to retrieve.
     * @returns {string|null} The parameter's value, or null if not found.
     */
    getSingleParam: function getSingleParam(requestParams, paramName) {
        if (!requestParams || !paramName) {
            return null;
        }

        if (Array.isArray(requestParams)) {
            for (let idx = 0; idx < requestParams.length; ++idx) {
                if (requestParams[idx][0] === paramName) {
                    return requestParams[idx][1]; // First value wins
                }
            }
        } else {
            // Treat as a map or convert string to map
            const paramMap = AuthUtil.extractParamMap(requestParams);
            if (Object.prototype.hasOwnProperty.call(paramMap, paramName)) {
                return paramMap[paramName];
            }
        }
        return null;
    },

    /**
     * Serializes a parameter collection into a URL-encoded form string.
     *
     * @param {object|Array|string} requestParams - The parameters to encode.
     * @returns {string} The URL-encoded form string.
     */
    serializeParams: function serializeParams(requestParams) {
        let encodedFormStr = "";
        const paramList = AuthUtil.extractParamList(requestParams);

        for (let idx = 0; idx < paramList.length; ++idx) {
            const pair = paramList[idx];
            // Ensure pair is an array of at least 2 elements
            if (!Array.isArray(pair) || pair.length < 2) {
                continue; // Skip malformed pairs
            }
            const paramName = pair[0];
            let paramValue = pair[1];

            if (paramValue === null || typeof paramValue === 'undefined') {
                paramValue = ""; // Treat null/undefined values as empty strings
            }

            if (encodedFormStr !== "") {
                encodedFormStr += '&';
            }
            encodedFormStr += AuthUtil.encodeURLComponentStrict(paramName) +
                              '=' +
                              AuthUtil.encodeURLComponentStrict(paramValue);
        }
        return encodedFormStr;
    },

    /**
     * Deserializes a URL-encoded form string into an array of name-value pairs.
     *
     * @param {string} encodedFormStr - The form string to decode.
     * @returns {Array<Array<string|null>>} An array of `[name, value]` pairs. Values can be null if no '=' is present.
     */
    deserializeForm: function deserializeForm(encodedFormStr) {
        const paramList = [];
        if (!encodedFormStr || typeof encodedFormStr !== 'string') {
            return paramList;
        }

        const nameValuePairs = encodedFormStr.split('&');
        for (let idx = 0; idx < nameValuePairs.length; ++idx) {
            const pairStr = nameValuePairs[idx];
            if (pairStr.trim() === "") {
                continue; // Skip empty segments
            }

            const eqPos = pairStr.indexOf('=');
            let paramName;
            let paramValue;

            if (eqPos < 0) {
                paramName = AuthUtil.decodeURLComponentLenient(pairStr);
                paramValue = null; // Value is null if no '='
            } else {
                paramName = AuthUtil.decodeURLComponentLenient(pairStr.substring(0, eqPos));
                paramValue = AuthUtil.decodeURLComponentLenient(pairStr.substring(eqPos + 1));
            }
            paramList.push([paramName, paramValue]);
        }
        return paramList;
    },

    /**
     * Sets or updates a single parameter within a message's parameter collection.
     * If `value` is `undefined`, the parameter is removed if found.
     *
     * @param {object} requestData - The message object containing `parameters`.
     * @param {string} paramName - The name of the parameter to set.
     * @param {string|null|undefined} paramValue - The value to set. `undefined` removes the parameter.
     */
    setSingleParam: function setSingleParam(requestData, paramName, paramValue) {
        if (!requestData || !paramName) {
            return;
        }

        let currentParams = requestData.parameters;

        if (Array.isArray(currentParams)) {
            let foundAndHandled = false;
            for (let i = 0; i < currentParams.length; ++i) {
                if (currentParams[i] && currentParams[i][0] === paramName) {
                    if (paramValue === undefined) {
                        currentParams.splice(i, 1); // Remove the parameter
                        i--; // Adjust index for removed element
                    } else {
                        currentParams[i][1] = paramValue; // Update value
                        foundAndHandled = true;
                        break; // Assuming only one update for the first match
                    }
                }
            }
            if (!foundAndHandled && paramValue !== undefined) {
                currentParams.push([paramName, paramValue]); // Add if not found and not undefined
            }
        } else {
            // Treat as an object (map)
            // Ensure it's a mutable map if it came from a string or immutable source
            if (typeof currentParams === 'string' || currentParams === null || typeof currentParams === 'undefined') {
                currentParams = AuthUtil.extractParamMap(currentParams);
            } else {
                // Make a shallow copy to avoid modifying original object if it's shared
                currentParams = { ...currentParams };
            }

            if (paramValue === undefined) {
                delete currentParams[paramName];
            } else {
                currentParams[paramName] = paramValue;
            }
            requestData.parameters = currentParams; // Update the message object
        }
    },

    /**
     * Applies a collection of parameters to a message object.
     * Each parameter in the input collection will be set or updated.
     *
     * @param {object} requestData - The message object.
     * @param {object|Array|string} newParams - The parameters to apply.
     */
    applyParams: function applyParams(requestData, newParams) {
        const paramList = AuthUtil.extractParamList(newParams);
        for (let idx = 0; idx < paramList.length; ++idx) {
            const pair = paramList[idx];
            if (Array.isArray(pair) && pair.length >= 2) {
                AuthUtil.setSingleParam(requestData, pair[0], pair[1]);
            }
        }
    },

    /**
     * Default OAuth version constant.
     */
    OAUTH_VERSION: "1.0",

    /**
     * Fills in standard OAuth parameters (consumer key, token, version, timestamp, nonce)
     * into a request message, and then signs it.
     *
     * @param {object} requestData - The message object to complete.
     * @param {object} credentials - An accessor object containing OAuth credentials.
     *   Expected properties: `consumerKey`, `consumerSecret`, `token` (optional),
     *   `tokenSecret` (optional), `accessorSecret` (optional).
     */
    finalizeAuthRequest: function finalizeAuthRequest(requestData, credentials) {
        if (!requestData || typeof requestData !== 'object') {
            throw new Error("Invalid request data provided for finalization.");
        }
        if (!credentials || typeof credentials !== 'object') {
            throw new Error("Invalid credentials provided for finalization.");
        }
        if (!credentials.consumerKey) {
             throw new Error("Missing 'consumerKey' in credentials for OAuth request.");
        }

        // Ensure method is set, default to GET
        if (requestData.method === null || typeof requestData.method === 'undefined') {
            requestData.method = "GET";
        }

        // Get current parameters as a map for quick lookups
        const currentParamMap = AuthUtil.extractParamMap(requestData.parameters);

        // Set oauth_consumer_key if not present
        if (currentParamMap.oauth_consumer_key === undefined) {
            AuthUtil.setSingleParam(requestData, "oauth_consumer_key", credentials.consumerKey);
        }

        // Set oauth_token if provided in credentials and not present
        if (credentials.token && currentParamMap.oauth_token === undefined) {
            AuthUtil.setSingleParam(requestData, "oauth_token", credentials.token);
        }

        // Set oauth_version if not present
        if (currentParamMap.oauth_version === undefined) {
            AuthUtil.setSingleParam(requestData, "oauth_version", AuthUtil.OAUTH_VERSION);
        }

        // Set timestamp and nonce if not present
        if (currentParamMap.oauth_timestamp === undefined || currentParamMap.oauth_nonce === undefined) {
            AuthUtil.updateTimestampsAndNonces(requestData);
        }

        // Finally, sign the request
        AuthUtil.AuthSigner.executeSigning(requestData, credentials);
    },

    /**
     * Updates the `oauth_timestamp` and `oauth_nonce` parameters in a message.
     *
     * @param {object} requestData - The message object.
     */
    updateTimestampsAndNonces: function updateTimestampsAndNonces(requestData) {
        AuthUtil.setSingleParam(requestData, "oauth_timestamp", AuthUtil.getUnixTimestamp());
        AuthUtil.setSingleParam(requestData, "oauth_nonce", AuthUtil.generateNonceString(AuthUtil.DEFAULT_NONCE_LENGTH));
    },

    /**
     * Appends parameters to a URL.
     *
     * @param {string} targetURL - The base URL.
     * @param {object|Array|string|null} requestParams - The parameters to append.
     * @returns {string} The URL with appended parameters.
     */
    appendParamsToURL: function appendParamsToURL(targetURL, requestParams) {
        let modifiedURL = targetURL;
        if (!requestParams) {
            return modifiedURL;
        }

        const paramsToAdd = AuthUtil.serializeParams(requestParams);
        if (paramsToAdd.length > 0) {
            const queryStartIdx = targetURL.indexOf('?');
            // If URL already has a query string, append with '&', otherwise with '?'
            modifiedURL += (queryStartIdx < 0) ? '?' : '&';
            modifiedURL += paramsToAdd;
        }
        return modifiedURL;
    },

    /**
     * Constructs the value for an HTTP Authorization header for OAuth.
     *
     * @param {string} realm - The OAuth realm.
     * @param {object|Array|string} requestParams - The parameters containing `oauth_` prefixed values.
     * @returns {string} The Authorization header string.
     */
    composeAuthHeader: function composeAuthHeader(realm, requestParams) {
        let authHeaderString = 'OAuth realm="' + AuthUtil.encodeURLComponentStrict(realm) + '"';
        const paramList = AuthUtil.extractParamList(requestParams);

        for (let idx = 0; idx < paramList.length; ++idx) {
            const pair = paramList[idx];
            if (Array.isArray(pair) && pair.length >= 2) {
                const paramName = pair[0];
                // Only include parameters starting with "oauth_"
                if (paramName.startsWith("oauth_")) {
                    authHeaderString += ',' + AuthUtil.encodeURLComponentStrict(paramName) +
                                        '="' + AuthUtil.encodeURLComponentStrict(pair[1]) + '"';
                }
            }
        }
        return authHeaderString;
    },

    /**
     * Attempts to adjust the internal clock offset using a timestamp found in
     * the query string of the currently executing script's URL.
     *
     * @param {string} [paramName="oauth_timestamp"] - The name of the query parameter to look for.
     */
    adjustTimeFromScriptSrc: function adjustTimeFromScriptSrc(paramName) {
        const timestampParamName = paramName || "oauth_timestamp";
        let scriptSource = null;

        // Prefer document.currentScript for modern browsers
        if (document.currentScript && document.currentScript.src) {
            scriptSource = document.currentScript.src;
        } else {
            // Fallback for older browsers: get the last script tag
            const allScripts = document.getElementsByTagName('script');
            if (allScripts && allScripts.length > 0) {
                scriptSource = allScripts[allScripts.length - 1].src;
            }
        }

        if (!scriptSource) {
            return; // No script source found
        }

        const queryStartIdx = scriptSource.indexOf("?");
        if (queryStartIdx < 0) {
            return; // No query string
        }

        const scriptQueryParams = AuthUtil.extractParamMap(AuthUtil.deserializeForm(scriptSource.substring(queryStartIdx + 1)));
        const timestampVal = scriptQueryParams[timestampParamName];

        if (timestampVal !== undefined && timestampVal !== null) {
            const parsedTimestamp = parseInt(timestampVal, 10);
            if (!isNaN(parsedTimestamp)) {
                AuthUtil.syncClockOffset(parsedTimestamp);
            } else {
                console.warn("AuthUtil: Found oauth_timestamp parameter but it's not a valid number:", timestampVal);
            }
        }
    },

    /**
     * Sets an internal clock offset based on a provided Unix timestamp.
     * Subsequent calls to `getUnixTimestamp` will use this offset.
     *
     * @param {number} externalTimestampSec - A Unix timestamp in seconds.
     */
    syncClockOffset: function syncClockOffset(externalTimestampSec) {
        AuthUtil.clockSkewMillis = (externalTimestampSec * 1000) - Date.now();
    },

    /**
     * Stores the difference between the correct time and the local clock, in milliseconds.
     * Initialized to 0, meaning no correction.
     * @type {number}
     */
    clockSkewMillis: 0,

    /**
     * Generates a current Unix timestamp (seconds since epoch), adjusted by any `clockSkewMillis`.
     *
     * @returns {string} The Unix timestamp as a string.
     */
    getUnixTimestamp: function getUnixTimestamp() {
        const adjustedTimeMs = Date.now() + AuthUtil.clockSkewMillis;
        return String(Math.floor(adjustedTimeMs / 1000));
    },

    /**
     * Default length for generated nonces.
     * @type {number}
     */
    DEFAULT_NONCE_LENGTH: 32,

    /**
     * Generates a random alphanumeric string (nonce).
     *
     * @param {number} length - The desired length of the nonce string.
     * @returns {string} A random string.
     */
    generateNonceString: function generateNonceString(length) {
        const nonceCharSet = AuthUtil.NONCE_CHARS_SET;
        if (!nonceCharSet || nonceCharSet.length === 0) {
            console.error("AuthUtil: Nonce character set is not defined or empty.");
            return "";
        }

        let result = "";
        for (let i = 0; i < length; ++i) {
            const randIndex = Math.floor(Math.random() * nonceCharSet.length);
            result += nonceCharSet.charAt(randIndex);
        }
        return result;
    }
});

/**
 * Character set used for generating nonces.
 * @type {string}
 */
AuthUtil.NONCE_CHARS_SET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";


/**
 * Utility function to define a constructor function as a property of a parent object.
 * If a property with the same name already exists on the parent, its enumerable
 * properties (excluding 'prototype') are copied to the new constructor,
 * allowing for progressive module definition or inheritance.
 *
 * @param {object} parentObj - The object to which the new class/constructor will be added.
 * @param {string} className - The name of the class/constructor.
 * @param {Function} newConstructorFunc - The constructor function for the new class.
 * @returns {Function} The `newConstructorFunc` that was passed in.
 */
AuthUtil.defineModuleClass = function defineModuleClass(parentObj, className, newConstructorFunc) {
    const existingProperty = parentObj[className];
    parentObj[className] = newConstructorFunc;

    if (newConstructorFunc && existingProperty && typeof existingProperty === 'function') {
        // Copy static properties from the old constructor to the new one, excluding 'prototype'.
        for (const propKey in existingProperty) {
            if (Object.prototype.hasOwnProperty.call(existingProperty, propKey) && propKey !== "prototype") {
                newConstructorFunc[propKey] = existingProperty[propKey];
            }
        }
    }
    return newConstructorFunc;
};

/**
 * An abstract base class for OAuth signature methods.
 * Concrete implementations must provide a `getSignature` method.
 * @constructor
 */
AuthUtil.defineModuleClass(AuthUtil, "AuthSigner", function AuthSigner() {
    // Constructor for the base signer class.
    // Derived classes will typically call this via `superClass.call(this);`
});

AuthUtil.assignProps(AuthUtil.AuthSigner.prototype, // Instance members for AuthSigner
{
    /**
     * Generates and applies the OAuth signature to a request message.
     * This method typically calls `getSignature` (which must be implemented by subclasses)
     * and then sets the `oauth_signature` parameter.
     *
     * @param {object} requestData - The message object to be signed.
     * @returns {string} The generated signature string.
     */
    generateSignature: function generateSignature(requestData) {
        if (typeof this.getSignature !== 'function') {
            throw new Error("AuthSigner subclass must implement 'getSignature' method.");
        }
        const baseString = AuthUtil.AuthSigner.buildBaseString(requestData);
        const signature = this.getSignature(baseString);
        AuthUtil.setSingleParam(requestData, "oauth_signature", signature);
        return signature;
    },

    /**
     * Initializes the signer instance with the necessary keys (consumer and token secrets).
     * This method must be called before `generateSignature`.
     *
     * @param {string} methodName - The name of the signature method (e.g., "HMAC-SHA1").
     * @param {object} credentials - The accessor object containing `consumerSecret`, `tokenSecret`, `accessorSecret`.
     */
    setupSignerKeys: function setupSignerKeys(methodName, credentials) {
        let effectiveConsumerSecret;

        // Special handling for 'accessorSecret' if method name indicates it (e.g., "-Accessor" suffix).
        // This is a specific OAuth extension or custom behavior.
        if (credentials.accessorSecret && methodName.endsWith("-Accessor")) {
            effectiveConsumerSecret = credentials.accessorSecret;
        } else {
            effectiveConsumerSecret = credentials.consumerSecret;
        }

        // The signing key is typically a concatenation of percent-encoded consumer and token secrets.
        this.signingKey = AuthUtil.encodeURLComponentStrict(effectiveConsumerSecret || "") +
                          "&" +
                          AuthUtil.encodeURLComponentStrict(credentials.tokenSecret || "");
    }
});

/*
 * Note: AuthSigner expects a credentials object like this:
 * { tokenSecret: "...", consumerSecret: "...", accessorSecret: "..." }
 * The accessorSecret property is optional and used for specific signature methods.
 */
// Static (class) members for AuthSigner:
AuthUtil.assignProps(AuthUtil.AuthSigner,
{
    /**
     * Executes the signing process for a given message using the specified
     * (or default) signature method.
     *
     * @param {object} requestData - The message object to be signed.
     * @param {object} credentials - The accessor object with secrets.
     */
    executeSigning: function executeSigning(requestData, credentials) {
        const requestParamMap = AuthUtil.extractParamMap(requestData.parameters);
        let signerMethodName = requestParamMap.oauth_signature_method;

        // If no signature method is specified, default to HMAC-SHA1.
        if (!signerMethodName) {
            signerMethodName = "HMAC-SHA1";
            AuthUtil.setSingleParam(requestData, "oauth_signature_method", signerMethodName);
        }

        const signerInstance = AuthUtil.AuthSigner.createSignerInstance(signerMethodName, credentials);
        signerInstance.generateSignature(requestData);
    },

    /**
     * Instantiates a concrete `AuthSigner` implementation based on the given method name.
     *
     * @param {string} methodName - The name of the signature method (e.g., "HMAC-SHA1").
     * @param {object} credentials - The credentials object for initializing the signer.
     * @returns {AuthUtil.AuthSigner} An initialized instance of the specific signature method.
     * @throws {Error} If the signature method is not registered.
     */
    createSignerInstance: function createSignerInstance(methodName, credentials) {
        const signerImplementation = AuthUtil.AuthSigner.REGISTERED_SIGNERS[methodName];
        if (!signerImplementation) {
            const errorObject = new Error("Unsupported_signature_method: " + methodName);
            errorObject.oauth_acceptable_signature_methods = Object.keys(AuthUtil.AuthSigner.REGISTERED_SIGNERS)
                                                                   .map(AuthUtil.encodeURLComponentStrict)
                                                                   .join('&');
            throw errorObject;
        }

        const newSigner = new signerImplementation();
        newSigner.setupSignerKeys(methodName, credentials); // Initialize with keys
        return newSigner;
    },

    /**
     * A map from signature method name to its constructor function.
     * @type {object<string, Function>}
     */
    REGISTERED_SIGNERS: {},

    /**
     * Registers one or more signature method names with a specific constructor function.
     * The constructor should be a subclass of `AuthUtil.AuthSigner`.
     *
     * @param {Array<string>} methodNames - An array of signature method names to register.
     * @param {Function} constructorFunc - The constructor function for the signature method.
     */
    registerSigningMethod: function registerSigningMethod(methodNames, constructorFunc) {
        if (!Array.isArray(methodNames)) {
            methodNames = [methodNames]; // Ensure it's an array for consistency
        }
        methodNames.forEach(name => {
            AuthUtil.AuthSigner.REGISTERED_SIGNERS[name] = constructorFunc;
        });
    },

    /**
     * Creates a derived class from `AuthUtil.AuthSigner` with a custom `getSignature` function.
     * This simplifies defining new signature methods.
     *
     * @param {Function} signatureGenerationFunc - The function that implements the `getSignature` logic.
     * @returns {Function} A new constructor function for the derived signer class.
     */
    createSignerSubclass: function createSignerSubclass(signatureGenerationFunc) {
        const baseSignerClass = AuthUtil.AuthSigner;

        // Define the derived constructor.
        function DerivedSigner() {
            baseSignerClass.call(this); // Call the base constructor
        }

        // Set up prototype chain for inheritance.
        // Object.create is preferred for cleaner inheritance.
        DerivedSigner.prototype = Object.create(baseSignerClass.prototype);
        DerivedSigner.prototype.constructor = DerivedSigner; // Correctly set the constructor property.

        // Assign the custom signature generation function.
        DerivedSigner.prototype.getSignature = signatureGenerationFunc;

        return DerivedSigner;
    },

    /**
     * Constructs the OAuth signature base string from a request message.
     * This string is then used by the signature method to generate the final signature.
     *
     * @param {object} requestData - The message object with `method`, `action`, and `parameters`.
     * @returns {string} The signature base string.
     */
    buildBaseString: function buildBaseString(requestData) {
        const resourceURL = requestData.action;
        const queryStartIdx = resourceURL.indexOf('?');
        let combinedParams;

        if (queryStartIdx < 0) {
            // No query string in URL, use only message parameters.
            combinedParams = AuthUtil.extractParamList(requestData.parameters);
        } else {
            // Combine URL query parameters with message parameters.
            const urlQueryParams = AuthUtil.deserializeForm(resourceURL.substring(queryStartIdx + 1));
            const messageParams = AuthUtil.extractParamList(requestData.parameters);
            combinedParams = urlQueryParams.concat(messageParams);
        }

        // The base string consists of:
        // 1. HTTP method (uppercase)
        // 2. Normalized request URL
        // 3. Normalized and encoded parameters
        return AuthUtil.encodeURLComponentStrict(requestData.method.toUpperCase()) +
               '&' +
               AuthUtil.encodeURLComponentStrict(AuthUtil.AuthSigner.normalizeRequestURL(resourceURL)) +
               '&' +
               AuthUtil.encodeURLComponentStrict(AuthUtil.AuthSigner.normalizeParameters(combinedParams));
    },

    /**
     * Normalizes a URL according to OAuth 1.0a specifications.
     * This involves converting scheme and authority to lowercase, removing default ports,
     * and ensuring a path exists.
     *
     * @param {string} originalURL - The URL string to normalize.
     * @returns {string} The normalized URL.
     */
    normalizeRequestURL: function normalizeRequestURL(originalURL) {
        const parsedURI = AuthUtil.AuthSigner.parseURLParts(originalURL);
        const protocolScheme = parsedURI.protocol.toLowerCase();
        let hostAuthority = parsedURI.authority.toLowerCase();

        const removeDefaultPort = (protocolScheme === "http" && parsedURI.port === "80") ||
                                  (protocolScheme === "https" && parsedURI.port === "443");

        if (removeDefaultPort) {
            // Remove the default port from the authority string.
            const colonIndex = hostAuthority.lastIndexOf(":");
            if (colonIndex >= 0) {
                hostAuthority = hostAuthority.substring(0, colonIndex);
            }
        }

        let resourcePath = parsedURI.path;
        if (!resourcePath) {
            resourcePath = "/"; // Conforms to RFC 2616 section 3.2.2 for empty paths.
        }

        // The normalized URL does not include query string or fragment.
        return protocolScheme + "://" + hostAuthority + resourcePath;
    },

    /**
     * Normalizes a collection of parameters for inclusion in the signature base string.
     * This involves sorting parameters and concatenating them into a single string.
     *
     * @param {Array<Array<string|null>>} paramList - An array of `[name, value]` pairs.
     * @returns {string} The normalized parameter string.
     */
    normalizeParameters: function normalizeParameters(paramList) {
        if (!paramList || paramList.length === 0) {
            return "";
        }

        // 1. Sort parameters by name, then by value (if names are identical).
        //    OAuth specification requires sorting by name first, then by value if names are equal.
        const sortedParams = paramList.slice().sort((a, b) => {
            const nameA = AuthUtil.encodeURLComponentStrict(a[0] || "");
            const nameB = AuthUtil.encodeURLComponentStrict(b[0] || "");
            if (nameA === nameB) {
                const valA = AuthUtil.encodeURLComponentStrict(a[1] || "");
                const valB = AuthUtil.encodeURLComponentStrict(b[1] || "");
                return valA.localeCompare(valB);
            }
            return nameA.localeCompare(nameB);
        });

        // 2. Format into name=value pairs, separated by '&'.
        const normalizedStringSegments = sortedParams.map(pair => {
            const paramName = AuthUtil.encodeURLComponentStrict(pair[0] || "");
            const paramValue = AuthUtil.encodeURLComponentStrict(pair[1] || "");
            return `${paramName}=${paramValue}`;
        });

        return normalizedStringSegments.join('&');
    },

    /**
     * Parses a URL string into its constituent parts (protocol, authority, path, etc.).
     * This function is adapted from Steven Levithan's `parseUri` 1.2.1.
     *
     * @param {string} urlString - The URL to parse.
     * @returns {object} An object containing various URL components.
     */
    parseURLParts: function parseURLParts(urlString) {
        // Configuration for the URI parser regex.
        const uriParserConfig = {
            keys: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
            regex: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/
        };

        const matchResult = uriParserConfig.regex.exec(urlString);
        const parsedURI = {};
        let loopVar = uriParserConfig.keys.length;

        // Assign matched groups to named properties.
        while (loopVar--) {
            parsedURI[uriParserConfig.keys[loopVar]] = matchResult[loopVar] || "";
        }

        // Add a convenience property for the full query string (excluding '?').
        parsedURI.query = parsedURI.query || '';

        return parsedURI;
    }
});