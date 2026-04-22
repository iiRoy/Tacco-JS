// A cryptographic signing utility for data integrity.
var Signer = require('keygrip');

// Core Node.js HTTP module functionalities.
var webProtocol = require('http');

// Storage for compiled regular expression patterns to optimize lookups.
var patternStore = {};

/**
 * Manages HTTP cookies for a given request-response cycle.
 * @param {object} reqCtx - The incoming HTTP request object.
 * @param {object} respCtx - The outgoing HTTP response object.
 * @param {Array<string>|Signer} signingKeys - Keys for cryptographic signing or a Keygrip instance.
 */
function WebCookies(reqCtx, respCtx, signingKeys) {
    // Ensure 'this' refers to an instance of WebCookies.
    if ( !(this instanceof WebCookies) ) {
        return new WebCookies(reqCtx, respCtx, signingKeys);
    }

    this.reqContext = reqCtx;
    this.respContext = respCtx;

    if (signingKeys) {
        // If provided, the keys can be an array of strings for new Signer instance...
        if (Array.isArray(signingKeys)) {
            this.signingUtil = new Signer(signingKeys);
        }
        // ...or an existing Signer (Keygrip) instance to support various versions.
        else if (signingKeys.constructor && signingKeys.constructor.name === 'Keygrip') {
            this.signingUtil = signingKeys;
        }
    }
}

WebCookies.prototype = {
    /**
     * Retrieves a cookie's value from the request headers.
     * @param {string} cookieName - The identifier of the cookie to retrieve.
     * @param {object} [options] - Configuration for retrieval, e.g., { signed: true }.
     * @returns {string|undefined} The cookie's value, or undefined if not found.
     */
    obtain: function(cookieName, options) {
        var signatureName = cookieName + ".sig";
        var reqHeader, headerMatch, cookieValue, remoteSignature, signedData, sigValidationIndex;
        var isSigned = options && options.signed !== undefined ? options.signed : !!this.signingUtil;

        reqHeader = this.reqContext.headers["cookie"];
        if (!reqHeader) {
            return undefined; // No cookie header found in the request.
        }

        headerMatch = reqHeader.match(retrievePattern(cookieName));
        if (!headerMatch) {
            return undefined; // The specific cookie was not found.
        }

        cookieValue = headerMatch[1]; // Extract the cookie value.

        // If not signed or options don't require signing, return the plain value.
        if (!options || !isSigned) {
            return cookieValue;
        }

        // Attempt to retrieve the associated signature cookie.
        remoteSignature = this.obtain(signatureName);
        if (!remoteSignature) {
            return undefined; // Signed cookie requested, but no signature found.
        }

        signedData = cookieName + "=" + cookieValue;
        if (!this.signingUtil) {
            throw new Error('A signing utility is mandatory for signed cookies.');
        }

        // Validate the signature using the signing utility.
        sigValidationIndex = this.signingUtil.index(signedData, remoteSignature);

        if (sigValidationIndex < 0) {
            // Signature is invalid. Remove the signature cookie.
            this.update(signatureName, null, { path: "/", signed: false });
            return undefined; // Invalid signature, treat as not found.
        } else {
            // Signature is valid. If it's not the primary key, re-sign to update.
            sigValidationIndex && this.update(signatureName, this.signingUtil.sign(signedData), { signed: false });
            return cookieValue; // Return the valid cookie value.
        }
    },

    /**
     * Sets or updates a cookie in the response headers.
     * @param {string} cookieName - The identifier of the cookie to set.
     * @param {string} cookieValue - The data content for the cookie.
     * @param {object} [options] - Configuration for the cookie, e.g., { expires: ..., signed: true }.
     * @returns {WebCookies} The current WebCookies instance for chaining.
     */
    update: function(cookieName, cookieValue, options) {
        var respObj = this.respContext;
        var reqObj = this.reqContext;
        var respHeaders = respObj.getHeader("Set-Cookie") || [];
        var isSecure = reqObj.protocol === 'https' || reqObj.connection.encrypted;
        var currentCookie = new CookieItem(cookieName, cookieValue, options);
        var isSigned = options && options.signed !== undefined ? options.signed : !!this.signingUtil;

        // Normalize response headers to an array if it's a single string.
        if (typeof respHeaders === "string") {
            respHeaders = [respHeaders];
        }

        // Prevent sending secure cookies over non-HTTPS connections unless explicitly allowed by proxy.
        if (!isSecure && options && options.secure) {
            throw new Error('Secure cookies cannot be transmitted over an insecure channel.');
        }

        currentCookie.secureFlag = isSecure;
        // Override secure flag if explicitly set in options.
        if (options && "secure" in options) currentCookie.secureFlag = options.secure;
        // Allow proxy to indicate secure connection.
        if (options && "secureProxy" in options) currentCookie.secureFlag = options.secureProxy;

        // Add the primary cookie to the header list.
        respHeaders = addOrUpdateCookie(respHeaders, currentCookie);

        // If signing is requested, create and add a signature cookie.
        if (options && isSigned) {
            if (!this.signingUtil) {
                throw new Error('A signing utility is required to set signed cookies.');
            }
            currentCookie.valueData = this.signingUtil.sign(currentCookie.toValueString());
            currentCookie.cookieIdentifier += ".sig"; // Append signature suffix.
            respHeaders = addOrUpdateCookie(respHeaders, currentCookie);
        }

        // Determine the correct method to set the 'Set-Cookie' header.
        var setRespHeaderFunc = respObj.set ? webProtocol.OutgoingMessage.prototype.setHeader : respObj.setHeader;
        setRespHeaderFunc.call(respObj, 'Set-Cookie', respHeaders); // Apply all collected headers.

        return this; // Return instance for method chaining.
    }
};

