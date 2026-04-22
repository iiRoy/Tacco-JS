if (typeof JSON !== 'object')
{
    // Initialize the global JSON object if it doesn't already exist.
    JSON = {};
}

// Export the JSON object for Node.js environments.
module.exports = JSON;

// Immediately Invoked Function Expression (IIFE) to encapsulate the implementation.
!(function () {
    // Enforce strict mode for cleaner code and better error handling.
    'use strict';

    /**
     * Formats an integer to ensure it has at least two digits, padding with a leading zero if necessary.
     * This utility function is primarily used for date and time formatting.
     * @param {number} n The integer to format.
     * @returns {string} The formatted string representation of the integer.
     */
    function f(n) {
        // Check if the number is less than 10; if so, prepend a '0'.
        return n < 10 ? '0' + n : n;
    }

    // Check if the Date prototype already has a toJSON method.
    if (typeof Date.prototype.toJSON !== 'function') {

        // If not, define a custom toJSON method for Date objects.
        Date.prototype.toJSON = function () {

            // Only format finite date values; otherwise, return null.
            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' + // Month is 0-indexed, so add 1.
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z' // 'Z' indicates UTC time.
                : null;
        };

        // Also define toJSON methods for primitive wrapper objects (String, Number, Boolean).
        // These simply return their primitive value.
        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    // Declare several variables that will be used throughout the JSON implementation.
    var cx,               // Regular expression for control characters in JSON.parse.
        escapable,        // Regular expression for characters that need escaping in JSON.stringify.
        gap,              // Current indentation string.
        indent,           // Indentation string for a single level.
        meta,             // Lookup table for character escape sequences.
        rep;              // The replacer function or array provided to JSON.stringify.

    /**
     * Encloses a string in double quotes and escapes any necessary characters.
     * This function is crucial for producing valid JSON string values.
     * @param {string} string The input string to quote.
     * @returns {string} The quoted and escaped string.
     */
    function quote(string) {

        // Reset the lastIndex of the escapable regex before testing.
        escapable.lastIndex = 0;

        // If the string contains characters that need escaping, process them.
        return escapable.test(string)
            ? '"' + string.replace(escapable, function (a) {
                // Look up the character in the meta table or format as Unicode escape.
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"'
            : '"' + string + '"'; // Otherwise, just add quotes.
    }


    /**
     * Recursive helper function to stringify a value.
     * It handles different data types and applies replacers and indentation.
     * @param {string} key The key associated with the value in its parent object/array.
     * @param {object} holder The parent object or array holding the value.
     * @returns {string|undefined} The JSON string representation of the value, or undefined if it should be omitted.
     */
    function str(key, holder) {

        // Declare local variables for the stringification process.
        var i,          // Loop counter.
            k,          // Member key (property name).
            v,          // Member value (stringified).
            length,     // Length of arrays or replacer arrays.
            mind = gap, // Store the current indentation level before recursing.
            partial,    // Array to hold stringified members.
            value = holder[key]; // The actual value to be stringified.

        // If the value has a custom toJSON method, call it to get a replacement value.
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If a replacer function was provided to JSON.stringify, apply it.
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // Determine how to stringify based on the value's type.
        switch (typeof value) {
            case 'string':
                // String values are quoted and escaped.
                return quote(value);

            case 'number':
                // JSON numbers must be finite. Non-finite numbers are converted to 'null'.
                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                // Boolean and null values are directly converted to their string equivalents.
                return String(value);

            case 'object':
                // Handle objects, arrays, and null (since typeof null is 'object').

                // If the value is null, return the string 'null'.
                if (!value) {
                    return 'null';
                }

                // Prepare for recursive stringification: increase indentation and initialize partial results.
                gap += indent;
                partial = [];

                // Check if the value is an array using the robust toString method.
                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // Iterate over array elements.
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        // Stringify each element; use 'null' for non-JSON values (e.g., undefined, functions).
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join the elements, applying indentation if 'gap' is present.
                    v = partial.length === 0
                        ? '[]'
                        : gap
                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                            : '[' + partial.join(',') + ']';
                    gap = mind; // Restore previous indentation level.
                    return v;
                }

                // If a replacer array is provided, use it to select object members.
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value); // Recursively stringify the member.
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v); // Add key:value pair.
                            }
                        }
                    }
                } else {
                    // Otherwise, iterate over all enumerable properties of the object.
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value); // Recursively stringify the member.
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v); // Add key:value pair.
                            }
                        }
                    }
                }

                // Join the object members, applying indentation if 'gap' is present.
                v = partial.length === 0
                    ? '{}'
                    : gap
                        ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                        : '{' + partial.join(',') + '}';
                gap = mind; // Restore previous indentation level.
                return v;
        }
    }

    // Implement JSON.stringify if it's not natively available.
    if (typeof JSON.stringify !== 'function') {
        // Define the regular expression for characters that must be escaped in JSON strings.
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        // Create a lookup table for common character escape sequences.
        meta = { // This table maps special characters to their JSON escape sequences.
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };

        // Assign the custom stringify implementation.
        JSON.stringify = function (value, replacer, space) {

            var i; // Loop counter for indent generation.
            gap = ''; // Reset the global indentation string for each call.
            indent = ''; // Reset the single-level indentation string.

            // If 'space' is a number, create an indentation string with that many spaces.
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
                // If 'space' is a string, use it directly as the indentation string.
            } else if (typeof space === 'string') {
                indent = space;
            }

            // Store the replacer function or array.
            rep = replacer;

            // Validate the replacer argument. It must be a function, an array, or undefined/null.
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify'); // Throw an error for invalid replacer.
            }

            // Begin stringification by creating a fake root object and calling the recursive 'str' function.
            // The value is placed under an empty string key to handle the root object/array correctly.
            return str('', {
                '': value
            });
        };
    }


    // Implement JSON.parse if it's not natively available.
    if (typeof JSON.parse !== 'function') {
        // Define the regular expression for control characters that must be escaped during parsing.
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        // Assign the custom parse implementation.
        JSON.parse = function (text, reviver) {

            var j; // Variable to hold the parsed JavaScript value.

            /**
             * Recursive 'walk' function for applying the reviver.
             * It traverses the parsed structure and allows modification of values.
             * @param {object} holder The parent object/array.
             * @param {string} key The key of the current value within the holder.
             * @returns {*} The potentially transformed value.
             */
            function walk(holder, key) {

                var k, v, value = holder[key]; // Get the current value.

                // If the value is an object, recursively walk its properties.
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k); // Process the child value.
                            if (v !== undefined) {
                                value[k] = v; // Update if the reviver returned a value.
                            } else {
                                delete value[k]; // Delete if the reviver returned undefined.
                            }
                        }
                    }
                }
                // Call the reviver function for the current key-value pair.
                return reviver.call(holder, key, value);
            }

            // Convert the input to a string and handle certain Unicode characters.
            text = String(text);
            cx.lastIndex = 0; // Reset regex lastIndex.
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // Perform a series of regular expression tests to validate the JSON string.
            // This is a critical security step to prevent arbitrary code execution via 'eval'.
            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@') // Replace escaped sequences with '@'.
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']') // Replace literals with ']'.
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { // Remove array opening brackets after certain tokens.

                // If the validation passes, use 'eval' to parse the JSON string into a JavaScript object.
                // Wrapping in parens '(' + text + ')' avoids ambiguity for objects starting with '{'.
                j = eval('(' + text + ')');

                // If a reviver function is provided, apply it recursively; otherwise, return the parsed object directly.
                return typeof reviver === 'function'
                    ? walk({
                        '': j
                    }, '')
                    : j;
            }

            // If validation fails, the text is not valid JSON, so throw a SyntaxError.
            throw new SyntaxError('JSON.parse');
        };
    }
}()); // End of the IIFE.