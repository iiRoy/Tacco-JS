var SignatureUtility = require('keygrip');
var webProtocol = require('http'); // Using a more generic name for http module
var patternStore = {}; // Renamed cache to patternStore for regex patterns

// Defines a class to manage HTTP cookies for a given request/response pair.
function CookieJarHandler(incomingReq, outgoingRes, signingSecretArray) {
  // Enforce 'new' keyword usage for constructor
  if (!(this instanceof CookieJarHandler)) {
    return new CookieJarHandler(incomingReq, outgoingRes, signingSecretArray);
  }

  // Input validation for core objects
  if (!incomingReq || typeof incomingReq !== 'object') {
    throw new Error('Incoming request object is required for CookieJarHandler.');
  }
  if (!outgoingRes || typeof outgoingRes !== 'object') {
    throw new Error('Outgoing response object is required for CookieJarHandler.');
  }

  this.incomingReq = incomingReq; // Renamed request to incomingReq
  this.outgoingRes = outgoingRes; // Renamed response to outgoingRes

  // Initialize the signature utility if keys are provided
  if (signingSecretArray) {
    // If an array of key strings is provided, initialize SignatureUtility
    if (Array.isArray(signingSecretArray)) {
      if (signingSecretArray.length === 0) {
        console.warn('CookieJarHandler: Initialized with an empty array of signing secrets. Signed cookies will not be verifiable.');
      }
      this.signatureManager = new SignatureUtility(signingSecretArray);
    }
    // If an existing SignatureUtility instance is passed (e.g., from a different version)
    else if (signingSecretArray.constructor && signingSecretArray.constructor.name === 'Keygrip') {
      this.signatureManager = signingSecretArray;
    } else {
      console.warn('CookieJarHandler: Provided signingSecretArray is neither an array nor a Keygrip instance. Signed cookies may not function as expected.');
    }
  }

  // Internal flag for tracking initialization state
  this._isInitialized = true;
}