/**
 * Represents a single HTTP cookie with its properties.
 * @param {string} cookieIdentifier - The name of the cookie.
 * @param {string} valueData - The data content of the cookie.
 * @param {object} [attributes] - Additional attributes for the cookie (e.g., path, domain).
 */
function CookieItem(cookieIdentifier, valueData, attributes) {
    // If no value is provided, set expiration to past date to effectively delete it.
    valueData || (this.expirationDate = new Date(0));

    this.cookieIdentifier = cookieIdentifier;
    this.valueData = valueData || "";

    // Apply all provided attributes to the cookie instance.
    for (var attrKey in attributes) {
        this[attrKey] = attributes[attrKey];
    }
}

CookieItem.prototype = {
    // Default path for the cookie.
    cookiePath: "/",
    // Default expiration date (undefined means session cookie).
    expirationDate: undefined,
    // Default domain for the cookie.
    cookieDomain: undefined,
    // Default to HTTP-only for security.
    isHttpOnly: true,
    // Default to not secure (can be sent over HTTP).
    secureFlag: false,
    // Default to not overwrite existing cookies with the same name.
    shouldOverwrite: false,

    /**
     * Converts the cookie's name and value into a string suitable for header.
     * @returns {string} E.g., "myCookie=myValue".
     */
    toValueString: function() {
        return this.cookieIdentifier + "=" + this.valueData;
    },

    /**
     * Generates the full 'Set-Cookie' header string for this cookie.
     * @returns {string} The complete cookie header string.
     */
    toHeaderString: function() {
        var headerRepresentation = this.toValueString();

        // If maximum age is set, calculate absolute expiration date.
        if (this.maximumAge) {
            this.expirationDate = new Date(Date.now() + this.maximumAge);
        }

        // Append various attributes if they are set.
        if (this.cookiePath) {
            headerRepresentation += "; Path=" + this.cookiePath;
        }
        if (this.expirationDate) {
            headerRepresentation += "; Expires=" + this.expirationDate.toUTCString();
        }
        if (this.cookieDomain) {
            headerRepresentation += "; Domain=" + this.cookieDomain;
        }
        if (this.secureFlag) {
            headerRepresentation += "; Secure";
        }
        if (this.isHttpOnly) {
            headerRepresentation += "; HttpOnly";
        }

        return headerRepresentation;
    }
};

// Provides backward compatibility for 'maxage' property to mirror 'maximumAge'.
Object.defineProperty(CookieItem.prototype, 'maxLifetime', {
    configurable: true, // Allows the property to be redefined.
    enumerable: true,   // Allows the property to appear in enumeration of properties.
    get: function() {
        return this.maximumAge; // Getter for maxLifetime.
    },
    set: function(newValue) {
        return this.maximumAge = newValue; // Setter for maxLifetime.
    }
});

/**
 * Generates and caches a regular expression for matching a specific cookie.
 * @param {string} cookieIdentifier - The name of the cookie for which to create a pattern.
 * @returns {RegExp} A regular expression object.
 */
function retrievePattern(cookieIdentifier) {
    // Return cached pattern if available.
    if (patternStore[cookieIdentifier]) {
        return patternStore[cookieIdentifier];
    }

    // Construct and cache a new regular expression for the cookie name.
    return patternStore[cookieIdentifier] = new RegExp(
        "(?:^|;) *" +
        cookieIdentifier.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + // Escape special characters.
        "=([^;]*)"
    );
}

/**
 * Adds a new cookie header string to a list, handling overwrite logic.
 * @param {Array<string>} cookieList - An array of existing 'Set-Cookie' header strings.
 * @param {CookieItem} currentCookieItem - The cookie item to add.
 * @returns {Array<string>} The updated list of cookie header strings.
 */
function addOrUpdateCookie(cookieList, currentCookieItem) {
    if (currentCookieItem.shouldOverwrite) {
        // Filter out any existing cookies that start with the same name.
        cookieList = cookieList.filter(function(existingCookieString) {
            return existingCookieString.indexOf(currentCookieItem.cookieIdentifier + '=') !== 0;
        });
    }
    // Add the new cookie's header string to the list.
    cookieList.push(currentCookieItem.toHeaderString());
    return cookieList;
}

/**
 * Provides Express/Connect compatible middleware for cookie management.
 * @param {Array<string>|Signer} signingKeys - Keys for cryptographic signing.
 * @returns {Function} Middleware function.
 */
WebCookies.middlewareConnect = WebCookies.middlewareExpress = function(signingKeys) {
    return function(requestObject, responseObject, nextMiddleware) {
        // Attach a new WebCookies instance to both request and response objects.
        requestObject.webCookies = responseObject.webCookies = new WebCookies(requestObject, responseObject, signingKeys);
        nextMiddleware(); // Proceed to the next middleware in the stack.
    };
};

// Expose the CookieItem constructor for direct use if needed.
WebCookies.CookieItem = CookieItem;

// Export the primary WebCookies class as the module's main export.
module.exports = WebCookies;