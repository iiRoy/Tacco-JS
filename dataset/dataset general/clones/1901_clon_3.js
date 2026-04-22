// Module for encoding and decoding data to/from URL hash fragments.
define(function () {
    'use strict';

    // Internal utility: Checks if a given string contains characters forbidden as hash fragment delimiters.
    // This is crucial for maintaining the integrity of the key-value pair and segment separators.
    function checkForbiddenChars(inputString) {
        // Using a regular expression for a concise and efficient check.
        // It looks for a colon (':') or a comma (',').
        if (/[ :,]/.test(inputString)) {
            // Updated error message to be more specific about the violation.
            throw new Error(`Fragment segment or property value "${inputString}" contains forbidden characters (colon or comma).`);
        }
    }

    // Internal utility: Transforms an encoded string value from the hash fragment into its appropriate JavaScript type.
    // Handles booleans, numbers, null, undefined, and falls back to string if no other type matches.
    function typeCoerceString(encodedValue) {
        // Ensure the input is a string and decode it using modern URL methods. Trim whitespace.
        let processedValue = decodeURIComponent(String(encodedValue || '')).trim();

        // A lookup map for quick conversion of common primitive string representations.
        const primitiveMap = {
            'true': true,
            'false': false,
            'null': null,
            'undefined': undefined
        };

        // Check if the processed value is one of the predefined primitive strings.
        if (Object.prototype.hasOwnProperty.call(primitiveMap, processedValue)) {
            return primitiveMap[processedValue];
        }

        // Attempt to parse the value as a number.
        // Using Number() for explicit type conversion, which handles integers and floats.
        let numericVal = Number(processedValue);
        // Check if the conversion resulted in a valid number (not NaN).
        if (!Number.isNaN(numericVal)) {
            return numericVal;
        }

        // If no special type was matched, the value is treated as a plain string.
        return processedValue;
    }

    /**
     * Decodes a URL hash fragment string into a JavaScript object.
     * Expected format: "#key1:value1,key2:value2,key3". Keys without values default to `true`.
     * @param {string} fragmentString The hash string to be parsed (e.g., "#foo:bar,baz,num:123").
     * @returns {Object.<string, string|number|boolean|null|undefined>} An object representing the decoded data.
     */
    function decodeFragmentData(fragmentString) {
        let decodedData = {}; // The result object, renamed from 'ret'.

        // Early exit: If input is not a string or is empty, return an empty object immediately.
        if (typeof fragmentString !== 'string' || fragmentString.length === 0) {
            return decodedData;
        }

        // Remove the leading '#' character if it exists. Use slice(1) for cleaner string manipulation.
        let effectiveString = fragmentString.startsWith('#') ? fragmentString.slice(1) : fragmentString;

        // If the string becomes empty after removing '#', return an empty object.
        if (effectiveString.length === 0) {
            return decodedData;
        }

        // Split the effective string into individual segments using ','.
        // Iterating with a `for...of` loop, a modern alternative to `forEach`.
        const segments = effectiveString.split(',');
        for (const segment of segments) {
            // Skip any empty segments that might occur from multiple commas (e.g., "a,,b").
            if (!segment.trim()) continue;

            // Split each segment into key and value parts using ':'.
            let segmentParts = segment.split(':');
            const key = segmentParts[0].trim(); // Extract and trim the key.

            if (segmentParts.length === 1) {
                // If only a key is present (e.g., "key3"), its value is implicitly true.
                decodedData[key] = true;
            } else if (segmentParts.length === 2) {
                // If both key and value are present, decode and coerce the value part.
                decodedData[key] = typeCoerceString(segmentParts[1]); // Call the renamed internal helper.
            } else {
                // Throw an error for malformed segments with too many colons.
                throw new Error(`Malformed fragment segment: "${segment}". Expected "key" or "key:value" format.`);
            }
        }
        return decodedData;
    }

    /**
     * Serializes a JavaScript object into a URL hash fragment string.
     * The object's properties will be converted into a hash string like "#key1:value1,key2:value2".
     * @param {Object.<string, string|number|boolean|null|undefined>} dataObject The object to be serialized.
     * @returns {string} The serialized hash fragment string (e.g., "#foo:bar,baz:true,num:42").
     */
    function serializeDataObject(dataObject) {
        let serializedFragments = []; // An array to collect individual key-value fragments.

        // Early exit: If the input is not a valid object (null, undefined, or non-object type), return an empty string.
        if (typeof dataObject !== 'object' || dataObject === null) {
            return '';
        }

        // Iterate over the object's own enumerable properties using a `for...in` loop.
        // This provides a different iteration pattern compared to `Object.keys().map()`.
        for (const propName in dataObject) {
            // Ensure that the property belongs to the object itself, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(dataObject, propName)) {
                // Validate the property name itself for forbidden characters.
                if (/[ :,]/.test(propName)) {
                    throw new Error(`Property name "${propName}" contains forbidden characters for hash serialization.`);
                }

                let propValue = dataObject[propName];
                let stringifiedValue;

                // Explicitly handle different primitive types for consistent serialization.
                if (propValue === null) {
                    stringifiedValue = 'null';
                } else if (propValue === undefined) {
                    stringifiedValue = 'undefined';
                } else if (typeof propValue === 'boolean') {
                    stringifiedValue = propValue.toString();
                } else if (typeof propValue === 'number' && Number.isNaN(propValue)) {
                    stringifiedValue = 'NaN'; // Represent NaN explicitly.
                } else {
                    // For all other types, convert to string.
                    stringifiedValue = String(propValue);
                }

                // Apply the forbidden character check to the *original* stringified value.
                // This ensures that the raw data itself adheres to the "simple strings" rule before encoding.
                checkForbiddenChars(stringifiedValue);

                // Encode the stringified value using modern URL encoding.
                let encodedValue = encodeURIComponent(stringifiedValue);

                // Use template literals for cleaner and more readable string construction.
                serializedFragments.push(`${propName}:${encodedValue}`);
            }
        }

        // If there are no fragments to serialize, return an empty string.
        // Otherwise, prepend '#' and join the fragments with a comma.
        return serializedFragments.length > 0 ? '#' + serializedFragments.join(',') : '';
    }

    // Expose the public API functions of this module.
    // The internal `typeCoerceString` is not exposed, demonstrating encapsulation.
    return {
        parseFragment: decodeFragmentData, // Renamed 'parseHash' to 'parseFragment'.
        buildFragment: serializeDataObject // Renamed 'makeHash' to 'buildFragment'.
    };
});