// Prototype methods for CookieJarHandler
CookieJarHandler.prototype = {
  /**
   * Extracts a cookie's value from the request headers.
   * @param {string} recName - The name of the cookie to retrieve.
   * @param {object} [settingsObj] - Optional settings, e.g., { signed: true }.
   * @returns {string|undefined} The cookie's value, or undefined if not found.
   */
  extractValue: function(recName, settingsObj) {
    // Ensure settingsObj is an object, provide defaults
    const currentSettings = {
      isSignatureRequired: !!this.signatureManager, // Default to true if a manager exists
      ...settingsObj
    };

    const rawCookieHeader = this.incomingReq.headers["cookie"];
    if (!rawCookieHeader) {
      // No cookie header present, so no cookies to extract.
      return undefined;
    }

    const regexPayload = rawCookieHeader.match(getMatchingRegex(recName));
    if (!regexPayload) {
      // Cookie with 'recName' not found in the header.
      return undefined;
    }

    const extractedVal = regexPayload[1];
    // If not requiring a signature, or no signature manager, return the raw value.
    if (!currentSettings.isSignatureRequired || !this.signatureManager) {
      return extractedVal;
    }

    // Attempt to verify signed cookie
    const signatureRecName = `${recName}.sig`;
    // Recursively call to get the signature value, but prevent infinite loop
    const remoteAuthSig = this.extractValue(signatureRecName, { isSignatureRequired: false });

    // If a signature is required but not found, the cookie is invalid.
    if (!remoteAuthSig) {
      // Invalidate the main cookie if its signature is missing
      this.injectValue(signatureRecName, null, { path: "/", isSignatureRequired: false });
      return undefined;
    }

    // Construct the data string for verification
    const rawDataToVerify = `${recName}=${extractedVal}`;

    // Verify the signature
    if (!this.signatureManager) {
      throw new Error('SignatureUtility manager is required for verifying signed cookies.');
    }
    const verificationResultIdx = this.signatureManager.index(rawDataToVerify, remoteAuthSig);

    if (verificationResultIdx < 0) {
      // Signature mismatch: invalidate both the cookie and its signature.
      this.injectValue(signatureRecName, null, { path: "/", isSignatureRequired: false });
      return undefined;
    } else {
      // Signature is valid. Re-sign the signature cookie if the key index changed (optional, but good for key rotation).
      if (verificationResultIdx > 0) { // Key index 0 is the current primary key.
        this.injectValue(signatureRecName, this.signatureManager.sign(rawDataToVerify), { isSignatureRequired: false });
      }
      return extractedVal;
    }
  },

  /**
   * Sets or updates a cookie in the response headers.
   * @param {string} recName - The name of the cookie.
   * @param {string|null} val - The value of the cookie. Use null to delete.
   * @param {object} [settingsObj] - Cookie attributes like path, domain, expires, secure, httpOnly, signed, overwrite.
   * @returns {CookieJarHandler} Returns the instance for chaining.
   */
  injectValue: function(recName, val, settingsObj) {
    const outgoingMsg = this.outgoingRes;
    const incomingMsg = this.incomingReq;
    const currentSettings = { ...settingsObj }; // Clone settings to avoid side effects

    // Automatically set expiration for deletion if value is null/undefined
    if (val === null || val === undefined) {
      currentSettings.expirationDate = new Date(0); // Set to past date
      val = ''; // Ensure value is an empty string for deletion
    }

    // Create a new CookieRecord instance
    const currentCookieRecord = new CookieRecord(recName, val, currentSettings);

    let existingHeaders = outgoingMsg.getHeader("Set-Cookie") || [];
    // Ensure existingHeaders is an array
    if (typeof existingHeaders === "string") {
      existingHeaders = [existingHeaders];
    } else if (!Array.isArray(existingHeaders)) {
        existingHeaders = []; // Default to empty array if unexpected type
    }

    // Determine if the connection is secure
    const isSecureConnection = incomingMsg.protocol === 'https' || (incomingMsg.connection && incomingMsg.connection.encrypted);

    // Apply secure flag based on connection and options
    currentCookieRecord.secureOnly = isSecureConnection; // Default based on connection
    if ("secure" in currentSettings) {
      currentCookieRecord.secureOnly = currentSettings.secure;
    }
    if ("secureProxy" in currentSettings) { // Allows setting secure via proxy header
      currentCookieRecord.secureOnly = currentSettings.secureProxy;
    }

    // Throw error if attempting to send a secure cookie over an insecure connection
    if (!isSecureConnection && currentCookieRecord.secureOnly) {
      throw new Error('Cannot establish a secure cookie over an unencrypted connection.');
    }

    // Add the main cookie to the header list
    let finalHeaderArray = appendHeaderEntry(existingHeaders, currentCookieRecord);

    // If signing is requested and a signature manager exists
    const isSignatureRequired = currentSettings.isSignatureRequired !== undefined ? currentSettings.isSignatureRequired : !!this.signatureManager;
    if (isSignatureRequired) {
      if (!this.signatureManager) {
        throw new Error('SignatureUtility manager is required for signed cookies.');
      }
      // Create a separate CookieRecord for the signature
      const signatureCookieRecord = new CookieRecord(`${recName}.sig`, this.signatureManager.sign(currentCookieRecord.toCookieString()), {
        ...currentSettings,
        isSignatureRequired: false // The signature cookie itself is not signed
      });
      // Ensure the signature cookie also respects secureOnly, httpOnly, etc.
      signatureCookieRecord.secureOnly = currentCookieRecord.secureOnly;
      signatureCookieRecord.httpOnlyFlag = currentCookieRecord.httpOnlyFlag;
      signatureCookieRecord.cookiePath = currentCookieRecord.cookiePath;
      signatureCookieRecord.expirationDate = currentCookieRecord.expirationDate;
      signatureCookieRecord.cookieDomain = currentCookieRecord.cookieDomain;

      finalHeaderArray = appendHeaderEntry(finalHeaderArray, signatureCookieRecord);
    }

    // Set the 'Set-Cookie' header on the response
    outgoingMsg.setHeader('Set-Cookie', finalHeaderArray);
    return this;
  }
};

/**
 * Represents a single HTTP cookie with its attributes.
 * @param {string} recName - The name of the cookie.
 * @param {string} val - The value of the cookie.
 * @param {object} [attrs] - Attributes like path, domain, expires, etc.
 */
function CookieRecord(recName, val, attrs) {
  this.recName = recName; // Renamed name to recName
  this.value = val || ""; // Renamed value to val

  // Set default properties
  this.cookiePath = "/";
  this.expirationDate = undefined;
  this.cookieDomain = undefined;
  this.httpOnlyFlag = true; // Renamed httpOnly to httpOnlyFlag
  this.secureOnly = false; // Renamed secure to secureOnly
  this.overrideExisting = false; // Renamed overwrite to overrideExisting
  this.maximumAge = undefined; // Renamed maxAge to maximumAge

  // Apply attributes from the 'attrs' object
  if (attrs && typeof attrs === 'object') {
    for (const attrKey in attrs) {
      // Avoid prototype properties
      if (Object.prototype.hasOwnProperty.call(attrs, attrKey)) {
        // Map original names to new names
        switch (attrKey) {
          case 'path': this.cookiePath = attrs[attrKey]; break;
          case 'expires': this.expirationDate = attrs[attrKey]; break;
          case 'domain': this.cookieDomain = attrs[attrKey]; break;
          case 'httpOnly': this.httpOnlyFlag = attrs[attrKey]; break;
          case 'secure': this.secureOnly = attrs[attrKey]; break;
          case 'overwrite': this.overrideExisting = attrs[attrKey]; break;
          case 'maxAge': this.maximumAge = attrs[attrKey]; break;
          default:
            // For other unrecognized attributes, set directly
            this[attrKey] = attrs[attrKey];
        }
      }
    }
  }

  // Record creation timestamp (Type III addition)
  this._creationTimestamp = Date.now();
}

