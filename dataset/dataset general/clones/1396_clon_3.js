// This module provides a robust JSON parsing utility, designed for clarity and explicit error handling.
// It implements a recursive descent parser, avoiding 'eval' for security and performance.
// The parsing functions are encapsulated within a self-executing anonymous function to prevent global scope pollution.
const parseJsonData = (function () {
    "use strict";

    // --- Parser State Variables ---
    let currentPosition = 0;   // The zero-based index of the character currently being examined in the source string.
    let currentChar = ' ';     // The character at `currentPosition`. Initialized to space to allow initial whitespace skip.
    let sourceContent = '';    // The complete JSON string provided for parsing.
    let parsingDepth = 0;      // Tracks the current recursion level for nested objects and arrays.

    // --- Configuration Constants ---
    // A mapping for JSON escape sequences to their corresponding JavaScript character representations.
    const charEscapeLookup = {
        '"':  '"',
        '\\': '\\',
        '/':  '/',
        b:    '\b',  // Backspace
        f:    '\f',  // Form feed
        n:    '\n',  // Newline
        r:    '\r',  // Carriage return
        t:    '\t'   // Tab
    };

    // Defines the maximum allowable nesting depth for JSON structures.
    // This helps prevent stack overflow errors with maliciously crafted or excessively deep JSON.
    const MAX_NESTING_DEPTH = 512;

    // --- Core Utility Functions ---

    /**
     * Throws a structured SyntaxError, providing details about the parsing failure.
     * Includes the error message, the position in the input, and a snippet of the offending text.
     * @param {string} message - A descriptive error message.
     */
    const signalParsingError = function (message) {
        const contextStart = Math.max(0, currentPosition - 15);
        const contextEnd = Math.min(sourceContent.length, currentPosition + 15);
        const errorSnippet = sourceContent.substring(contextStart, contextEnd);
        throw {
            errorType:    'SyntaxError',
            description:  message,
            position:     currentPosition,
            context:      errorSnippet
        };
    };

    /**
     * Advances the internal character pointer (`currentPosition`) and updates `currentChar`.
     * Optionally validates that the character *just consumed* matched an `expectedChar`.
     * @param {string} [expectedChar] - If provided, asserts that the character just before advancing matches this.
     * @returns {string} The new `currentChar` after the advance.
     */
    const advanceCharacter = function (expectedChar) {
        const previouslyReadChar = currentChar; // Store the character *before* advancing for validation.

        // Update `currentChar` to the character at `currentPosition` and then increment `currentPosition`.
        currentChar = sourceContent.charAt(currentPosition);
        currentPosition++;

        // If an `expectedChar` was specified, check if the character we *just passed* matched it.
        if (expectedChar !== undefined && previouslyReadChar !== expectedChar) {
            signalParsingError(`Expected '${expectedChar}' but encountered '${previouslyReadChar}'`);
        }
        return currentChar; // Return the *new* current character.
    };

    /**
     * Skips over any whitespace characters (space, tab, newline, carriage return) in the input.
     * Parsing continues from the first non-whitespace character.
     */
    const consumeWhitespace = function () {
        // Continue advancing as long as `currentChar` is not the end of the string and is a whitespace character.
        while (currentChar !== '' && currentChar <= ' ') {
            advanceCharacter();
        }
    };

    // --- Parser Functions for JSON Data Types ---

    /**
     * Parses a numeric literal (integer, float, scientific notation) from the input.
     * @returns {number} The parsed numeric value.
     */
    const extractNumber = function () {
        const charBuffer = []; // Used to build the number string character by character.
        let hasDecimalPoint = false;
        let hasExponentPart = false;

        // Handle optional leading negative sign.
        if (currentChar === '-') {
            charBuffer.push('-');
            advanceCharacter();
        }

        // Parse integer part (before decimal point).
        if (currentChar === '0') {
            charBuffer.push('0');
            advanceCharacter();
            // JSON spec prohibits multiple leading zeros (e.g., "01", "00").
            if (currentChar >= '0' && currentChar <= '9') {
                signalParsingError("Numbers cannot have leading zeros (e.g., '01' is invalid)");
            }
        } else if (currentChar >= '1' && currentChar <= '9') {
            while (currentChar >= '0' && currentChar <= '9') {
                charBuffer.push(currentChar);
                advanceCharacter();
            }
        } else {
            signalParsingError("Invalid start to a numeric literal");
        }

        // Parse fractional part (after decimal point).
        if (currentChar === '.') {
            charBuffer.push('.');
            advanceCharacter();
            hasDecimalPoint = true;
            // Must have at least one digit after the decimal point.
            if (!(currentChar >= '0' && currentChar <= '9')) {
                signalParsingError("Expected at least one digit after a decimal point");
            }
            while (currentChar >= '0' && currentChar <= '9') {
                charBuffer.push(currentChar);
                advanceCharacter();
            }
        }

        // Parse exponent part (e.g., e+10, E-5).
        if (currentChar === 'e' || currentChar === 'E') {
            charBuffer.push(currentChar);
            advanceCharacter();
            hasExponentPart = true;

            // Optional exponent sign.
            if (currentChar === '-' || currentChar === '+') {
                charBuffer.push(currentChar);
                advanceCharacter();
            }
            // Must have at least one digit after the exponent indicator/sign.
            if (!(currentChar >= '0' && currentChar <= '9')) {
                signalParsingError("Expected at least one digit after an exponent indicator ('e' or 'E')");
            }
            while (currentChar >= '0' && currentChar <= '9') {
                charBuffer.push(currentChar);
                advanceCharacter();
            }
        }

        const finalNumStr = charBuffer.join('');
        const numericValue = Number(finalNumStr); // Use Number() constructor for conversion.

        // Validate the resulting number.
        if (isNaN(numericValue)) {
            signalParsingError("Failed to parse a valid number from '" + finalNumStr + "'");
        }
        if (!isFinite(numericValue)) {
            signalParsingError("Number literal is out of representable range (infinity)");
        }

        return numericValue;
    };

    /**
     * Parses a string literal, handling JSON escape sequences.
     * @returns {string} The parsed string value.
     */
    const readStringValue = function () {
        const stringBuilder = []; // Accumulates characters for the resulting string.
        let unicodeValue = 0;
        let hexDigitCount = 0;

        // A string must begin with a double quote.
        if (currentChar === '"') {
            advanceCharacter('"'); // Consume the opening quote.

            // Loop until the closing double quote or end of input.
            while (currentChar !== '' && currentChar !== '"') {
                if (currentChar === '\\') { // Encountered an escape sequence.
                    advanceCharacter('\\'); // Consume the backslash.

                    if (currentChar === 'u') { // Unicode escape sequence (\uXXXX).
                        advanceCharacter('u'); // Consume 'u'.
                        unicodeValue = 0;
                        for (hexDigitCount = 0; hexDigitCount < 4; hexDigitCount++) {
                            const hexChar = currentChar;
                            const digitValue = parseInt(hexChar, 16);
                            if (isNaN(digitValue)) {
                                signalParsingError(`Invalid hexadecimal digit '${hexChar}' in unicode escape sequence`);
                            }
                            unicodeValue = unicodeValue * 16 + digitValue;
                            advanceCharacter();
                        }
                        stringBuilder.push(String.fromCharCode(unicodeValue));
                    } else if (charEscapeLookup.hasOwnProperty(currentChar)) { // Standard escaped characters.
                        stringBuilder.push(charEscapeLookup[currentChar]);
                        advanceCharacter();
                    } else {
                        // Unrecognized escape sequence (e.g., \z).
                        signalParsingError(`Unrecognized escape sequence '\\${currentChar}'`);
                    }
                } else { // Regular character, not an escape.
                    // Control characters (U+0000 to U+001F) are not allowed unescaped in JSON strings.
                    if (currentChar < ' ') {
                        signalParsingError(`Unescaped control character (U+${currentChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}) in string`);
                    }
                    stringBuilder.push(currentChar);
                    advanceCharacter();
                }
            }

            if (currentChar === '"') {
                advanceCharacter('"'); // Consume the closing quote.
                return stringBuilder.join('');
            }
        }
        // If we exit the loop without consuming a closing quote, it's an unterminated string.
        signalParsingError("Unterminated or improperly started string literal");
    };

    /**
     * Parses JSON keyword literals: 'true', 'false', and 'null'.
     * @returns {boolean|null} The parsed boolean or null value.
     */
    const parseKeywordLiteral = function () {
        const initialChar = currentChar; // Capture the first character to determine the keyword.

        switch (initialChar) {
            case 't': // "true"
                advanceCharacter('t'); advanceCharacter('r'); advanceCharacter('u'); advanceCharacter('e');
                return true;
            case 'f': // "false"
                advanceCharacter('f'); advanceCharacter('a'); advanceCharacter('l'); advanceCharacter('s'); advanceCharacter('e');
                return false;
            case 'n': // "null"
                advanceCharacter('n'); advanceCharacter('u'); advanceCharacter('l'); advanceCharacter('l');
                return null;
            default:
                signalParsingError(`Unexpected character '${initialChar}' while attempting to parse a keyword (true, false, or null)`);
        }
    };

    // Forward declaration for mutual recursion: `processJsonElement` will call `parseJsonArray` and `parseJsonObject`,
    // which in turn will recursively call `processJsonElement`.
    let processJsonElement;

    /**
     * Parses a JSON array structure, which is a sequence of values enclosed in square brackets.
     * @returns {Array} The parsed JavaScript array.
     */
    const parseJsonArray = function () {
        parsingDepth++;
        if (parsingDepth > MAX_NESTING_DEPTH) {
            signalParsingError("Maximum JSON nesting depth exceeded for array. Possible malformed input or excessive recursion.");
        }

        const resultArray = [];
        advanceCharacter('['); // Expect and consume the opening square bracket.
        consumeWhitespace();   // Skip any whitespace after the opening bracket.

        // Check for an empty array (e.g., "[]").
        if (currentChar === ']') {
            advanceCharacter(']'); // Consume the closing bracket.
            parsingDepth--;
            return resultArray;
        }

        let isFirstElement = true;
        while (true) { // Loop to parse array elements.
            if (!isFirstElement) {
                advanceCharacter(','); // Expect and consume a comma separator for subsequent elements.
                consumeWhitespace();
            } else {
                isFirstElement = false;
            }

            // Parse the actual value of the array element.
            resultArray.push(processJsonElement());
            consumeWhitespace();

            // After parsing an element, check for the closing bracket.
            if (currentChar === ']') {
                advanceCharacter(']'); // Consume the closing bracket.
                parsingDepth--;
                return resultArray;
            }

            // If not a closing bracket, it must be a comma to continue the array.
            if (currentChar !== ',') {
                signalParsingError("Expected a comma (',') to separate array elements or a closing bracket (']')");
            }
            // If it's a comma, the loop continues to parse the next element.
        }
        // This point should not be reached if the JSON is well-formed.
        // If `currentChar` becomes empty inside the loop without hitting ']', it's an error.
        signalParsingError("Unterminated array literal: end of input reached unexpectedly");
    };

    /**
     * Parses a JSON object structure, which is a collection of key-value pairs enclosed in curly braces.
     * @returns {Object} The parsed JavaScript object.
     */
    const parseJsonObject = function () {
        parsingDepth++;
        if (parsingDepth > MAX_NESTING_DEPTH) {
            signalParsingError("Maximum JSON nesting depth exceeded for object. Possible malformed input or excessive recursion.");
        }

        const resultObject = {};
        let propertyName;

        advanceCharacter('{'); // Expect and consume the opening curly brace.
        consumeWhitespace();   // Skip any whitespace after the opening brace.

        // Check for an empty object (e.g., "{}").
        if (currentChar === '}') {
            advanceCharacter('}'); // Consume the closing brace.
            parsingDepth--;
            return resultObject;
        }

        let isFirstProperty = true;
        while (true) { // Loop to parse object properties.
            if (!isFirstProperty) {
                advanceCharacter(','); // Expect and consume a comma separator for subsequent properties.
                consumeWhitespace();
            } else {
                isFirstProperty = false;
            }

            // Property keys must be string literals.
            propertyName = readStringValue();
            consumeWhitespace();
            advanceCharacter(':'); // Expect and consume the colon separating key from value.
            consumeWhitespace();

            // JSON spec allows duplicate keys in objects, but many parsers (and the original) flag them as errors.
            // This implementation follows the original's behavior of throwing an error.
            if (Object.prototype.hasOwnProperty.call(resultObject, propertyName)) {
                signalParsingError(`Duplicate key "${propertyName}" found in object`);
            }

            // Parse the value associated with the property key.
            resultObject[propertyName] = processJsonElement();
            consumeWhitespace();

            // After parsing a property, check for the closing brace.
            if (currentChar === '}') {
                advanceCharacter('}'); // Consume the closing brace.
                parsingDepth--;
                return resultObject;
            }

            // If not a closing brace, it must be a comma to continue the object.
            if (currentChar !== ',') {
                signalParsingError("Expected a comma (',') to separate object properties or a closing brace ('}')");
            }
            // If it's a comma, the loop continues to parse the next property.
        }
        signalParsingError("Unterminated object literal: end of input reached unexpectedly");
    };

    /**
     * The central dispatcher function that determines the type of the next JSON value
     * and calls the appropriate parsing function (object, array, string, number, boolean, null).
     * This function is recursive.
     * @returns {*} The parsed JavaScript value.
     */
    processJsonElement = function () {
        consumeWhitespace(); // Always skip whitespace before determining the value type.

        switch (currentChar) {
            case '{': return parseJsonObject();
            case '[': return parseJsonArray();
            case '"': return readStringValue();
            case '-':
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                return extractNumber();
            case 't': // 'true'
            case 'f': // 'false'
            case 'n': // 'null'
                return parseKeywordLiteral();
            default:
                signalParsingError(`Unexpected character '${currentChar}' encountered at the start of a JSON value`);
        }
    };

    // --- Main Parsing Function and Reviver Logic ---

    /**
     * The primary function to parse a JSON string into a JavaScript value.
     * @param {string} rawJsonText - The JSON formatted string to be parsed.
     * @param {function} [valueProcessor] - An optional function to filter and transform the results.
     *                                      It receives key and value, and its return value replaces the original.
     *                                      Returning `undefined` deletes the member.
     * @returns {*} The parsed JavaScript object, array, or primitive value.
     * @throws {TypeError} If `rawJsonText` is not a string.
     * @throws {SyntaxError} If the `rawJsonText` is not valid JSON.
     */
    return function (rawJsonText, valueProcessor) {
        // --- Pre-parsing Input Validation ---
        if (typeof rawJsonText !== 'string') {
            throw new TypeError("JSON input must be a string.");
        }
        // Basic check for empty or purely whitespace strings, which are not valid JSON.
        if (rawJsonText.trim().length === 0) {
            signalParsingError("Cannot parse an empty or whitespace-only JSON string.");
        }

        // --- Reset Parser State for New Input ---
        sourceContent = rawJsonText;
        currentPosition = 0;
        currentChar = ' '; // Initialize `currentChar` to a space to ensure `consumeWhitespace()` works correctly at start.
        parsingDepth = 0;  // Reset recursion depth.

        // --- Execute Main Parsing Logic ---
        const finalParsedStructure = processJsonElement();

        // --- Post-parsing Validation ---
        // After parsing the primary JSON structure, ensure no extra characters remain in the input.
        consumeWhitespace();
        if (currentChar !== '') {
            signalParsingError("Trailing characters found after the main JSON structure");
        }

        // --- Apply Optional Reviver Function ---
        if (typeof valueProcessor === 'function') {
            /**
             * Recursively walks the parsed structure, applying the `valueProcessor` function to each node.
             * @param {Object} currentContainer - The parent object or array holding the current value.
             * @param {string|number} entryKey - The property key (for objects) or array index (for arrays) of `nodeValue`.
             * @returns {*} The transformed value, or `undefined` if the node was deleted by the reviver.
             */
            const traverseAndProcess = function (currentContainer, entryKey) {
                let nodeValue = currentContainer[entryKey];

                // If the current value is an object (and not null), recursively process its children.
                if (nodeValue && typeof nodeValue === 'object') {
                    // Handle arrays: iterate numerically through indices.
                    if (Array.isArray(nodeValue)) {
                        for (let idx = 0; idx < nodeValue.length; idx++) {
                            // Convert index to string as the key argument for the reviver.
                            const processedChild = traverseAndProcess(nodeValue, String(idx));
                            if (processedChild !== undefined) {
                                nodeValue[idx] = processedChild;
                            } else {
                                // If reviver returns `undefined`, delete the array element.
                                // This creates a "hole" in the array, matching `JSON.parse`'s behavior.
                                delete nodeValue[idx];
                            }
                        }
                    } else {
                        // Handle plain objects: iterate through enumerable properties.
                        for (const propName in nodeValue) {
                            // Ensure we only process own properties, not inherited ones.
                            if (Object.prototype.hasOwnProperty.call(nodeValue, propName)) {
                                const processedChild = traverseAndProcess(nodeValue, propName);
                                if (processedChild !== undefined) {
                                    nodeValue[propName] = processedChild;
                                } else {
                                    // If reviver returns `undefined`, delete the object property.
                                    delete nodeValue[propName];
                                }
                            }
                        }
                    }
                }
                // Finally, apply the `valueProcessor` to the current node.
                return valueProcessor.call(currentContainer, entryKey, nodeValue);
            };

            // To allow the reviver to process the top-level structure, we wrap it in a synthetic root object.
            // The reviver is then called with an empty string key for the top-level value.
            const syntheticRootObject = {'': finalParsedStructure};
            return traverseAndProcess(syntheticRootObject, '');
        } else {
            // If no reviver function is provided, return the parsed structure as is.
            return finalParsedStructure;
        }
    };
}());