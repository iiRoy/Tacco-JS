/* This file contains the SockJS client library, version 0.3.4.
 * It is available at http://sockjs.org and distributed under the MIT License.
 *
 * --- Original Copyright Notice ---
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
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
 * --- End of Original Copyright Notice ---
 */

// JSON2 library, minified version by Douglas Crockford, integrated here.
var JSON;

// Ensure JSON object exists, creating it if necessary.
JSON || (JSON = {});

// Self-executing anonymous function to encapsulate JSON methods.
(function() {

    // Helper function to stringify a value.
    function str(a, b) {
        var c, d, e, f, g = gap,
            h, i = b[a];

        // If 'i' has a 'toJSON' method, call it.
        i && typeof i === "object" && typeof i.toJSON === "function" && (i = i.toJSON(a));

        // If a 'rep' function is provided, use it to transform 'i'.
        typeof rep === "function" && (i = rep.call(b, a, i));

        // Handle different types of values.
        switch (typeof i) {
            case "string":
                return quote(i); // String values are quoted.

            case "number":
                // Numbers are converted to strings, or "null" if not finite.
                return isFinite(i) ? String(i) : "null";

            case "boolean":
            case "null":
                return String(i); // Booleans and null are directly converted to strings.

            case "object":
                // Handle null objects.
                if (!i) return "null";

                // Indent for nested objects/arrays.
                gap += indent;
                h = [];

                // Handle arrays.
                if (Object.prototype.toString.apply(i) === "[object Array]") {
                    f = i.length;
                    for (c = 0; c < f; c += 1) {
                        h[c] = str(c, i) || "null"; // Recursively stringify array elements.
                    }
                    e = h.length === 0 ? "[]" : gap ? "[\n" + gap + h.join(",\n" + gap) + "\n" + g + "]" : "[" + h.join(",") + "]";
                    gap = g;
                    return e;
                }

                // Handle objects with a replacer array.
                if (rep && typeof rep === "object") {
                    f = rep.length;
                    for (c = 0; c < f; c += 1) {
                        typeof rep[c] === "string" && (d = rep[c], e = str(d, i), e && h.push(quote(d) + (gap ? ": " : ":") + e));
                    }
                } else {
                    // Handle general objects.
                    for (d in i) {
                        Object.prototype.hasOwnProperty.call(i, d) && (e = str(d, i), e && h.push(quote(d) + (gap ? ": " : ":") + e));
                    }
                }
                e = h.length === 0 ? "{}" : gap ? "{\n" + gap + h.join(",\n" + gap) + "\n" + g + "}" : "{" + h.join(",") + "}";
                gap = g;
                return e;
        }
    }

    // Helper function to quote a string, escaping special characters.
    function quote(a) {
        escapable.lastIndex = 0;
        return escapable.test(a) ? '"' + a.replace(escapable, function(a) {
            var b = meta[a];
            return typeof b === "string" ? b : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + a + '"';
    }

    // Helper function for zero-padding numbers.
    function f(a) {
        return a < 10 ? "0" + a : a;
    }

    "use strict";

    // Extend Date, String, Number, and Boolean prototypes with toJSON methods if they don't exist.
    typeof Date.prototype.toJSON !== "function" && (Date.prototype.toJSON = function(a) {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null;
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(a) {
        return this.valueOf();
    });

    // Regular expressions and lookup tables for JSON stringification.
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent,
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        rep;

    // Implement JSON.stringify if it doesn't exist.
    typeof JSON.stringify !== "function" && (JSON.stringify = function(a, b, c) {
        var d;
        gap = "";
        indent = "";

        // Determine indentation string.
        if (typeof c === "number") {
            for (d = 0; d < c; d += 1) {
                indent += " ";
            }
        } else if (typeof c === "string") {
            indent = c;
        }

        rep = b;

        // Validate replacer.
        if (!b || typeof b === "function" || typeof b === "object" && typeof b.length === "number") {
            return str("", {
                "": a
            });
        }
        throw new Error("JSON.stringify");
    });

    // Implement JSON.parse if it doesn't exist.
    typeof JSON.parse !== "function" && (JSON.parse = function(text, reviver) {
        // Recursive walk function for reviver.
        function walk(a, b) {
            var c, d, e = a[b];
            if (e && typeof e === "object") {
                for (c in e) {
                    Object.prototype.hasOwnProperty.call(e, c) && (d = walk(e, c), d !== undefined ? e[c] = d : delete e[c]);
                }
            }
            return reviver.call(a, b, e);
        }

        var j;
        text = String(text);
        cx.lastIndex = 0;

        // Escape control characters.
        cx.test(text) && (text = text.replace(cx, function(a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }));

        // Validate and parse the JSON string.
        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
            j = eval("(" + text + ")"); // Use eval for parsing.
            return typeof reviver === "function" ? walk({
                "": j
            }, "") : j;
        }
        throw new SyntaxError("JSON.parse");
    });
})();


//     [*] Including lib/index.js
// Public object definition for SockJS.
var SockJS = (function() {

    // Internal references to document and window objects for minification/scoping.
    var _document = document;
    var _window = window;

    // Utility functions object. Will be populated by other includes.
    var utils = {};


    //         [*] Including lib/reventtarget.js
    /*
     * ***** BEGIN LICENSE BLOCK *****
     * Copyright (c) 2011-2012 VMware, Inc.
     *
     * For the license see COPYING.
     * ***** END LICENSE BLOCK *****
     */

    /* Simplified implementation of DOM2 EventTarget.
     * Based on the W3C specification: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
     */
    var REventTarget = function() {
        // Constructor for REventTarget. No special initialization needed beyond what's on the prototype.
    };

    // Adds an event listener for a specific event type.
    REventTarget.prototype.addEventListener = function(eventType, listener) {
        // Initialize listeners object if it doesn't exist.
        if (!this._listeners) {
            this._listeners = {};
        }

        // Initialize array for this event type if it doesn't exist.
        if (!(eventType in this._listeners)) {
            this._listeners[eventType] = [];
        }

        var arr = this._listeners[eventType];

        // Add listener only if it's not already present.
        if (utils.arrIndexOf(arr, listener) === -1) {
            arr.push(listener);
        }
        return; // Explicit return.
    };

    // Removes an event listener.
    REventTarget.prototype.removeEventListener = function(eventType, listener) {
        // Check if listeners exist for this event type.
        if (!(this._listeners && (eventType in this._listeners))) {
            return; // Nothing to remove.
        }

        var arr = this._listeners[eventType];
        var idx = utils.arrIndexOf(arr, listener);

        if (idx !== -1) {
            // If listener found, remove it.
            if (arr.length > 1) {
                // If more than one listener, create a new array without the target listener.
                this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
            } else {
                // If only one listener, delete the event type entry.
                delete this._listeners[eventType];
            }
            return; // Listener successfully removed.
        }
        return; // Listener not found.
    };

    // Dispatches an event to all registered listeners.
    REventTarget.prototype.dispatchEvent = function(event) {
        var t = event.type;
        // Convert arguments to a real array, excluding the 'event' object itself.
        var args = Array.prototype.slice.call(arguments, 0);

        // Call 'on' handler if it exists.
        if (this['on' + t]) {
            this['on' + t].apply(this, args);
        }

        // Call all registered listeners for this event type.
        if (this._listeners && t in this._listeners) {
            for (var i = 0; i < this._listeners[t].length; i++) {
                this._listeners[t][i].apply(this, args);
            }
        }
    };
    //         [*] End of lib/reventtarget.js


    //         [*] Including lib/simpleevent.js
    /*
     * ***** BEGIN LICENSE BLOCK *****
     * Copyright (c) 2011-2012 VMware, Inc.
     *
     * For the license see COPYING.
     * ***** END LICENSE BLOCK *****
     */

    // Constructor for a simple event object.
    var SimpleEvent = function(type, obj) {
        this.type = type; // The type of the event.

        // If an object is provided, copy its properties to the event instance.
        if (typeof obj !== 'undefined') {
            for (var k in obj) {
                // Ensure the property belongs to the object itself, not its prototype chain.
                if (!obj.hasOwnProperty(k)) continue;
                this[k] = obj[k];
            }
        }
    };

    // Provides a string representation of the SimpleEvent object.
    SimpleEvent.prototype.toString = function() {
        var r = [];
        for (var k in this) {
            if (!this.hasOwnProperty(k)) continue; // Only own properties.
            var v = this[k];
            if (typeof v === 'function') v = '[function]'; // Mask functions for readability.
            r.push(k + '=' + v);
        }
        return 'SimpleEvent(' + r.join(', ') + ')';
    };
    //         [*] End of lib/simpleevent.js


    //         [*] Including lib/eventemitter.js
    /*
     * ***** BEGIN LICENSE BLOCK *****
     * Copyright (c) 2011-2012 VMware, Inc.
     *
     * For the license see COPYING.
     * ***** END LICENSE BLOCK *****
     */

    // EventEmitter constructor.
    var EventEmitter = function(events) {
        var that = this;
        that._events = events || []; // Array of allowed event types.
        that._listeners = {}; // Object to store event listeners.
    };

    // Emits an event, triggering all registered listeners.
    EventEmitter.prototype.emit = function(type) {
        var that = this;
        that._verifyType(type); // Validate the event type.

        if (that._nuked) return; // If nuked, do nothing.

        // Collect arguments to pass to listeners, excluding the event type itself.
        var args = Array.prototype.slice.call(arguments, 1);

        // Call the 'on[type]' handler if it exists.
        if (that['on' + type]) {
            that['on' + type].apply(that, args);
        }

        // Call all specific listeners for this event type.
        if (type in that._listeners) {
            for (var i = 0; i < that._listeners[type].length; i++) {
                that._listeners[type][i].apply(that, args);
            }
        }
    };

    // Registers a callback function for a given event type.
    EventEmitter.prototype.on = function(type, callback) {
        var that = this;
        that._verifyType(type); // Validate the event type.

        if (that._nuked) return; // If nuked, do nothing.

        // Initialize listener array for this type if it doesn't exist.
        if (!(type in that._listeners)) {
            that._listeners[type] = [];
        }
        that._listeners[type].push(callback); // Add the callback.
    };

    // Internal method to verify if an event type is allowed.
    EventEmitter.prototype._verifyType = function(type) {
        var that = this;
        if (utils.arrIndexOf(that._events, type) === -1) {
            // Log an error if the event type is not in the allowed list.
            utils.log('Event ' + JSON.stringify(type) +
                ' not listed ' + JSON.stringify(that._events) +
                ' in ' + that);
        }
    };

    // Cleans up the EventEmitter, removing all listeners and handlers.
    EventEmitter.prototype.nuke = function() {
        var that = this;
        that._nuked = true; // Mark as nuked.

        // Delete 'on' handlers.
        for (var i = 0; i < that._events.length; i++) {
            delete that[that._events[i]];
        }
        that._listeners = {}; // Clear all listeners.
    };
    //         [*] End of lib/eventemitter.js


    //         [*] Including lib/utils.js
    /*
     * ***** BEGIN LICENSE BLOCK *****
     * Copyright (c) 2011-2012 VMware, Inc.
     *
     * For the license see COPYING.
     * ***** END LICENSE BLOCK *****
     */

    // Characters used for generating random strings.
    var random_string_chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';

    // Generates a random string of a specified length.
    utils.random_string = function(length, max) {
        max = max || random_string_chars.length; // Max index for characters.
        var i, ret = [];
        for (i = 0; i < length; i++) {
            ret.push(random_string_chars.substr(Math.floor(Math.random() * max), 1));
        }
        return ret.join('');
    };

    // Generates a random number less than 'max'.
    utils.random_number = function(max) {
        return Math.floor(Math.random() * max);
    };

    // Generates a random number as a zero-padded string.
    utils.random_number_string = function(max) {
        var t = ('' + (max - 1)).length; // Determine padding length.
        var p = Array(t + 1).join('0'); // Create padding string.
        return (p + utils.random_number(max)).slice(-t); // Pad and return.
    };

    // Extracts the origin (protocol://host:port) from a given URL.
    utils.getOrigin = function(url) {
        url += '/'; // Ensure trailing slash for consistent splitting.
        var parts = url.split('/').slice(0, 3);
        return parts.join('/');
    };

    // Checks if two URLs have the same origin.
    utils.isSameOriginUrl = function(url_a, url_b) {
        // Use current window location if url_b is not provided.
        if (!url_b) url_b = _window.location.href;

        // Compare origins.
        return (url_a.split('/').slice(0, 3).join('/') ===
            url_b.split('/').slice(0, 3).join('/'));
    };

    // Gets the parent domain of a given URL (e.g., 'www.example.com' -> 'example.com').
    utils.getParentDomain = function(url) {
        // Handle IP addresses directly.
        if (/^[0-9.]*$/.test(url)) return url; // IPv4
        if (/^\[/.test(url)) return url; // IPv6

        // If no dots, return as is.
        if (!(/[.]/.test(url))) return url;

        var parts = url.split('.').slice(1);
        return parts.join('.');
    };

    // Extends a destination object with properties from a source object.
    utils.objectExtend = function(dst, src) {
        for (var k in src) {
            if (src.hasOwnProperty(k)) {
                dst[k] = src[k];
            }
        }
        return dst;
    };

    var WPrefix = '_jp'; // Prefix for global namespace pollution.

    // Ensures a global object exists under the WPrefix.
    utils.polluteGlobalNamespace = function() {
        if (!(WPrefix in _window)) {
            _window[WPrefix] = {};
        }
    };

    // Returns a string representation of a closed frame message.
    utils.closeFrame = function(code, reason) {
        return 'c' + JSON.stringify([code, reason]);
    };

    // Checks if a given code is a user-defined close code.
    utils.userSetCode = function(code) {
        return code === 1000 || (code >= 3000 && code <= 4999);
    };

    // Calculates RTO (Retransmission Timeout) based on RTT (Round Trip Time).
    // See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
    // and RFC 2988.
    utils.countRTO = function(rtt) {
        var rto;
        if (rtt > 100) {
            rto = 3 * rtt; // RTO should be greater than 300ms.
        } else {
            rto = rtt + 200; // RTO should be between 200ms and 300ms.
        }
        return rto;
    };

    // Logs messages to the console if available.
    utils.log = function() {
        if (_window.console && console.log && console.log.apply) {
            console.log.apply(console, arguments);
        }
    };

    // Binds a function to a specific 'this' context.
    utils.bind = function(fun, that) {
        if (fun.bind) {
            return fun.bind(that); // Use native bind if available.
        } else {
            // Fallback for older browsers.
            return function() {
                return fun.apply(that, arguments);
            };
        }
    };

    // Checks if a URL contains no query string or hash.
    utils.flatUrl = function(url) {
        return url.indexOf('?') === -1 && url.indexOf('#') === -1;
    };

    // Amends a URL to be absolute and normalized.
    utils.amendUrl = function(url) {
        var dl = _document.location;

        if (!url) {
            throw new Error('Wrong url for SockJS');
        }
        if (!utils.flatUrl(url)) {
            throw new Error('Only basic urls are supported in SockJS');
        }

        // Handle protocol-relative URLs (e.g., '//abc' -> 'http://abc').
        if (url.indexOf('//') === 0) {
            url = dl.protocol + url;
        }
        // Handle path-relative URLs (e.g., '/abc' -> 'http://localhost:80/abc').
        if (url.indexOf('/') === 0) {
            url = dl.protocol + '//' + dl.host + url;
        }

        // Strip any trailing slashes.
        url = url.replace(/[/]+$/, '');
        return url;
    };

    // Custom implementation of Array.prototype.indexOf for IE compatibility.
    utils.arrIndexOf = function(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === obj) {
                return i;
            }
        }
        return -1;
    };

    // Returns a new array with the specified object skipped (removed).
    utils.arrSkip = function(arr, obj) {
        var idx = utils.arrIndexOf(arr, obj);
        if (idx === -1) {
            return arr.slice(); // If not found, return a shallow copy.
        } else {
            var dst = arr.slice(0, idx); // Elements before.
            return dst.concat(arr.slice(idx + 1)); // Elements after.
        }
    };

    // Checks if a value is an array. Uses native Array.isArray if available.
    // Via: https://gist.github.com/1133122/2121c601c5549155483f50be3da5305e83b8c5df
    utils.isArray = Array.isArray || function(value) {
        return {}.toString.call(value).indexOf('Array') >= 0;
    };

    // Delays execution of a function. Can take (fun) or (t, fun).
    utils.delay = function(t, fun) {
        if (typeof t === 'function') {
            fun = t; // If first arg is function, it's the callback.
            t = 0; // Default delay to 0.
        }
        return setTimeout(fun, t);
    };


    // Chars worth escaping, as defined by Douglas Crockford:
    // https://github.com/douglascrockford/JSON-js/blob/47a9882cddeb1e8529e07af9736218075372b8ac/json2.js#L196
    var json_escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        json_lookup = {
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

    // Some extra characters that Chrome gets wrong, and substitutes with
    // something else on the wire. This regex covers unicode surrogates and other problematic chars.
    var extra_escapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
        extra_lookup;

    // JSON Quote string function. Prefers native JSON.stringify for performance.
    var JSONQuote = (JSON && JSON.stringify) || function(string) {
        json_escapable.lastIndex = 0;
        if (json_escapable.test(string)) {
            string = string.replace(json_escapable, function(a) {
                return json_lookup[a];
            });
        }
        return '"' + string + '"';
    };

    // Unrolls the lookup table for escapable characters.
    // This may be quite slow, so it's delayed until user actually uses bad characters.
    var unroll_lookup = function(escapable) {
        var i;
        var unrolled = {};
        var c = [];
        for (i = 0; i < 65536; i++) {
            c.push(String.fromCharCode(i));
        }
        escapable.lastIndex = 0;
        c.join('').replace(escapable, function(a) {
            unrolled[a] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            return '';
        });
        escapable.lastIndex = 0;
        return unrolled;
    };

    // Quotes a string, also handling unicode characters that browsers might mishandle,
    // especially unicode surrogates: http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
    utils.quote = function(string) {
        var quoted = JSONQuote(string);

        // In most cases, this initial check should be very fast and sufficient.
        extra_escapable.lastIndex = 0;
        if (!extra_escapable.test(quoted)) {
            return quoted;
        }

        // If extra escaping is needed, build the lookup table (if not already built).
        if (!extra_lookup) extra_lookup = unroll_lookup(extra_escapable);

        // Apply extra escaping.
        return quoted.replace(extra_escapable, function(a) {
            return extra_lookup[a];
        });
    };

    // List of all supported SockJS protocols.
    var _all_protocols = ['websocket',
        'xdr-streaming',
        'xhr-streaming',
        'iframe-eventsource',
        'iframe-htmlfile',
        'xdr-polling',
        'xhr-polling',
        'iframe-xhr-polling',
        'jsonp-polling'
    ];

    // Probes for enabled protocols based on SockJS capabilities.
    utils.probeProtocols = function() {
        var probed = {};
        for (var i = 0; i < _all_protocols.length; i++) {
            var protocol = _all_protocols[i];
            // Check if the protocol is defined and enabled in the SockJS object.
            // This also helps catch typos in protocol names.
            probed[protocol] = SockJS[protocol] &&
                SockJS[protocol].enabled();
        }
        return probed;
    };

    // Detects and orders available protocols based on probing results, whitelist, and connection info.
    utils.detectProtocols = function(probed, protocols_whitelist, info) {
        var pe = {},
            protocols = [];

        // If no whitelist is provided, use all known protocols.
        if (!protocols_whitelist) protocols_whitelist = _all_protocols;

        // Filter probed protocols by the whitelist.
        for (var i = 0; i < protocols_whitelist.length; i++) {
            var protocol = protocols_whitelist[i];
            pe[protocol] = probed[protocol];
        }

        // Helper function to conditionally push a protocol (or group of protocols)
        // if it's enabled.
        var maybe_push = function(protos) {
            var proto = protos.shift(); // Get the first protocol in the group.
            if (pe[proto]) {
                protocols.push(proto); // If enabled, add it to the list.
            } else {
                if (protos.length > 0) {
                    maybe_push(protos); // Otherwise, try the next protocol in the group.
                }
            }
        };

        // 1. Websocket protocol.
        if (info.websocket !== false) {
            maybe_push(['websocket']);
        }

        // 2. Streaming protocols.
        if (pe['xhr-streaming'] && !info.null_origin) {
            protocols.push('xhr-streaming');
        } else {
            // Fallback to XDR streaming or iframe-based streaming.
            if (pe['xdr-streaming'] && !info.cookie_needed && !info.null_origin) {
                protocols.push('xdr-streaming');
            } else {
                maybe_push(['iframe-eventsource',
                    'iframe-htmlfile'
                ]);
            }
        }