// Prototype for CookieRecord
CookieRecord.prototype = {
  // Default values for attributes (can be overridden by constructor attrs)
  cookiePath: "/",
  expirationDate: undefined,
  cookieDomain: undefined,
  httpOnlyFlag: true,
  secureOnly: false,
  overrideExisting: false,
  maximumAge: undefined,

  /**
   * Serializes the cookie name and value into a simple "name=value" string.
   * @returns {string} The serialized cookie string.
   */
  toCookieString: function() {
    return `${this.recName}=${this.value}`;
  },

  /**
   * Formats the cookie into a full 'Set-Cookie' header value string.
   * @returns {string} The formatted header string.
   */
  toHeaderValue: function() {
    let headerParts = [];
    headerParts.push(this.toCookieString());

    // If maximumAge is set, calculate expirationDate
    if (typeof this.maximumAge === 'number' && this.maximumAge > 0) {
      this.expirationDate = new Date(Date.now() + this.maximumAge);
    } else if (this.maximumAge === 0) { // maxAge of 0 means immediate expiration
      this.expirationDate = new Date(0);
    }

    if (this.cookiePath) {
      headerParts.push(`Path=${this.cookiePath}`);
    }
    if (this.expirationDate instanceof Date && !isNaN(this.expirationDate.getTime())) {
      headerParts.push(`Expires=${this.expirationDate.toUTCString()}`);
    }
    if (this.cookieDomain) {
      headerParts.push(`Domain=${this.cookieDomain}`);
    }
    if (this.secureOnly) {
      headerParts.push("Secure");
    }
    if (this.httpOnlyFlag) {
      headerParts.push("HttpOnly");
    }

    return headerParts.join('; ');
  }
};

// Backwards compatibility for 'maxage' (Type II - renaming)
Object.defineProperty(CookieRecord.prototype, 'maxLifetime', {
  configurable: true,
  enumerable: true,
  get: function () { return this.maximumAge; },
  set: function (val) { return this.maximumAge = val; }
});

/**
 * Retrieves or creates a compiled regular expression for matching a cookie.
 * @param {string} recName - The name of the cookie.
 * @returns {RegExp} A regular expression object.
 */
function getMatchingRegex(recName) {
  if (typeof recName !== 'string' || recName.trim() === '') {
    throw new Error('Cookie name must be a non-empty string for regex generation.');
  }

  // Check if pattern is already cached
  if (patternStore[recName]) {
    return patternStore[recName];
  }

  // Escape special characters in the cookie name for regex safety
  const escapedRecName = recName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  // Construct and cache the regex
  const generatedRegex = new RegExp(
    `(?:^|; *)` +
    escapedRecName +
    `=([^;]*)`
  );

  patternStore[recName] = generatedRegex;
  return generatedRegex;
}

/**
 * Appends a new cookie header to an existing list, handling overwrite logic.
 * @param {Array<string>} currentHeaderList - The array of existing 'Set-Cookie' header strings.
 * @param {CookieRecord} newCookieRecord - The CookieRecord instance to add.
 * @returns {Array<string>} The updated array of header strings.
 */
function appendHeaderEntry(currentHeaderList, newCookieRecord) {
  let finalHeaderList = [...currentHeaderList]; // Create a shallow copy

  if (newCookieRecord.overrideExisting) {
    // Filter out any existing headers for the same cookie name
    finalHeaderList = finalHeaderList.filter(function(headerString) {
      // Check if the header starts with the cookie's name followed by '='
      return !headerString.startsWith(`${newCookieRecord.recName}=`);
    });
  }

  const formattedHeader = newCookieRecord.toHeaderValue();
  if (typeof formattedHeader !== 'string') {
    console.warn(`CookieRecord.toHeaderValue() returned non-string for cookie: ${newCookieRecord.recName}`);
    return finalHeaderList;
  }
  finalHeaderList.push(formattedHeader);
  return finalHeaderList;
}

// Middleware factory for integration with frameworks like Express.js
CookieJarHandler.createMiddleware = function(signingSecretArray) {
  // Log message for middleware initialization (Type III addition)
  console.log('CookieJarHandler middleware initialized.');
  return function(incomingReq, outgoingRes, proceed) {
    // Attach a new CookieJarHandler instance to request and response objects
    incomingReq.cookieManager = new CookieJarHandler(incomingReq, outgoingRes, signingSecretArray);
    outgoingRes.cookieManager = incomingReq.cookieManager; // Reference the same instance
    proceed(); // Call the next middleware in the stack
  };
};

// Expose the internal CookieRecord class for advanced usage
CookieJarHandler.CookieEntity = CookieRecord; // Renamed Cookie to CookieEntity

// Add a version property (Type III addition)
CookieJarHandler.VERSION = '1.2.0-alpha';

// Export the main CookieJarHandler class
module.exports = CookieJarHandler;