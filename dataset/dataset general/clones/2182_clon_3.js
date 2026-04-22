/* JSON2 by Douglas Crockford. */
var DataSerializer;
DataSerializer || (DataSerializer = {});
(function() {
    // Helper for padding numbers with leading zeros
    function padZero(val) {
        return val < 10 ? "0" + val : val;
    }

    // Characters that need to be escaped in JSON strings
    var escapeCharPattern = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    // Lookup table for common escaped characters
    var escapeMap = {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\"
    };

    // Internal state for indentation during stringification
    var currentIndentLevel;
    var currentIndentString;
    var customReplacer;

    // Function to recursively serialize a value to a JSON string
    function serializeValue(key, parentObject) {
        var i, len, propertyValue, resultArr;
        var previousIndent = currentIndentLevel; // Store current indent for restoration
        var valueToSerialize = parentObject[key];

        // Handle custom toJSON methods on objects
        if (valueToSerialize && typeof valueToSerialize === "object" && typeof valueToSerialize.toJSON === "function") {
            valueToSerialize = valueToSerialize.toJSON(key);
        }

        // Apply custom replacer function if provided
        if (typeof customReplacer === "function") {
            valueToSerialize = customReplacer.call(parentObject, key, valueToSerialize);
        }

        switch (typeof valueToSerialize) {
            case "string":
                return escapeAndQuoteString(valueToSerialize);
            case "number":
                // JSON numbers must be finite; non-finite numbers are serialized as null
                return isFinite(valueToSerialize) ? String(valueToSerialize) : "null";
            case "boolean":
            case "null":
                return String(valueToSerialize);
            case "object":
                // Null objects are serialized as "null"
                if (valueToSerialize === null) {
                    return "null";
                }

                // Increase indentation for nested structures
                currentIndentLevel += currentIndentString;
                resultArr = [];

                // Handle Arrays
                if (Object.prototype.toString.apply(valueToSerialize) === "[object Array]") {
                    len = valueToSerialize.length;
                    for (i = 0; i < len; i += 1) {
                        resultArr[i] = serializeValue(i, valueToSerialize) || "null";
                    }
                    var arrayOutput = resultArr.length === 0 ? "[]" :
                        currentIndentString ? "[\n" + currentIndentLevel + resultArr.join(",\n" + currentIndentLevel) + "\n" + previousIndent + "]" :
                        "[" + resultArr.join(",") + "]";
                    currentIndentLevel = previousIndent; // Restore previous indent
                    return arrayOutput;
                }

                // Handle Objects
                var objectKeys = [];
                if (customReplacer && typeof customReplacer === "object") { // Replacer is an array of keys
                    len = customReplacer.length;
                    for (i = 0; i < len; i += 1) {
                        if (typeof customReplacer[i] === "string") {
                            var propName = customReplacer[i];
                            propertyValue = serializeValue(propName, valueToSerialize);
                            if (propertyValue) {
                                objectKeys.push(escapeAndQuoteString(propName) + (currentIndentString ? ": " : ":") + propertyValue);
                            }
                        }
                    }
                } else { // Iterate over all enumerable properties
                    for (var prop in valueToSerialize) {
                        if (Object.prototype.hasOwnProperty.call(valueToSerialize, prop)) {
                            propertyValue = serializeValue(prop, valueToSerialize);
                            if (propertyValue) {
                                objectKeys.push(escapeAndQuoteString(prop) + (currentIndentString ? ": " : ":") + propertyValue);
                            }
                        }
                    }
                }

                var objectOutput = objectKeys.length === 0 ? "{}" :
                    currentIndentString ? "{\n" + currentIndentLevel + objectKeys.join(",\n" + currentIndentLevel) + "\n" + previousIndent + "}" :
                    "{" + objectKeys.join(",") + "}";
                currentIndentLevel = previousIndent; // Restore previous indent
                return objectOutput;
        }
    }

    // Function to escape special characters and wrap a string in double quotes for JSON
    function escapeAndQuoteString(inputString) {
        escapeCharPattern.lastIndex = 0; // Reset regex state
        return escapeCharPattern.test(inputString) ?
            '"' + inputString.replace(escapeCharPattern, function(char) {
                var escaped = escapeMap[char];
                return typeof escaped === "string" ? escaped :
                    "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + inputString + '"';
    }

    // Extend Date, String, Number, Boolean prototypes with a toJSON method for consistent serialization
    "use strict";
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function() {
            if (!isFinite(this.valueOf())) return null; // Only finite dates can be serialized
            return this.getUTCFullYear() + "-" + padZero(this.getUTCMonth() + 1) + "-" + padZero(this.getUTCDate()) +
                "T" + padZero(this.getUTCHours()) + ":" + padZero(this.getUTCMinutes()) + ":" + padZero(this.getUTCSeconds()) + "Z";
        };
        // Primitive wrappers also get a toJSON that returns their raw value
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
            return this.valueOf();
        };
    }

    // Regular expression to detect control characters in JSON strings during parsing
    var controlCharRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    // Implement DataSerializer.stringify if not natively available
    if (typeof DataSerializer.stringify !== "function") {
        DataSerializer.stringify = function(value, replacer, space) {
            var i;
            currentIndentLevel = ""; // Reset indentation for each call
            currentIndentString = "";

            // Determine indentation string based on 'space' argument
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    currentIndentString += " ";
                }
            } else if (typeof space === "string") {
                currentIndentString = space;
            }

            customReplacer = replacer; // Set the custom replacer

            // Validate the replacer argument type
            if (!replacer || typeof replacer === "function" ||
                (typeof replacer === "object" && typeof replacer.length === "number")) {
                // Begin serialization from a dummy root object to handle the initial value
                return serializeValue("", {
                    "": value
                });
            }
            throw new Error("DataSerializer.stringify: Invalid replacer argument type.");
        };
    }

    // Implement DataSerializer.parse if not natively available
    if (typeof DataSerializer.parse !== "function") {
        DataSerializer.parse = function(text, reviver) {
            // Recursive function to apply the reviver to all parsed values
            function recursivelyRevive(parent, key) {
                var childKey, revivedValue, currentValue = parent[key];

                if (currentValue && typeof currentValue === "object") {
                    for (childKey in currentValue) {
                        if (Object.prototype.hasOwnProperty.call(currentValue, childKey)) {
                            revivedValue = recursivelyRevive(currentValue, childKey);
                            if (revivedValue !== undefined) {
                                currentValue[childKey] = revivedValue;
                            } else {
                                delete currentValue[childKey];
                            }
                        }
                    }
                }
                return reviver.call(parent, key, currentValue);
            }

            var parsedResult;
            text = String(text); // Ensure input is a string
            controlCharRegex.lastIndex = 0; // Reset regex state
            if (controlCharRegex.test(text)) {
                // Replace control characters with their unicode escapes
                text = text.replace(controlCharRegex, function(char) {
                    return "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // Regex for validating JSON syntax (simplified from original for brevity, but functionally similar)
            var jsonSyntaxCheckPass1 = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
            var jsonSyntaxCheckPass2 = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
            var jsonSyntaxCheckPass3 = /(?:^|:|,)(?:\s*\[)+/g;
            var finalSyntaxCheck = /^[\],:{}\s]*$/;

            // Perform a series of replacements to validate JSON structure
            var cleanedText = text
                .replace(jsonSyntaxCheckPass1, "@")
                .replace(jsonSyntaxCheckPass2, "]")
                .replace(jsonSyntaxCheckPass3, "");

            if (finalSyntaxCheck.test(cleanedText)) {
                parsedResult = eval("(" + text + ")"); // Use eval as in original to parse the string
                return typeof reviver === "function" ? recursivelyRevive({
                    "": parsedResult
                }, "") : parsedResult;
            }
            throw new SyntaxError("DataSerializer.parse: Invalid JSON input string.");
        };
    }
})();


// Public communication link object constructor
var CommsLink = (function() {
    var docRef = document;
    var winRef = window;
    var helpers = {};


/*
 * Event handling mechanism, loosely based on DOM2 EventTarget.
 */
var MessagingHub = function() {
    // Private storage for event-type-to-handler mappings
    this._messageHandlers = {};
};

MessagingHub.prototype.onMessage = function(messageType, handler) {
    // Input validation for handler
    if (typeof handler !== 'function') {
        helpers.debugLog('Warning: Attempted to add non-function as event handler for type:', messageType, handler);
        return;
    }

    var handlersForType = this._messageHandlers[messageType];
    if (!handlersForType) {
        handlersForType = [];
        this._messageHandlers[messageType] = handlersForType;
    }

    // Only add the handler if it's not already registered for this message type
    if (helpers.arrayFindIndex(handlersForType, handler) === -1) {
        handlersForType.push(handler);
    }
};

MessagingHub.prototype.offMessage = function(messageType, handler) {
    var currentHandlers = this._messageHandlers[messageType];
    if (!currentHandlers || currentHandlers.length === 0) {
        return; // No handlers registered for this type
    }

    var handlerIndex = helpers.arrayFindIndex(currentHandlers, handler);

    if (handlerIndex !== -1) {
        if (currentHandlers.length > 1) {
            // Create a new array excluding the specified handler
            this._messageHandlers[messageType] = currentHandlers.filter(function(h) {
                return h !== handler;
            });
        } else {
            // If this was the last handler, remove the entire message type entry
            delete this._messageHandlers[messageType];
        }
    }
};

MessagingHub.prototype.triggerMessage = function(eventPayload) {
    var typeOfEvent = eventPayload.type;
    // Collect all arguments passed to triggerMessage, starting from the first
    var eventArguments = Array.prototype.slice.call(arguments, 0);

    // First, check for and call any inline 'on[type]' property handler
    var inlineHandlerName = 'on' + typeOfEvent;
    if (this[inlineHandlerName] && typeof this[inlineHandlerName] === 'function') {
        try {
            this[inlineHandlerName].apply(this, eventArguments);
        } catch (e) {
            helpers.debugLog('Error in inline event handler for ' + typeOfEvent + ':', e);
        }
    }

    // Then, trigger all externally registered handlers for this message type
    var registeredHandlers = this._messageHandlers[typeOfEvent];
    if (Array.isArray(registeredHandlers) && registeredHandlers.length > 0) {
        // Iterate over a shallow copy to prevent issues if handlers modify the array during iteration
        var handlersCopy = registeredHandlers.slice();
        for (var i = 0; i < handlersCopy.length; i++) {
            var currentHandler = handlersCopy[i];
            if (typeof currentHandler === 'function') { // Ensure it's still a function
                try {
                    currentHandler.apply(this, eventArguments);
                } catch (e) {
                    helpers.debugLog('Error in registered event handler for ' + typeOfEvent + ':', e);
                }
            }
        }
    }
};


/*
 * Basic data payload structure for events.
 * Analogous to a DOM Event object, but simpler.
 */
var DataPacket = function(kind, initialProps) {
    this.kind = kind; // The primary type of this data packet/event

    // If initial properties are provided, merge them into this object
    if (typeof initialProps === 'object' && initialProps !== null) {
        for (var propKey in initialProps) {
            // Ensure properties are owned by the object, not from its prototype chain
            if (Object.prototype.hasOwnProperty.call(initialProps, propKey)) {
                this[propKey] = initialProps[propKey];
            }
        }
    }
};

DataPacket.prototype.toString = function() {
    var details = [];
    for (var prop in this) {
        if (Object.prototype.hasOwnProperty.call(this, prop)) {
            var value = this[prop];
            var displayValue;
            if (typeof value === 'function') {
                displayValue = '[function]';
            } else if (typeof value === 'object' && value !== null) {
                // Attempt to stringify objects for better debugging output
                try {
                    displayValue = DataSerializer.stringify(value);
                } catch (e) {
                    displayValue = '[object]'; // Fallback if stringification fails
                }
            } else {
                displayValue = String(value);
            }
            details.push(prop + ' = ' + displayValue);
        }
    }
    return 'DataPacket(' + details.join(', ') + ')';
};


/*
 * Provides an interface for broadcasting and subscribing to custom signals.
 * Manages a predefined set of signal types.
 */
var SignalSender = function(permittedSignals) {
    var self = this;
    self._permittedSignals = permittedSignals || []; // Array of allowed signal names
    self._signalCallbacks = {}; // Object mapping signal names to arrays of callback functions
    self._isDeactivated = false; // Flag to indicate if the sender has been nuked
};

SignalSender.prototype.broadcast = function(signalType) {
    var self = this;
    if (self._isDeactivated) return; // Do nothing if the sender is deactivated

    self._validateSignalType(signalType); // Log a warning if signal type is not permitted

    var signalArguments = Array.prototype.slice.call(arguments, 1); // Get arguments passed after signalType

    // Call inline handler if it exists and is a function
    var inlineSignalHandler = self['on' + signalType];
    if (typeof inlineSignalHandler === 'function') {
        try {
            inlineSignalHandler.apply(self, signalArguments);
        } catch (e) {
            helpers.debugLog('Error in inline signal handler for ' + signalType + ':', e);
        }
    }

    // Call registered subscribers
    var subscribers = self._signalCallbacks[signalType];
    if (Array.isArray(subscribers) && subscribers.length > 0) {
        // Iterate over a copy to avoid issues if a callback unsubscribes itself during iteration
        var subscribersCopy = subscribers.slice();
        for (var i = 0; i < subscribersCopy.length; i++) {
            var callback = subscribersCopy[i];
            if (typeof callback === 'function') { // Ensure it's still a function
                try {
                    callback.apply(self, signalArguments);
                } catch (e) {
                    helpers.debugLog('Error in registered signal callback for ' + signalType + ':', e);
                }
            }
        }
    }
};

SignalSender.prototype.subscribe = function(signalType, callback) {
    var self = this;
    if (self._isDeactivated) return;

    // Input validation
    if (typeof callback !== 'function') {
        helpers.debugLog('Warning: Attempted to subscribe a non-function callback for signal:', signalType, callback);
        return;
    }

    self._validateSignalType(signalType);

    if (!Array.isArray(self._signalCallbacks[signalType])) {
        self._signalCallbacks[signalType] = [];
    }
    // Add callback only if it hasn't been subscribed already
    if (helpers.arrayFindIndex(self._signalCallbacks[signalType], callback) === -1) {
        self._signalCallbacks[signalType].push(callback);
    }
};

SignalSender.prototype._validateSignalType = function(signalType) {
    var self = this;
    // This check is primarily for debugging and development; could be removed in optimized builds.
    if (helpers.arrayFindIndex(self._permittedSignals, signalType) === -1) {
        helpers.debugLog('Warning: Signal type "' + signalType + '" broadcast or subscribed ' +
            'but not declared in permitted signals: ' + DataSerializer.stringify(self._permittedSignals) +
            ' for SignalSender instance.', self);
    }
};

SignalSender.prototype.deactivate = function() {
    var self = this;
    self._isDeactivated = true; // Set a flag to prevent further operations
    // Clear all inline handlers by deleting their properties
    self._permittedSignals.forEach(function(signal) {
        delete self['on' + signal];
    });
    self._signalCallbacks = {}; // Clear all registered callbacks
};


/*
 * Collection of helper utilities for the communication link.
 */

var randomCharSet = 'abcdefghijklmnopqrstuvwxyz0123456789_';
helpers.generateRandomIdentifier = function(length, charSetMaxIndex) {
    charSetMaxIndex = charSetMaxIndex || randomCharSet.length;
    var resultChars = [];
    for (var i = 0; i < length; i++) {
        resultChars.push(randomCharSet.charAt(Math.floor(Math.random() * charSetMaxIndex)));
    }
    return resultChars.join('');
};

helpers.getRandomInt = function(maxValue) {
    return Math.floor(Math.random() * maxValue);
};

helpers.getRandomPaddedNumber = function(maxValue) {
    var numDigits = String(maxValue - 1).length; // Calculate number of digits needed for maxValue
    var padding = Array(numDigits + 1).join('0'); // Create a string of zeros for padding
    return (padding + helpers.getRandomInt(maxValue)).slice(-numDigits); // Pad and truncate
};

// Extracts the protocol://host:port part of a URL
helpers.extractRootUrl = function(fullUrl) {
    var urlWithSlash = fullUrl;
    if (urlWithSlash.charAt(urlWithSlash.length - 1) !== '/') {
        urlWithSlash += '/'; // Ensure trailing slash for consistent splitting
    }
    var urlParts = urlWithSlash.split('/').slice(0, 3); // Get protocol, empty string, host
    return urlParts.join('/');
};

helpers.isSameBaseLocation = function(urlA, urlB) {
    // If urlB is not provided, use the current window's location
    var targetUrlB = urlB || winRef.location.href;
    return (helpers.extractRootUrl(urlA) === helpers.extractRootUrl(targetUrlB));
};

// Gets the effective parent domain for cookie purposes (e.g., "example.com" from "sub.example.com")
helpers.getEffectiveDomain = function(urlAddress) {
    // Check for IP addresses (IPv4 and IPv6)
    if (/^[0-9.]+$/.test(urlAddress) || /^\[.+\]$/.test(urlAddress)) {
        return urlAddress;
    }
    // If no dots, or just a single component (e.g., "localhost"), return as is
    if (!(/[.]/.test(urlAddress))) {
        return urlAddress;
    }

    var domainParts = urlAddress.split('.');
    // For domains like "co.uk", this might return "co.uk" (correct)
    // For "sub.example.com", it returns "example.com" (correct)
    // For "example.com", it returns "example.com" (correct)
    if (domainParts.length > 2) {
        return domainParts.slice(1).join('.');
    }
    return urlAddress; // Default: return the original address if it's already a top-level domain or has only two parts
};


helpers.assignProperties = function(destination, source) {
    if (typeof destination !== 'object' || destination === null || typeof source !== 'object' || source === null) {
        helpers.debugLog('Warning: Invalid arguments for assignProperties. Both destination and source must be objects.');
        return destination;
    }
    for (var key in source) {
        // Ensure only own properties are copied
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            destination[key] = source[key];
        }
    }
    return destination;
};

var globalCommsNamespaceKey = '_cl'; // Unique key for the global namespace object
helpers.initGlobalCommsNamespace = function() {
    if (!(globalCommsNamespaceKey in winRef)) {
        winRef[globalCommsNamespaceKey] = {};
    }
};

helpers.createCloseFrameMessage = function(statusCode, reasonText) {
    // Encapsulates close frame data into a JSON string prefixed with 'c'
    return 'c' + DataSerializer.stringify([statusCode, reasonText]);
};

helpers.isUserDefinedStatusCode = function(statusCode) {
    // Check if the status code falls within the user-defined range (3000-4999) or is 1000 (normal closure)
    return statusCode === 1000 || (statusCode >= 3000 && statusCode <= 4999);
};

// Calculates Retransmission Timeout based on Round Trip Time (RTT)
helpers.calculateRetransmissionTimeout = function(roundTripTime) {
    var timeoutDuration;
    // Apply a simple heuristic: longer RTTs get a larger multiplier
    if (roundTripTime > 100) {
        timeoutDuration = 3 * roundTripTime; // RTO will be > 300ms
    } else {
        timeoutDuration = roundTripTime + 200; // RTO will be between 200ms and 300ms
    }
    return timeoutDuration;
};

helpers.debugLog = function() {
    var consoleRef = winRef.console;
    // Check for console and its log method availability and if it supports .apply()
    if (consoleRef && typeof consoleRef.log === 'function' && typeof consoleRef.log.apply === 'function') {
        consoleRef.log.apply(consoleRef, arguments);
    }
};

helpers.bindContext = function(func, context) {
    // Use native Function.prototype.bind if available for better performance and correctness
    if (typeof func.bind === 'function') {
        return func.bind(context);
    } else {
        // Fallback implementation for older JavaScript environments
        return function() {
            return func.apply(context, arguments);
        };
    }
};

helpers.isSimpleUrl = function(urlPath) {
    // A simple URL has no query string ('?') or hash fragment ('#')
    return urlPath.indexOf('?') === -1 && urlPath.indexOf('#') === -1;
};

helpers.normalizeUrl = function(urlInput) {
    var currentDocLocation = docRef.location;
    if (!urlInput) {
        throw new Error('CommsLink URL normalization failed: No URL provided.');
    }
    if (!helpers.isSimpleUrl(urlInput)) {
        throw new Error('CommsLink only supports basic URLs (no query parameters or hash fragments).');
    }

    var normalizedUrl = urlInput;

    // Handle protocol-relative URLs (e.g., '//example.com/path')
    if (normalizedUrl.indexOf('//') === 0) {
        normalizedUrl = currentDocLocation.protocol + normalizedUrl;
    }
    // Handle path-relative URLs (e.g., '/path/to/resource')
    else if (normalizedUrl.indexOf('/') === 0) {
        normalizedUrl = currentDocLocation.protocol + '//' + currentDocLocation.host + normalizedUrl;
    }
    // Ensure no trailing slashes for standardization
    normalizedUrl = normalizedUrl.replace(/[/]+$/, '');
    return normalizedUrl;
};

helpers.arrayFindIndex = function(targetArray, itemToFind) {
    if (!helpers.isPureArray(targetArray)) return -1; // Ensure it's an array

    // Use native Array.prototype.indexOf if available for efficiency
    if (targetArray.indexOf) {
        return targetArray.indexOf(itemToFind);
    }
    // Fallback for older browsers
    for (var i = 0; i < targetArray.length; i++) {
        if (targetArray[i] === itemToFind) {
            return i;
        }
    }
    return -1;
};

helpers.arrayRemoveItem = function(sourceArray, itemToRemove) {
    if (!helpers.isPureArray(sourceArray)) return [];

    var foundIndex = helpers.arrayFindIndex(sourceArray, itemToRemove);
    if (foundIndex === -1) {
        return sourceArray.slice(); // Return a shallow copy if the item isn't found
    } else {
        // Construct a new array without the item
        var newArray = sourceArray.slice(0, foundIndex);
        return newArray.concat(sourceArray.slice(foundIndex + 1));
    }
};

helpers.isPureArray = Array.isArray || function(value) {
    // Polyfill for Array.isArray if not natively supported
    return Object.prototype.toString.call(value) === '[object Array]';
};

helpers.scheduleTask = function(delayMs, funcToExecute) {
    // Allow `delayMs` to be optional, or omitted if only a function is passed
    if (typeof delayMs === 'function') {
        funcToExecute = delayMs;
        delayMs = 0;
    }
    // Ensure delayMs is a non-negative integer
    delayMs = Math.max(0, parseInt(delayMs, 10) || 0);

    return setTimeout(funcToExecute, delayMs);
};


// --- Advanced JSON string quoting for transport safety ---

// Regex for standard JSON escapable characters (per Douglas Crockford's json2.js)
var jsonEscapePattern = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Pre-computed map for standard JSON escape sequences
var jsonEscapeMap = {
    "\u0000": "\\u0000",
    "\u0001": "\\u0001",
    "\u0002": "\\u0002",
    "\u0003": "\\u0003",
    "\u0004": "\\u0004",
    "\u0005": "\\u0005",
    "\u0006": "\\u0006",
    "\u0007": "\\u0007",
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\u000b": "\\u000b",
    "\f": "\\f",
    "\r": "\\r",
    "\u000e": "\\u000e",
    "\u000f": "\\u000f",
    "\u0010": "\\u0010",
    "\u0011": "\\u0011",
    "\u0012": "\\u0012",
    "\u0013": "\\u0013",
    "\u0014": "\\u0014",
    "\u0015": "\\u0015",
    "\u0016": "\\u0016",
    "\u0017": "\\u0017",
    "\u0018": "\\u0018",
    "\u0019": "\\u0019",
    "\u001a": "\\u001a",
    "\u001b": "\\u001b",
    "\u001c": "\\u001c",
    "\u001d": "\\u001d",
    "\u001e": "\\u001e",
    "\u001f": "\\u001f",
    "\"": "\\\"",
    "\\": "\\\\",
    "\u007f": "\\u007f",
    "\u0080": "\\u0080",
    "\u0081": "\\u0081",
    "\u0082": "\\u0082",
    "\u0083": "\\u0083",
    "\u0084": "\\u0084",
    "\u0085": "\\u0085",
    "\u0086": "\\u0086",
    "\u0087": "\\u0087",
    "\u0088": "\\u0088",
    "\u0089": "\\u0089",
    "\u008a": "\\u008a",
    "\u008b": "\\u008b",
    "\u008c": "\\u008c",
    "\u008d": "\\u008d",
    "\u008e": "\\u008e",
    "\u008f": "\\u008f",
    "\u0090": "\\u0090",
    "\u0091": "\\u0091",
    "\u0092": "\\u0092",
    "\u0093": "\\u0093",
    "\u0094": "\\u0094",
    "\u0095": "\\u0095",
    "\u0096": "\\u0096",
    "\u0097": "\\u0097",
    "\u0098": "\\u0098",
    "\u0099": "\\u0099",
    "\u009a": "\\u009a",
    "\u009b": "\\u009b",
    "\u009c": "\\u009c",
    "\u009d": "\\u009d",
    "\u009e": "\\u009e",
    "\u009f": "\\u009f",
    "\u00ad": "\\u00ad",
    "\u0600": "\\u0600",
    "\u0601": "\\u0601",
    "\u0602": "\\u0602",
    "\u0603": "\\u0603",
    "\u0604": "\\u0604",
    "\u070f": "\\u070f",
    "\u17b4": "\\u17b4",
    "\u17b5": "\\u17b5",
    "\u200c": "\\u200c",
    "\u200d": "\\u200d",
    "\u200e": "\\u200e",
    "\u200f": "\\u200f",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
    "\u202a": "\\u202a",
    "\u202b": "\\u202b",
    "\u202c": "\\u202c",
    "\u202d": "\\u202d",
    "\u202e": "\\u202e",
    "\u202f": "\\u202f",
    "\u2060": "\\u2060",
    "\u2061": "\\u2061",
    "\u2062": "\\u2062",
    "\u2063": "\\u2063",
    "\u2064": "\\u2064",
    "\u2065": "\\u2065",
    "\u2066": "\\u2066",
    "\u2067": "\\u2067",
    "\u2068": "\\u2068",
    "\u2069": "\\u2069",
    "\u206a": "\\u206a",
    "\u206b": "\\u206b",
    "\u206c": "\\u206c",
    "\u206d": "\\u206d",
    "\u206e": "\\u206e",
    "\u206f": "\\u206f",
    "\ufeff": "\\ufeff",
    "\ufff0": "\\ufff0",
    "\ufff1": "\\ufff1",
    "\ufff2": "\\ufff2",
    "\ufff3": "\\ufff3",
    "\ufff4": "\\ufff4",
    "\ufff5": "\\ufff5",
    "\ufff6": "\\ufff6",
    "\ufff7": "\\ufff7",
    "\ufff8": "\\ufff8",
    "\ufff9": "\\ufff9",
    "\ufffa": "\\ufffa",
    "\ufffb": "\\ufffb",
    "\ufffc": "\\ufffc",
    "\ufffd": "\\ufffd",
    "\ufffe": "\\ufffe",
    "\uffff": "\\uffff"
};

// Function to perform basic JSON string quoting (uses DataSerializer.stringify for internal consistency)
var basicJsonQuoteString = (DataSerializer && DataSerializer.stringify) || function(inputStr) {
    jsonEscapePattern.lastIndex = 0; // Reset regex lastIndex for safety
    if (jsonEscapePattern.test(inputStr)) {
        return '"' + inputStr.replace(jsonEscapePattern, function(charToEscape) {
            return jsonEscapeMap[charToEscape];
        }) + '"';
    }
    return '"' + inputStr + '"';
};

// Additional characters that might be problematic due to browser-specific re-encoding issues
var extendedEscapePattern = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g;
var extendedEscapeMap; // This map will be lazily initialized

// Helper function to dynamically build a unicode escape lookup table
function buildEscapeLookupTable(pattern) {
    var lookup = {};
    var allChars = [];
    // Generate an array of all possible unicode characters (0-65535)
    for (var i = 0; i < 65536; i++) {
        allChars.push(String.fromCharCode(i));
    }

    pattern.lastIndex = 0; // Reset regex
    // Iterate through all characters, if a character matches the pattern, store its escape sequence
    allChars.join('').replace(pattern, function(charToEscape) {
        lookup[charToEscape] = '\\u' + ('0000' + charToEscape.charCodeAt(0).toString(16)).slice(-4);
        return ''; // The return value is irrelevant for building the map, just for the replace operation
    });
    pattern.lastIndex = 0; // Reset regex again
    return lookup;
}

// Robust quoting function that handles standard JSON escapes and additional problematic unicode characters
helpers.robustQuoteString = function(inputString) {
    // First, apply standard JSON quoting
    var quotedString = basicJsonQuoteString(inputString);

    // Most strings won't contain the 'extra' escapable characters, so perform a quick test first.
    extendedEscapePattern.lastIndex = 0;
    if (!extendedEscapePattern.test(quotedString)) {
        return quotedString;
    }

    // If problematic characters are found, ensure the extended lookup map is initialized.
    if (!extendedEscapeMap) {
        extendedEscapeMap = buildEscapeLookupTable(extendedEscapePattern);
    }

    // Apply extended escaping to the already JSON-quoted string
    return quotedString.replace(extendedEscapePattern, function(charToEscape) {
        return extendedEscapeMap[charToEscape];
    });
};


var supportedTransmissionProtocols = ['websocket',
    'xdr-streaming',
    'xhr-streaming',
    'iframe-eventsource',
    'iframe-htmlfile',
    'xdr-polling',
    'xhr-polling',
    'iframe-xhr-polling',
    'jsonp-polling'
];

helpers.assessAvailableProtocols = function() {
    var protocolProbes = {};
    for (var i = 0; i < supportedTransmissionProtocols.length; i++) {
        var protoName = supportedTransmissionProtocols[i];
        // Check if the protocol implementation exists within CommsLink and is enabled
        protocolProbes[protoName] = CommsLink[protoName] && CommsLink[protoName].enabled();
    }
    return protocolProbes;
};

helpers.selectUsableProtocols = function(protocolAvailability, protocolWhitelist, connectionInfo) {
    var effectiveAvailability = {};
    var chosenProtocols = [];

    // If no whitelist is provided, consider all supported protocols
    var currentWhitelist = protocolWhitelist || supportedTransmissionProtocols;

    // Filter the full availability based on the provided whitelist
    for (var i = 0; i < currentWhitelist.length; i++) {
        var proto = currentWhitelist[i];
        effectiveAvailability[proto] = protocolAvailability[proto];
    }

    // Helper function to push the first available protocol from a list of options
    var tryPushFirstAvailable = function(protocolOptions) {
        var availableOption = protocolOptions.find(function(p) {
            return effectiveAvailability[p];
        });
        if (availableOption) {
            chosenProtocols.push(availableOption);
            return true; // Indicate that a protocol was found and added
        }
        return false;
    };

    // 1. WebSocket protocol selection
    if (connectionInfo.websocket !== false) {
        tryPushFirstAvailable(['websocket']);
    }

    // 2. Streaming protocol selection
    // Prefer XHR streaming if available and not a null origin scenario
    if (effectiveAvailability['xhr-streaming'] && !connectionInfo.null_origin) {
        chosenProtocols.push('xhr-streaming');
    } else {
        // Fallback to XDR streaming if available, no cookie needed, and not null origin
        if (effectiveAvailability['xdr-streaming'] && !connectionInfo.cookie_needed && !connectionInfo.null_origin) {
            chosenProtocols.push('xdr-streaming');
        } else {
            // Further fallback to iframe-based streaming if other options are not viable
            tryPushFirstAvailable(['iframe-eventsource', 'iframe-htmlfile']);
        }
    }

    // Note: The original snippet ended here, but typically polling protocols would follow.
    // Example for polling logic (if it were in the original):
    // if (effectiveAvailability['xhr-polling'] && !connectionInfo.null_origin) {
    //     chosenProtocols.push('xhr-polling');
    // } else if (effectiveAvailability['xdr-polling'] && !connectionInfo.cookie_needed && !connectionInfo.null_origin) {
    //     chosenProtocols.push('xdr-polling');
    // } else {
    //     tryPushFirstAvailable(['iframe-xhr-polling', 'jsonp-polling']);
    // }

    return chosenProtocols;
};