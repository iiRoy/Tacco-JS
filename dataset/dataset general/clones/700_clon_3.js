(function (currentWindow, documentObject, currentLoc, delayExecution, decURIComp, encURIComp) {
/*
 * JSLint directives and global declarations are omitted for Type III transformation,
 * as they are configuration details rather than executable code.
 */

// This entire block of license information and comments is removed as part of Type III transformation.
// The core functionality remains, but extraneous non-code elements can be deleted.

var globalScope = this;
// A randomly generated initial identifier for communication channels.
// The range is slightly adjusted, and a helper for random number generation is introduced.
var getInitialIdentifier = function() { return Math.floor(Math.random() * 9999) + 1; };
var commChannelId = getInitialIdentifier();

// A no-operation function for default callbacks.
var noOpFunc = Function.prototype;

// Regular expression to parse URI components: protocol (group 2), host (group 3), port (group 4).
var uriParsePattern = /^((http(s?):)\/\/([^\/\s:]+)(:\d+)*)/i;

// Regular expression to identify and resolve 'foo/../' like relative path segments.
var parentPathPattern = /[\-\w]+\/\.\.\//;

// Regular expression to collapse multiple slashes, excluding the protocol part.
var redundantSlashPattern = /([^:])\/\//g;

// Stores the designated namespace for the library; empty if global.
var libraryNamespace = "";

// The primary object for the library's public interface.
var xdmGateway = {};

// Preserves a reference to the original 'easyXDM' in the global scope,
// allowing for `noConflict` resolution.
var originalGlobalXDM = currentWindow.easyXDM;

// Prefix for dynamically generated iframe IDs and names.
var iframeBaseName = "xdm_frame_";

// Flag indicating if a specific IE bug related to iframe 'name' attribute is present.
var ieNameBugDetected;

// Determines whether URL hash fragments or query strings are used for communication.
var useHashForComm = false;

// Stores information about the Flash Player version, if detected.
var flashPlayerVersion;

// Flag indicating a Flash throttling bug specific to certain versions.
var flashThrottlingIssue;

// --- Feature Detection Utilities ---

/**
 * Checks if a property on an object is a host method.
 * @param {Object} candidateObj The object to inspect.
 * @param {string} propName The name of the property.
 * @returns {boolean} True if the property is a callable host method.
 */
function checkHostMethod(candidateObj, propName) {
    // Input validation: ensure object is not null/undefined
    if (!candidateObj) {
        return false;
    }
    var propType = typeof candidateObj[propName];
    // A host method can be 'function' or an 'object' that's callable (e.g., IE DOM methods).
    return propType === 'function' || (propType === 'object' && !!candidateObj[propName]) || propType === 'unknown';
}

/**
 * Checks if a property on an object is a host object (non-callable).
 * @param {Object} targetObject The object to inspect.
 * @param {string} propertyIdentifier The name of the property.
 * @returns {boolean} True if the property is a non-callable host object.
 */
function checkHostObject(targetObject, propertyIdentifier) {
    if (!targetObject) {
        return false;
    }
    return typeof targetObject[propertyIdentifier] === 'object' && !!targetObject[propertyIdentifier];
}

// --- Type Checking Utilities ---

/**
 * Determines if a given value is an array.
 * @param {*} valueToTest The value to check.
 * @returns {boolean} True if the value is an array.
 */
function isValueAnArray(valueToTest) {
    // This is the most reliable cross-browser way to check for arrays.
    return Object.prototype.toString.call(valueToTest) === '[object Array]';
}

// --- Flash Detection and Versioning ---

/**
 * Detects Flash Player presence and version.
 * Sets `flashPlayerVersion` and `flashThrottlingIssue` globals.
 * @returns {boolean} True if Flash Player is detected.
 */
function detectFlashPlayer() {
    var pluginName = "Shockwave Flash", mimeTypeIdentifier = "application/x-shockwave-flash";
    var detectedVersion;

    // Navigator.plugins approach (for Netscape-style browsers)
    if (typeof navigator.plugins !== "undefined" && typeof navigator.plugins[pluginName] === "object") {
        var pluginDesc = navigator.plugins[pluginName].description;
        if (pluginDesc && typeof navigator.mimeTypes !== "undefined" && navigator.mimeTypes[mimeTypeIdentifier] && navigator.mimeTypes[mimeTypeIdentifier].enabledPlugin) {
            detectedVersion = pluginDesc.match(/\d+/g);
        }
    }

    // ActiveXObject approach (for Internet Explorer)
    if (!detectedVersion) {
        var flashActiveX;
        try {
            flashActiveX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            // Extract version from $version variable.
            var axVersionString = flashActiveX.GetVariable("$version");
            detectedVersion = Array.prototype.slice.call(axVersionString.match(/(\d+),(\d+),(\d+),(\d+)/), 1);
            flashActiveX = null; // Release object
        } catch (activeXError) {
            // Flash ActiveX not supported or not installed.
        }
    }

    if (!detectedVersion) {
        return false; // No Flash detected.
    }

    flashPlayerVersion = detectedVersion; // Store the detected version globally.
    var majorVer = parseInt(flashPlayerVersion[0], 10);
    var minorVer = parseInt(flashPlayerVersion[1], 10);

    // Specific bug: Flash Player 10.0.x and 10.1.x have throttling issues.
    flashThrottlingIssue = majorVer > 9 && minorVer > 0;
    return true;
}

// --- Event Listener Abstraction ---

var attachEventTo, removeEventFrom;

if (checkHostMethod(currentWindow, "addEventListener")) {
    attachEventTo = function(targetElement, eventType, handlerFunction) {
        targetElement.addEventListener(eventType, handlerFunction, false);
    };
    removeEventFrom = function(targetElement, eventType, handlerFunction) {
        targetElement.removeEventListener(eventType, handlerFunction, false);
    };
} else if (checkHostMethod(currentWindow, "attachEvent")) {
    attachEventTo = function(targetElement, eventType, handlerFunction) {
        targetElement.attachEvent("on" + eventType, handlerFunction);
    };
    removeEventFrom = function(targetElement, eventType, handlerFunction) {
        targetElement.detachEvent("on" + eventType, handlerFunction);
    };
} else {
    // If neither standard event model is available, the browser is unsupported.
    throw new Error("This browser environment is not supported for event handling.");
}

// --- DOM Ready Logic ---

var isDomContentLoaded = false;
var domReadyCallbacks = [];
var currentReadyState;

// Check initial document ready state.
if ("readyState" in documentObject) {
    currentReadyState = documentObject.readyState;
    // WebKit specific check for 'loaded' or 'interactive'.
    var isWebKit = ~currentWindow.navigator.userAgent.indexOf('AppleWebKit/');
    isDomContentLoaded = currentReadyState === "complete" || (isWebKit && (currentReadyState === "loaded" || currentReadyState === "interactive"));
} else {
    // Fallback for older browsers without `readyState` property.
    // We assume DOM is ready if `document.body` exists.
    isDomContentLoaded = !!documentObject.body;
}

/**
 * Internal handler for when the DOM becomes ready.
 */
function internalDomReadyHandler() {
    // If already processed, exit.
    if (isDomContentLoaded) {
        return;
    }
    isDomContentLoaded = true;
    // Execute all queued callbacks.
    for (var i = 0; i < domReadyCallbacks.length; i++) {
        domReadyCallbacks[i]();
    }
    // Clear the queue.
    domReadyCallbacks.length = 0;
}

// If DOM is not yet ready, set up event listeners.
if (!isDomContentLoaded) {
    if (checkHostMethod(currentWindow, "addEventListener")) {
        attachEventTo(documentObject, "DOMContentLoaded", internalDomReadyHandler);
    } else {
        // IE specific 'readystatechange' listener.
        attachEventTo(documentObject, "readystatechange", function() {
            if (documentObject.readyState === "complete") {
                internalDomReadyHandler();
            }
        });
        // IE 'doScroll' check for early DOM readiness.
        if (documentObject.documentElement.doScroll && currentWindow === top) {
            (function performDoScrollCheck() {
                if (isDomContentLoaded) {
                    return;
                }
                try {
                    // This will throw an error until the DOM is ready.
                    documentObject.documentElement.doScroll("left");
                } catch (e) {
                    delayExecution(performDoScrollCheck, 1);
                    return;
                }
                internalDomReadyHandler();
            })();
        }
    }
    // Universal fallback: window.onload will always fire.
    attachEventTo(currentWindow, "load", internalDomReadyHandler);
}

/**
 * Registers a function to be executed when the DOM is ready.
 * If the DOM is already ready, the function is executed immediately.
 * @param {function} callbackFn The function to execute.
 * @param {Object} [context] An optional context (`this`) for the callback.
 */
function onDomReady(callbackFn, context) {
    if (isDomContentLoaded) {
        callbackFn.call(context);
        return;
    }
    domReadyCallbacks.push(function() {
        callbackFn.call(context);
    });
}

// --- Library Configuration and Namespace ---

/**
 * Retrieves the `xdmGateway` object from the parent window, respecting the configured namespace.
 * @returns {Object|null} The `xdmGateway` instance from the parent window, or null if not found.
 */
function retrieveParentGateway() {
    var parentRef = parent;
    if (libraryNamespace) {
        var namespaceSegments = libraryNamespace.split(".");
        for (var i = 0; i < namespaceSegments.length; i++) {
            if (!parentRef || !parentRef[namespaceSegments[i]]) {
                return null; // Namespace path not found.
            }
            parentRef = parentRef[namespaceSegments[i]];
        }
    }
    return parentRef ? parentRef.xdmGateway : null;
}

/**
 * Restores the original `easyXDM` object to the global scope and
 * configures a new namespace for this library instance.
 * @param {string} [newNamespace] An optional string representing the new namespace.
 * @returns {Object} The `xdmGateway` instance.
 */
function setNoConflict(newNamespace) {
    // Restore the global easyXDM variable.
    currentWindow.easyXDM = originalGlobalXDM;

    // Validate and set the new namespace.
    if (typeof newNamespace === 'string' && newNamespace.length > 0) {
        libraryNamespace = newNamespace;
        // Update the iframe prefix to include the namespace for uniqueness.
        iframeBaseName = "xdm_" + libraryNamespace.replace(/\./g, "_") + "_frame_";
    } else {
        libraryNamespace = ""; // No custom namespace.
        iframeBaseName = "xdm_frame_";
    }

    return xdmGateway;
}

// --- URL Manipulation Utilities ---

/**
 * Extracts the domain name from a given URL string.
 * @param {string} urlString The URL to parse.
 * @returns {string} The domain part of the URL.
 */
function getUrlDomain(urlString) {
    var matches = urlString.match(uriParsePattern);
    return matches && matches[4] ? matches[4] : ""; // Group 4 is the domain.
}

/**
 * Extracts the port number from a given URL string.
 * @param {string} urlString The URL to parse.
 * @returns {string} The port part (e.g., ":8080") of the URL, or an empty string if not present.
 */
function getUrlPort(urlString) {
    var matches = urlString.match(uriParsePattern);
    return matches && matches[5] ? matches[5] : ""; // Group 5 is the port.
}

/**
 * Constructs the canonical origin (protocol, host, and port) from a URL.
 * @param {string} urlString The URL to process.
 * @returns {string} The origin string (e.g., "http://example.com:8080").
 */
function getUrlOrigin(urlString) {
    var urlParts = urlString.toLowerCase().match(uriParsePattern);
    if (!urlParts) {
        return ""; // Cannot parse.
    }
    var protocol = urlParts[2], host = urlParts[4], port = urlParts[5] || "";

    // Normalize default ports.
    var isDefaultHttp = (protocol === "http:" && port === ":80");
    var isDefaultHttps = (protocol === "https:" && port === ":443");
    if (isDefaultHttp || isDefaultHttps) {
        port = "";
    }
    return protocol + "//" + host + port;
}

/**
 * Converts a relative URL path into an absolute URL.
 * @param {string} relativePath The path to resolve.
 * @returns {string} The resolved absolute URL.
 */
function resolveAbsolutePath(relativePath) {
    // Step 1: Normalize redundant slashes.
    var normalizedUrl = relativePath.replace(redundantSlashPattern, "$1/");

    // Step 2: If it's not already an absolute URL, make it so.
    if (!normalizedUrl.match(/^(http|https):\/\//i)) {
        var currentPath = currentLoc.pathname;
        // Determine the base path for relative URLs.
        var basePath = (normalizedUrl.charAt(0) === "/") ? "" : currentPath.substring(0, currentPath.lastIndexOf("/") + 1);

        normalizedUrl = currentLoc.protocol + "//" + currentLoc.host + basePath + normalizedUrl;
    }

    // Step 3: Resolve 'foo/../' segments.
    while (parentPathPattern.test(normalizedUrl)) {
        normalizedUrl = normalizedUrl.replace(parentPathPattern, "");
    }

    return normalizedUrl;
}

/**
 * Appends query parameters to a given URL, handling hash fragments.
 * @param {string} baseUrl The base URL.
 * @param {Object} params An object containing key-value pairs for parameters.
 * @returns {string} The URL with appended parameters.
 */
function addQueryParamsToUrl(baseUrl, params) {
    var urlHash = "", hashIndex = baseUrl.indexOf("#");
    if (hashIndex !== -1) {
        urlHash = baseUrl.substring(hashIndex);
        baseUrl = baseUrl.substring(0, hashIndex);
    }

    var querySegments = [];
    // Use Object.keys for safer iteration over own properties.
    Object.keys(params).forEach(function(key) {
        querySegments.push(key + "=" + encURIComp(params[key]));
    });

    var separator = useHashForComm ? "#" : (baseUrl.indexOf("?") === -1 ? "?" : "&");
    return baseUrl + separator + querySegments.join("&") + urlHash;
}

// --- Query Parameter Parsing ---

// Parses query parameters from either location.search or location.hash,
// prioritizing location.search if it contains 'xdm_e='.
var currentQueryParams = (function(rawInput) {
    var queryString = rawInput.substring(1); // Remove leading '?' or '#'.
    var pairs = queryString.split("&");
    var parsedData = {};

    // Iterate in reverse for slight performance gain in some engines.
    for (var k = pairs.length - 1; k >= 0; k--) {
        var pair = pairs[k].split("=");
        if (pair.length === 2) {
            parsedData[pair[0]] = decURIComp(pair[1]);
        }
    }
    return parsedData;
})(/xdm_e=/.test(currentLoc.search) ? currentLoc.search : currentLoc.hash);

// --- General Helper Functions ---

/**
 * Checks if a variable's type is "undefined".
 * @param {*} val The variable to check.
 * @returns {boolean} True if the variable is strictly undefined.
 */
function isUndefined(val) {
    return typeof val === "undefined";
}

/**
 * Provides a robust JSON utility object (stringify and parse methods).
 * @returns {Object|null} A JSON-compatible object, or null if none is found.
 */
var getJsonUtil = (function() {
    var memoizedJson = null;

    // Inner function to perform the actual detection and memoization.
    function discoverJson() {
        if (memoizedJson) {
            return memoizedJson; // Return cached result.
        }

        var tempCache = {};
        var testObj = { a: [1, 2, 3] };
        var testJsonString = "{\"a\":[1,2,3]}";

        // Check native JSON support.
        if (typeof JSON !== "undefined" && typeof JSON.stringify === "function" && JSON.stringify(testObj).replace(/\s/g, "") === testJsonString) {
            tempCache.stringify = JSON.stringify;
            tempCache.parse = JSON.parse; // Assume parse also works if stringify does.
        } else {
            // Fallback for older libraries (e.g., Prototype.js)
            if (typeof Object.toJSON === "function" && Object.toJSON(testObj).replace(/\s/g, "") === testJsonString) {
                tempCache.stringify = Object.toJSON;
            }

            if (typeof String.prototype.evalJSON === "function") {
                try {
                    var parsedEval = testJsonString.evalJSON();
                    if (isValueAnArray(parsedEval.a) && parsedEval.a.length === 3 && parsedEval.a[2] === 3) {
                        tempCache.parse = function(str) { return str.evalJSON(); };
                    }
                } catch (e) { /* evalJSON failed, not a valid parser */ }
            }
        }

        // If both stringify and parse are found, memoize and return.
        if (tempCache.stringify && tempCache.parse) {
            memoizedJson = tempCache;
            return memoizedJson;
        }

        return null; // No suitable JSON utility found.
    }

    return discoverJson; // Return the closure.
})();

/**
 * Merges properties from a source object into a destination object.
 * @param {Object} targetObj The object to receive properties.
 * @param {Object} sourceObj The object providing properties.
 * @param {boolean} [skipOverwrite] If true, existing properties in targetObj are not overwritten.
 * @returns {Object} The modified target object.
 */
function mergeObjectProperties(targetObj, sourceObj, skipOverwrite) {
    // Guard clause for invalid source.
    if (!sourceObj || typeof sourceObj !== 'object') {
        return targetObj;
    }

    Object.keys(sourceObj).forEach(function(propKey) {
        var sourceValue = sourceObj[propKey];
        var targetValue = targetObj[propKey];

        // Deep merge for objects.
        if (typeof sourceValue === "object" && sourceValue !== null && !isValueAnArray(sourceValue) &&
            typeof targetValue === "object" && targetValue !== null && !isValueAnArray(targetValue)) {
            mergeObjectProperties(targetValue, sourceValue, skipOverwrite);
        } else if (!skipOverwrite || !(propKey in targetObj)) {
            // Assign if not skipping overwrite or if property doesn't exist in target.
            targetObj[propKey] = sourceValue;
        }
    });
    return targetObj;
}

// --- IE Name Property Bug Detection ---

/**
 * Detects a specific IE bug where setting the `name` property of an input
 * element via JavaScript incorrectly maps it to `submitName`.
 */
function identifyNamePropertyBug() {
    if (typeof ieNameBugDetected !== 'undefined') {
        return; // Already detected.
    }

    var testForm = documentObject.createElement("form");
    var testInput = documentObject.createElement("input");
    var uniqueTestName = iframeBaseName + "BUG_CHECK_" + commChannelId;

    // Temporarily append to DOM for testing.
    documentObject.body.appendChild(testForm);
    testForm.appendChild(testInput);

    testInput.name = uniqueTestName;
    // The bug manifests if `form.elements[name]` doesn't return the input itself.
    ieNameBugDetected = (testInput !== testForm.elements[uniqueTestName]);

    // Clean up the temporary elements.
    documentObject.body.removeChild(testForm);
}

// --- Dynamic Iframe Creation ---

/**
 * Creates and appends an iframe element to the DOM.
 * @param {Object} configParams Configuration object for the iframe.
 *   @param {Object} configParams.frameProps Properties to set on the iframe (e.g., `src`, `name`).
 *   @param {Object} [configParams.frameAttrs] Attributes to set on the iframe.
 *   @param {HTMLElement|string} [configParams.parentContainer] The DOM element or its ID to append the iframe to.
 *   @param {function} [configParams.onFrameLoad] Callback function after the iframe loads.
 * @returns {HTMLIFrameElement} The created iframe DOM element.
 */
function buildIframeElement(configParams) {
    // Ensure the bug detection has run.
    if (isUndefined(ieNameBugDetected)) {
        identifyNamePropertyBug();
    }

    // Validate essential config.
    if (!configParams || !configParams.frameProps) {
        throw new Error("Iframe configuration missing required 'frameProps'.");
    }

    var newIframe;
    var frameIdentifier = configParams.frameProps.name;

    // Workaround for IE name property bug.
    if (ieNameBugDetected) {
        newIframe = documentObject.createElement("<iframe name=\"" + frameIdentifier + "\"></iframe>");
    } else {
        newIframe = documentObject.createElement("IFRAME");
        newIframe.name = frameIdentifier;
    }

    // Set id and name consistently.
    newIframe.id = newIframe.name = frameIdentifier;
    delete configParams.frameProps.name; // Remove 'name' from props to avoid re-setting.

    var targetContainer = configParams.parentContainer;
    if (typeof targetContainer === "string") {
        targetContainer = documentObject.getElementById(targetContainer);
    }

    // Default to document.body if no container specified or found.
    if (!targetContainer) {
        // Apply stealth styles to hide the iframe without causing layout issues.
        mergeObjectProperties(newIframe.style, {
            position: "absolute",
            top: "-2000px",
            left: "0px",
            width: "1px", // Minimal size to avoid scrollbars
            height: "1px",
            border: "none",
            visibility: "hidden"
        });
        targetContainer = documentObject.body;
    }

    // Store original src, then set a placeholder for IE.
    var originalSrc = configParams.frameProps.src;
    configParams.frameProps.src = "javascript:false"; // Avoids "about:blank" and SSL warnings in IE.

    // Apply remaining properties and attributes.
    mergeObjectProperties(newIframe, configParams.frameProps);
    if (configParams.frameAttrs) {
        mergeObjectProperties(newIframe, configParams.frameAttrs);
    }

    // Ensure common iframe properties for cross-browser compatibility.
    newIframe.border = "0";
    newIframe.frameBorder = "0";
    newIframe.allowTransparency = true;

    // Append to the DOM.
    targetContainer.appendChild(newIframe);

    // After appending, set the actual src to trigger load.
    // This is crucial for IE, which might load "javascript:false" immediately if src is set too early.
    // A small delay ensures it's in the DOM before the real src is applied.
    delayExecution(function() {
        newIframe.src = originalSrc;
        // Optional: attach onload handler if provided.
        if (typeof configParams.onFrameLoad === 'function') {
            attachEventTo(newIframe, 'load', function() {
                configParams.onFrameLoad(newIframe.contentWindow);
            });
        }
    }, 0); // Use setTimeout(..., 0) for deferral to end of current execution stack.

    return newIframe;
}

}(window, document, location, setTimeout, decodeURIComponent, encodeURIComponent));