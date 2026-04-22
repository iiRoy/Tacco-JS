const dbClient = require('mongoose');

// Pattern for characters that require escaping in JSON strings.
const specialCharPattern = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Global variables for serialization state.
let currentIndentation = '';     // Tracks the current indentation level for pretty printing
let indentationUnit = '';        // Stores the string used for one level of indentation
let keyFilter = null;            // Holds the replacer function or array

// Map of special characters to their escaped JSON representations.
const charEscapes = Object.freeze({
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
});

// Helper constant for null string representation
const NULL_STRING_VALUE = 'null';

/**
 * Escapes and wraps a string in double quotes for JSON serialization.
 *
 * @param {string} inputString The string to process.
 * @returns {string} The JSON-quoted and escaped string.
 */
function wrapAndEscape(inputString) {
    // Reset lastIndex for reliable regex testing.
    specialCharPattern.lastIndex = 0;

    // Check if the string contains any characters that need escaping.
    if (specialCharPattern.test(inputString)) {
        return '"' + inputString.replace(specialCharPattern, function (matchedChar) {
            const escapedForm = charEscapes[matchedChar];
            // If a direct escape sequence exists, use it.
            // Otherwise, convert the character to its Unicode escape sequence.
            return typeof escapedForm === 'string'
                ? escapedForm
                : '\\u' + ('0000' + matchedChar.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    } else {
        // If no special characters, just wrap in quotes.
        return '"' + inputString + '"';
    }
}

/**
 * Recursively serializes a JavaScript value into a JSON string fragment.
 * This is the core serialization logic.
 *
 * @param {string | number | null} currentKey The key of the current value within its parent object/array.
 * @param {object} parentObject The parent object or array holding the current value.
 * @returns {string | undefined} The JSON string representation of the value, or 'undefined' if it should be omitted.
 */
function serializeValue(currentKey, parentObject) {
    let loopIndex;
    let memberKey;
    let serializedItem;
    let collectionLength;
    const previousIndentation = currentIndentation;
    let tempParts;
    let targetValue = parentObject[currentKey];

    // Handle Mongoose ObjectId values specifically.
    if (targetValue instanceof dbClient.Types.ObjectId) {
        return `ObjectId("${targetValue.toString()}")`;
    }
    // Handle Date objects specifically.
    if (targetValue instanceof Date) {
        return targetValue.toJSON ? `ISODate("${targetValue.toJSON()}")` : wrapAndEscape(targetValue.toISOString());
    }

    // If the value has a toJSON method, call it to get the serializable representation.
    if (targetValue && typeof targetValue === 'object' && typeof targetValue.toJSON === 'function') {
        targetValue = targetValue.toJSON(currentKey);
    }

    // Apply the replacer function if provided.
    if (typeof keyFilter === 'function') {
        targetValue = keyFilter.call(parentObject, currentKey, targetValue);
    }

    // Handle primitive types and null.
    switch (typeof targetValue) {
        case 'string':
            return wrapAndEscape(targetValue);
        case 'number':
            return Number.isFinite(targetValue) ? String(targetValue) : NULL_STRING_VALUE;
        case 'boolean':
            return String(targetValue);
        case 'object':
            if (!targetValue) {
                return NULL_STRING_VALUE;
            }

            const isPrettyPrinting = indentationUnit !== '';

            if (isPrettyPrinting) {
                currentIndentation += indentationUnit;
            }
            tempParts = [];

            // --- Array Serialization ---
            if (Array.isArray(targetValue)) {
                collectionLength = targetValue.length;
                for (loopIndex = 0; loopIndex < collectionLength; loopIndex += 1) {
                    const arrayElementStr = serializeValue(loopIndex, targetValue);
                    tempParts[loopIndex] = arrayElementStr !== undefined ? arrayElementStr : NULL_STRING_VALUE;
                }

                let finalArrayString;
                if (tempParts.length === 0) {
                    finalArrayString = '[]';
                } else if (isPrettyPrinting) {
                    finalArrayString = '[\n' + currentIndentation +
                                       tempParts.join(',\n' + currentIndentation) +
                                       '\n' + previousIndentation + ']';
                } else {
                    finalArrayString = '[' + tempParts.join(',') + ']';
                }
                currentIndentation = previousIndentation;
                return finalArrayString;
            }

            // --- Object Serialization ---
            if (keyFilter && Array.isArray(keyFilter)) {
                collectionLength = keyFilter.length;
                for (loopIndex = 0; loopIndex < collectionLength; loopIndex += 1) {
                    if (typeof keyFilter[loopIndex] === 'string') {
                        memberKey = keyFilter[loopIndex];
                        serializedItem = serializeValue(memberKey, targetValue);
                        if (serializedItem !== undefined) {
                            tempParts.push(wrapAndEscape(memberKey) + (isPrettyPrinting ? ': ' : ':') + serializedItem);
                        }
                    }
                }
            } else {
                Object.keys(targetValue).forEach(objKey => {
                    serializedItem = serializeValue(objKey, targetValue);
                    if (serializedItem !== undefined) {
                        tempParts.push(wrapAndEscape(objKey) + (isPrettyPrinting ? ': ' : ':') + serializedItem);
                    }
                });
            }

            let finalObjectString;
            if (tempParts.length === 0) {
                finalObjectString = '{}';
            } else if (isPrettyPrinting) {
                finalObjectString = '{\n' + currentIndentation +
                                   tempParts.join(',\n' + currentIndentation) +
                                   '\n' + previousIndentation + '}';
            } else {
                finalObjectString = '{' + tempParts.join(',') + '}';
            }
            currentIndentation = previousIndentation;
            return finalObjectString;
        case 'undefined':
        case 'function':
        case 'symbol':
            return undefined;
        default:
            return undefined;
    }
}

/**
 * Converts a JavaScript value to a JSON string, similar to JSON.stringify.
 *
 * @param {any} initialValue The value to convert to a JSON string.
 * @param {function | string[] | null} customReplacer An optional function that alters the serialization process,
 *                                             or an array of strings that acts as a whitelist for properties.
 * @param {string | number | null} prettyPrintSpacer An optional string or number of spaces to use for indentation.
 * @returns {string | undefined} The JSON string representation of the value.
 */
exports.toJSONString = function (initialValue, customReplacer, prettyPrintSpacer) {
    if (typeof initialValue === 'undefined' || typeof initialValue === 'function' || typeof initialValue === 'symbol') {
        return undefined;
    }

    currentIndentation = '';
    indentationUnit = '';

    if (typeof prettyPrintSpacer === 'number' && prettyPrintSpacer > 0) {
        const numSpaces = Math.min(10, Math.floor(prettyPrintSpacer));
        indentationUnit = ' '.repeat(numSpaces);
    } else if (typeof prettyPrintSpacer === 'string' && prettyPrintSpacer.length > 0) {
        indentationUnit = prettyPrintSpacer.substring(0, 10);
    }

    keyFilter = customReplacer;

    if (keyFilter && typeof keyFilter !== 'function' &&
        (!Array.isArray(keyFilter) || typeof keyFilter.length !== 'number')) {
        throw new Error('CustomJSON.stringify: Replacer must be a function or an array of strings.');
    }

    const ROOT_KEY_NAME = '';
    return serializeValue(ROOT_KEY_NAME, { [ROOT_KEY_NAME]: initialValue });
};