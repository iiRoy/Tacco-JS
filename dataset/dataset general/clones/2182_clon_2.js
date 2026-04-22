/*
 * Client-side communication library, version 0.3.4
 * Project homepage: http://sockjs.org
 * Licensed under the MIT License.
 *
 * (c) 2011-2012 VMware, Inc.
 *
 * Permission is hereby granted, free of charge, to any entity obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Custom JSON utility functions, based on Douglas Crockford's original (minified).
var JDATA;
JDATA || (JDATA = {});

(function () {
    // Function to recursively serialize a value into a JSON string.
    function serializeValue(keyName, containerObject) {
        var idx, propKey, serializedItem, itemCount, currentIndent, partsArray, valueToSerialize = containerObject[keyName];

        // If the value has a custom toJSON method, use it.
        valueToSerialize && typeof valueToSerialize === "object" && typeof valueToSerialize.toJSON === "function" && (valueToSerialize = valueToSerialize.toJSON(keyName));

        // If a replacer function is provided, apply it.
        typeof replacerFunc === "function" && (valueToSerialize = replacerFunc.call(containerObject, keyName, valueToSerialize));

        // Handle different data types for serialization.
        switch (typeof valueToSerialize) {
            case "string":
                return wrapString(valueToSerialize);
            case "number":
                return isFinite(valueToSerialize) ? String(valueToSerialize) : "null";
            case "boolean":
            case "null":
                return String(valueToSerialize);
            case "object":
                if (!valueToSerialize) return "null";

                currentIndent += spacingString;
                partsArray = [];

                // Handle arrays.
                if (Object.prototype.toString.apply(valueToSerialize) === "[object Array]") {
                    itemCount = valueToSerialize.length;
                    for (idx = 0; idx < itemCount; idx += 1) {
                        partsArray[idx] = serializeValue(idx, valueToSerialize) || "null";
                    }
                    serializedItem = partsArray.length === 0 ? "[]" : currentIndent ? "[\n" + currentIndent + partsArray.join(",\n" + currentIndent) + "\n" + currentIndent + "]" : "[" + partsArray.join(",") + "]";
                    currentIndent = currentIndent; // Restore previous indent.
                    return serializedItem;
                }

                // Handle objects with a replacer array.
                if (replacerFunc && typeof replacerFunc === "object") {
                    itemCount = replacerFunc.length;
                    for (idx = 0; idx < itemCount; idx += 1) {
                        typeof replacerFunc[idx] === "string" && (propKey = replacerFunc[idx], serializedItem = serializeValue(propKey, valueToSerialize), serializedItem && partsArray.push(wrapString(propKey) + (currentIndent ? ": " : ":") + serializedItem));
                    }
                }
                // Handle general objects.
                else {
                    for (propKey in valueToSerialize) {
                        Object.prototype.hasOwnProperty.call(valueToSerialize, propKey) && (serializedItem = serializeValue(propKey, valueToSerialize), serializedItem && partsArray.push(wrapString(propKey) + (currentIndent ? ": " : ":") + serializedItem));
                    }
                }

                serializedItem = partsArray.length === 0 ? "{}" : currentIndent ? "{\n" + currentIndent + partsArray.join(",\n" + currentIndent) + "\n" + currentIndent + "}" : "{" + partsArray.join(",") + "}";
                currentIndent = currentIndent; // Restore previous indent.
                return serializedItem;
        }
    }

    // Function to wrap a string in double quotes and escape special characters.
    function wrapString(inputString) {
        specialCharsPattern.lastIndex = 0;
        return specialCharsPattern.test(inputString) ? '"' + inputString.replace(specialCharsPattern, function (charMatch) {
            var mappedChar = escapeMap[charMatch];
            return typeof mappedChar === "string" ? mappedChar : "\\u" + ("0000" + charMatch.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + inputString + '"';
    }

    // Helper to pad numbers with a leading zero if less than 10.
    function padZero(numValue) {
        return numValue < 10 ? "0" + numValue : numValue;
    }

    "use strict";

    // Extend Date and other prototypes for JSON serialization if not already defined.
    typeof Date.prototype.toJSON !== "function" && (Date.prototype.toJSON = function (keyName) {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + padZero(this.getUTCMonth() + 1) + "-" + padZero(this.getUTCDate()) + "T" + padZero(this.getUTCHours()) + ":" + padZero(this.getUTCMinutes()) + ":" + padZero(this.getUTCSeconds()) + "Z" : null;
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (keyName) {
        return this.valueOf();
    });

    // Regular expressions and lookup tables for JSON serialization.
    var controlCharsPattern = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        specialCharsPattern = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        currentIndent, spacingString,
        escapeMap = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        replacerFunc;

    // Implement JSON.stringify if not native.
    typeof JDATA.stringify !== "function" && (JDATA.stringify = function (valueToSerialize, replacer, space) {
        var tempVar;
        currentIndent = "";
        spacingString = "";

        if (typeof space === "number") {
            for (tempVar = 0; tempVar < space; tempVar += 1) spacingString += " ";
        } else if (typeof space === "string") {
            spacingString = space;
        }

        replacerFunc = replacer;

        if (!replacer || typeof replacer === "function" || typeof replacer === "object" && typeof replacer.length === "number") {
            return serializeValue("", {
                "": valueToSerialize
            });
        }
        throw new Error("JDATA.stringify");
    });

    // Implement JSON.parse if not native.
    typeof JDATA.parse !== "function" && (JDATA.parse = function (inputString, transformFunc) {
        // Recursively walk the parsed object to apply the reviver function.
        function traverseObject(containerObject, propKey) {
            var childKey, childValue, currentVal = containerObject[propKey];
            if (currentVal && typeof currentVal === "object") {
                for (childKey in currentVal) {
                    Object.prototype.hasOwnProperty.call(currentVal, childKey) && (childValue = traverseObject(currentVal, childKey), childValue !== undefined ? currentVal[childKey] = childValue : delete currentVal[childKey]);
                }
            }
            return transformFunc.call(containerObject, propKey, currentVal);
        }

        var parsedResult;
        inputString = String(inputString);
        controlCharsPattern.lastIndex = 0;

        // Replace control characters with escaped unicode sequences.
        controlCharsPattern.test(inputString) && (inputString = inputString.replace(controlCharsPattern, function (charMatch) {
            return "\\u" + ("0000" + charMatch.charCodeAt(0).toString(16)).slice(-4);
        }));

        // Validate and parse the JSON string.
        if (/^[\],:{}\s]*$/.test(inputString.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
            parsedResult = eval("(" + inputString + ")"); // Use eval for parsing the validated string.
            return typeof transformFunc === "function" ? traverseObject({
                "": parsedResult
            }, "") : parsedResult;
        }
        throw new SyntaxError("JDATA.parse");
    });
})();


//     [*] Incorporating lib/index.js
// Main public interface object
var NetSocket = (function () {
    // References to global objects for safety and brevity.
    var docRef = document;
    var winRef = window;
    var helpers = {};


    //         [*] Incorporating lib/reventtarget.js
    /*
     * Custom Event Dispatcher Implementation
     * (c) 2011-2012 VMware, Inc.
     *
     * For license details, refer to COPYING.
     */

    /*
     * Simplified version of DOM Level 2 EventTarget functionality.
     *   See: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
     */
    var EventDispatcher = function () {};

    // Attaches an event handler for a specified event name.
    EventDispatcher.prototype.onEvent = function (eventName, handler) {
        if (!this._eventHandlers) {
            this._eventHandlers = {};
        }
        if (!(eventName in this._eventHandlers)) {
            this._eventHandlers[eventName] = [];
        }
        var handlerList = this._eventHandlers[eventName];
        if (helpers.findIndexInArray(handlerList, handler) === -1) {
            handlerList.push(handler);
        }
        return;
    };

    // Removes an event handler for a specified event name.
    EventDispatcher.prototype.offEvent = function (eventName, handler) {
        if (!(this._eventHandlers && (eventName in this._eventHandlers))) {
            return;
        }
        var handlerList = this._eventHandlers[eventName];
        var handlerIndex = helpers.findIndexInArray(handlerList, handler);
        if (handlerIndex !== -1) {
            if (handlerList.length > 1) {
                this._eventHandlers[eventName] = handlerList.slice(0, handlerIndex).concat(handlerList.slice(handlerIndex + 1));
            } else {
                delete this._eventHandlers[eventName];
            }
            return;
        }
        return;
    };

    // Dispatches an event, notifying all registered handlers.
    EventDispatcher.prototype.triggerEvent = function (eventObject) {
        var triggeredName = eventObject.type;
        var eventArgs = Array.prototype.slice.call(arguments, 0);

        // Call direct on-event property if it exists.
        if (this['on' + triggeredName]) {
            this['on' + triggeredName].apply(this, eventArgs);
        }

        // Call all registered listeners.
        if (this._eventHandlers && triggeredName in this._eventHandlers) {
            for (var counter = 0; counter < this._eventHandlers[triggeredName].length; counter++) {
                this._eventHandlers[triggeredName][counter].apply(this, eventArgs);
            }
        }
    };
    //         [*] End of lib/reventtarget.js


    //         [*] Incorporating lib/simpleevent.js
    /*
     * Basic Event Object Definition
     * (c) 2011-2012 VMware, Inc.
     *
     * For license details, refer to COPYING.
     */

    // Constructor for a simple event object.
    var BasicEvent = function (eventType, properties) {
        this.eventType = eventType;
        if (typeof properties !== 'undefined') {
            for (var propName in properties) {
                if (!properties.hasOwnProperty(propName)) continue;
                this[propName] = properties[propName];
            }
        }
    };

    // Provides a string representation of the event object.
    BasicEvent.prototype.toString = function () {
        var resultParts = [];
        for (var propName in this) {
            if (!this.hasOwnProperty(propName)) continue;
            var propValue = this[propName];
            if (typeof propValue === 'function') propValue = '[function]';
            resultParts.push(propName + '=' + propValue);
        }
        return 'BasicEvent(' + resultParts.join(', ') + ')';
    };
    //         [*] End of lib/simpleevent.js


    //         [*] Incorporating lib/eventemitter.js
    /*
     * Event Publisher Base Class
     * (c) 2011-2012 VMware, Inc.
     *
     * For license details, refer to COPYING.
     */

    // Constructor for the event publisher.
    var EventPublisher = function (allowedEventNames) {
        var selfRef = this;
        selfRef._definedEvents = allowedEventNames || [];
        selfRef._subscribers = {};
    };

    // Publishes an event, triggering all associated subscribers.
    EventPublisher.prototype.publish = function (eventType) {
        var selfRef = this;
        selfRef._validateEventType(eventType);
        if (selfRef._isDisposed) return;

        var eventArgs = Array.prototype.slice.call(arguments, 1);

        // Call direct on-event property if it exists.
        if (selfRef['on' + eventType]) {
            selfRef['on' + eventType].apply(selfRef, eventArgs);
        }

        // Call all subscribed callbacks.
        if (eventType in selfRef._subscribers) {
            for (var counter = 0; counter < selfRef._subscribers[eventType].length; counter++) {
                selfRef._subscribers[eventType][counter].apply(selfRef, eventArgs);
            }
        }
    };

    // Subscribes a callback function to an event.
    EventPublisher.prototype.subscribe = function (eventType, subscriberCallback) {
        var selfRef = this;
        selfRef._validateEventType(eventType);
        if (selfRef._isDisposed) return;

        if (!(eventType in selfRef._subscribers)) {
            selfRef._subscribers[eventType] = [];
        }
        selfRef._subscribers[eventType].push(subscriberCallback);
    };

    // Internal method to check if an event type is defined.
    EventPublisher.prototype._validateEventType = function (eventType) {
        var selfRef = this;
        if (helpers.findIndexInArray(selfRef._definedEvents, eventType) === -1) {
            helpers.outputLog('Event ' + JDATA.stringify(eventType) +
                ' is not listed among ' + JDATA.stringify(selfRef._definedEvents) +
                ' for ' + selfRef);
        }
    };

    // Cleans up the event publisher, preventing further events.
    EventPublisher.prototype.dispose = function () {
        var selfRef = this;
        selfRef._isDisposed = true;
        for (var counter = 0; counter < selfRef._definedEvents.length; counter++) {
            delete selfRef[selfRef._definedEvents[counter]];
        }
        selfRef._subscribers = {};
    };
    //         [*] End of lib/eventemitter.js


    //         [*] Incorporating lib/utils.js
    /*
     * General Utility Functions
     * (c) 2011-2012 VMware, Inc.
     *
     * For license details, refer to COPYING.
     */

    // Character set for generating random strings.
    var charsetForRandom = 'abcdefghijklmnopqrstuvwxyz0123456789_';

    // Generates a random string of a specified length.
    helpers.generateRandomString = function (strLength, maxLength) {
        maxLength = maxLength || charsetForRandom.length;
        var counter, generatedChars = [];
        for (counter = 0; counter < strLength; counter++) {
            generatedChars.push(charsetForRandom.substr(Math.floor(Math.random() * maxLength), 1));
        }
        return generatedChars.join('');
    };

    // Generates a random number up to a specified maximum.
    helpers.getRandomNumber = function (maxValue) {
        return Math.floor(Math.random() * maxValue);
    };

    // Generates a random number as a string, padded with leading zeros.
    helpers.getRandomNumberAsString = function (maxValue) {
        var digitCount = ('' + (maxValue - 1)).length;
        var paddingString = Array(digitCount + 1).join('0');
        return (paddingString + helpers.getRandomNumber(maxValue)).slice(-digitCount);
    };

    // Extracts the origin (scheme://host:port) from a given URL.
    // Example: http://example.com:8080/path -> http://example.com:8080
    helpers.extractOrigin = function (resourceURL) {
        resourceURL += '/';
        var urlSegments = resourceURL.split('/').slice(0, 3);
        return urlSegments.join('/');
    };

    // Checks if two URLs share the same origin.
    helpers.checkSameOrigin = function (firstURL, secondURL) {
        // `location.origin` would be ideal, but it's not universally supported.
        if (!secondURL) secondURL = winRef.location.href;

        return (firstURL.split('/').slice(0, 3).join('/') ===
            secondURL.split('/').slice(0, 3).join('/'));
    };

    // Gets the parent domain for a given URL (e.g., 'www.example.com' -> 'example.com').
    helpers.getTopLevelDomain = function (resourceURL) {
        // Handles IPv4 addresses.
        if (/^[0-9.]*$/.test(resourceURL)) return resourceURL;
        // Handles IPv6 addresses.
        if (/^\[/.test(resourceURL)) return resourceURL;
        // Handles URLs without dots (e.g., localhost).
        if (!(/[.]/.test(resourceURL))) return resourceURL;

        var urlSegments = resourceURL.split('.').slice(1);
        return urlSegments.join('.');
    };

    // Extends a destination object with properties from a source object.
    helpers.assignProperties = function (destinationObject, sourceObject) {
        for (var propKey in sourceObject) {
            if (sourceObject.hasOwnProperty(propKey)) {
                destinationObject[propKey] = sourceObject[propKey];
            }
        }
        return destinationObject;
    };

    // Key used for global namespace pollution.
    var globalKey = '_jp';

    // Ensures a global namespace object exists.
    helpers.ensureGlobalNamespace = function () {
        if (!(globalKey in winRef)) {
            winRef[globalKey] = {};
        }
    };

    // Formats a close message for a connection.
    helpers.formatCloseMessage = function (statusCode, statusReason) {
        return 'c' + JDATA.stringify([statusCode, statusReason]);
    };

    // Checks if a status code is within the user-defined range.
    helpers.isUserDefinedCode = function (statusCode) {
        return statusCode === 1000 || (statusCode >= 3000 && statusCode <= 4999);
    };

    // Calculates the Retransmission Timeout (RTO) based on Round Trip Time (RTT).
    // Refer to: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
    // and RFC 2988 for more details.
    helpers.calculateRetransmissionTimeout = function (roundTripTime) {
        var retransmissionTimeout;
        if (roundTripTime > 100) {
            retransmissionTimeout = 3 * roundTripTime; // RTO must be > 300ms.
        } else {
            retransmissionTimeout = roundTripTime + 200; // 200ms < RTO <= 300ms.
        }
        return retransmissionTimeout;
    };

    // Logs messages to the console if available.
    helpers.outputLog = function () {
        if (winRef.console && console.log && console.log.apply) {
            console.log.apply(console, arguments);
        }
    };

    // Creates a bound function, ensuring 'this' context.
    helpers.createBoundFunction = function (callbackFunction, contextObject) {
        if (callbackFunction.bind) {
            return callbackFunction.bind(contextObject);
        } else {
            return function () {
                return callbackFunction.apply(contextObject, arguments);
            };
        }
    };

    // Checks if a URL is "flat" (contains no query string or hash).
    helpers.isSimpleURL = function (resourceURL) {
        return resourceURL.indexOf('?') === -1 && resourceURL.indexOf('#') === -1;
    };

    // Normalizes and validates a URL for use with NetSocket.
    helpers.normalizeURL = function (resourceURL) {
        var documentLocation = docRef.location;
        if (!resourceURL) {
            throw new Error('Invalid URL provided for NetSocket connection');
        }
        if (!helpers.isSimpleURL(resourceURL)) {
            throw new Error('Only basic URLs without query or hash are supported in NetSocket');
        }

        // Convert '//abc' to 'http://abc' based on current protocol.
        if (resourceURL.indexOf('//') === 0) {
            resourceURL = documentLocation.protocol + resourceURL;
        }
        // Convert '/abc' to 'http://localhost:80/abc' based on current location.
        if (resourceURL.indexOf('/') === 0) {
            resourceURL = documentLocation.protocol + '//' + documentLocation.host + resourceURL;
        }
        // Remove any trailing slashes.
        resourceURL = resourceURL.replace(/[/]+$/, '');
        return resourceURL;
    };

    // Finds the index of an item in an array (for IE compatibility).
    helpers.findIndexInArray = function (targetArray, searchItem) {
        for (var counter = 0; counter < targetArray.length; counter++) {
            if (targetArray[counter] === searchItem) {
                return counter;
            }
        }
        return -1;
    };

    // Creates a new array with a specified item removed.
    helpers.removeFromArray = function (targetArray, searchItem) {
        var foundIndex = helpers.findIndexInArray(targetArray, searchItem);
        if (foundIndex === -1) {
            return targetArray.slice();
        } else {
            var modifiedArray = targetArray.slice(0, foundIndex);
            return modifiedArray.concat(targetArray.slice(foundIndex + 1));
        }
    };

    // Checks if a value is an array (using Array.isArray or fallback).
    helpers.isAnArray = Array.isArray || function (checkValue) {
        return {}.toString.call(checkValue).indexOf('Array') >= 0;
    };

    // Delays the execution of a function.
    helpers.deferExecution = function (delayMs, callbackFunction) {
        if (typeof delayMs === 'function') {
            callbackFunction = delayMs;
            delayMs = 0;
        }
        return setTimeout(callbackFunction, delayMs);
    };


    // Characters requiring JSON escaping, as defined by Douglas Crockford:
    // https://github.com/douglascrockford/JSON-js/blob/47a9882cddeb1e8529e07af9736218075372b8ac/json2.js#L196
    var jsonEscapePattern = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        jsonEscapeMap = {
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
            "\ufff3": "\\uFFF3",
            "\ufff4": "\\uFFF4",
            "\ufff5": "\\uFFF5",
            "\ufff6": "\\uFFF6",
            "\ufff7": "\\uFFF7",
            "\ufff8": "\\uFFF8",
            "\ufff9": "\\uFFF9",
            "\ufffa": "\\uFFFA",
            "\ufffb": "\\uFFFB",
            "\ufffc": "\\uFFFC",
            "\ufffd": "\\uFFFD",
            "\ufffe": "\\uFFFE",
            "\uffff": "\\uFFFF"
        };

    // Additional characters that some browsers (like Chrome) might misinterpret.
    var additionalEscapePattern = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
        additionalEscapeMap;

    // JSON string quoting function. Prefers native JSON.stringify if available.
    var jsonQuoteString = (JDATA && JDATA.stringify) || function (inputString) {
        jsonEscapePattern.lastIndex = 0;
        if (jsonEscapePattern.test(inputString)) {
            inputString = inputString.replace(jsonEscapePattern, function (charMatch) {
                return jsonEscapeMap[charMatch];
            });
        }
        return '"' + inputString + '"';
    };

    // Builds a comprehensive escape map for special characters.
    // This process can be slow, so it's deferred until needed.
    var buildEscapeMap = function (pattern) {
        var counter;
        var generatedMap = {};
        var charList = [];
        for (counter = 0; counter < 65536; counter++) {
            charList.push(String.fromCharCode(counter));
        }
        pattern.lastIndex = 0;
        charList.join('').replace(pattern, function (charMatch) {
            generatedMap[charMatch] = '\\u' + ('0000' + charMatch.charCodeAt(0).toString(16)).slice(-4);
            return '';
        });
        pattern.lastIndex = 0;
        return generatedMap;
    };

    // Quotes a string for JSON, handling common and browser-specific unicode issues.
    // Specifically addresses unicode surrogates: http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
    helpers.formatJsonString = function (inputString) {
        var quotedString = jsonQuoteString(inputString);

        // For most cases, the standard JSON quoting is sufficient and fast.
        additionalEscapePattern.lastIndex = 0;
        if (!additionalEscapePattern.test(quotedString)) {
            return quotedString;
        }

        // If extra escaping is needed, build the lookup map if it doesn't exist.
        if (!additionalEscapeMap) additionalEscapeMap = buildEscapeMap(additionalEscapePattern);

        // Apply additional escaping.
        return quotedString.replace(additionalEscapePattern, function (charMatch) {
            return additionalEscapeMap[charMatch];
        });
    };

    // List of all supported communication protocols.
    var supportedProtocols = ['websocket',
        'xdr-streaming',
        'xhr-streaming',
        'iframe-eventsource',
        'iframe-htmlfile',
        'xdr-polling',
        'xhr-polling',
        'iframe-xhr-polling',
        'jsonp-polling'
    ];

    // Probes for the availability of various communication protocols.
    helpers.testAvailableProtocols = function () {
        var testedProtocols = {};
        for (var counter = 0; counter < supportedProtocols.length; counter++) {
            var currentProtocol = supportedProtocols[counter];
            // Check if protocol is defined and enabled.
            testedProtocols[currentProtocol] = NetSocket[currentProtocol] &&
                NetSocket[currentProtocol].enabled();
        }
        return testedProtocols;
    };

    // Determines the active protocols based on probed availability and a whitelist.
    helpers.determineActiveProtocols = function (testedProtocols, allowedProtocols, connectionInfo) {
        var protocolEnabledStatus = {},
            selectedProtocols = [];

        // Use all supported protocols if no whitelist is provided.
        if (!allowedProtocols) allowedProtocols = supportedProtocols;

        // Filter probed protocols by the whitelist.
        for (var counter = 0; counter < allowedProtocols.length; counter++) {
            var currentProtocol = allowedProtocols[counter];
            protocolEnabledStatus[currentProtocol] = testedProtocols[currentProtocol];
        }

        // Helper function to conditionally add protocols to the selected list.
        var attemptProtocolPush = function (protocolCandidates) {
            var currentCandidate = protocolCandidates.shift();
            if (protocolEnabledStatus[currentCandidate]) {
                selectedProtocols.push(currentCandidate);
            } else {
                if (protocolCandidates.length > 0) {
                    attemptProtocolPush(protocolCandidates);
                }
            }
        };

        // 1. Prioritize WebSocket if not explicitly disabled.
        if (connectionInfo.websocket !== false) {
            attemptProtocolPush(['websocket']);
        }

        // 2. Prioritize streaming protocols.
        if (protocolEnabledStatus['xhr-streaming'] && !connectionInfo.null_origin) {
            selectedProtocols.push('xhr-streaming');
        } else {
            if (protocolEnabledStatus['xdr-streaming'] && !connectionInfo.cookie_needed && !connectionInfo.null_origin) {
                selectedProtocols.push('xdr-streaming');
            } else {
                attemptProtocolPush(['iframe-eventsource',
                    'iframe-htmlfile'
                ]);
            }
        }