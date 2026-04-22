/*
 * Modern JSON Utilities - A robust implementation for JSON serialization and parsing.
 * This module provides `ModernJSON.serialize` and `ModernJSON.deserialize` functions,
 * ensuring compatibility and extending functionality where native browser support is absent.
 * It also includes an integrated JSON linter/parser for validation purposes.
 */

// Establish a global ModernJSON object if it's not already available.
// This is done within a self-executing anonymous function to prevent global variable pollution.

if (!window.ModernJSON) {
    window.ModernJSON = {};
}

(function () {
    "use strict"; // Enforce strict mode for cleaner code and error handling.

    /**
     * Ensures an integer is formatted with at least two digits, padding with a leading zero if necessary.
     * @param {number} inputNumber - The number to format.
     * @returns {string} The formatted string.
     */
    function formatTwoDigits(inputNumber) {
        return inputNumber < 10 ? '0' + inputNumber : String(inputNumber);
    }

    // Augment Date, String, Number, and Boolean prototypes with a custom `toJSONObject` method
    // if they don't already possess one. This method is used by `ModernJSON.serialize`.

    if (typeof Date.prototype.toJSONObject !== 'function') {
        /**
         * Converts a Date object to its JSON string representation (ISO 8601 format).
         * @param {string} [propKey] - The key associated with this value in the parent object.
         * @returns {string|null} The ISO 8601 string or null if the date is invalid.
         */
        Date.prototype.toJSONObject = function (propKey) {
            // Check if the date is a valid, finite date.
            if (!isFinite(this.valueOf())) {
                return null;
            }

            const year = this.getUTCFullYear();
            const month = formatTwoDigits(this.getUTCMonth() + 1); // Months are 0-indexed
            const day = formatTwoDigits(this.getUTCDate());
            const hours = formatTwoDigits(this.getUTCHours());
            const minutes = formatTwoDigits(this.getUTCMinutes());
            const seconds = formatTwoDigits(this.getUTCSeconds());

            // Construct the ISO 8601 string.
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        };
    }

    if (typeof String.prototype.toJSONObject !== 'function') {
        /**
         * Returns the primitive value of the String object.
         * @param {string} [propKey] - The key associated with this value.
         * @returns {string} The string's primitive value.
         */
        String.prototype.toJSONObject = function (propKey) {
            return this.valueOf();
        };
    }

    if (typeof Number.prototype.toJSONObject !== 'function') {
        /**
         * Returns the primitive value of the Number object.
         * @param {string} [propKey] - The key associated with this value.
         * @returns {number} The number's primitive value.
         */
        Number.prototype.toJSONObject = function (propKey) {
            return this.valueOf();
        };
    }

    if (typeof Boolean.prototype.toJSONObject !== 'function') {
        /**
         * Returns the primitive value of the Boolean object.
         * @param {string} [propKey] - The key associated with this value.
         * @returns {boolean} The boolean's primitive value.
         */
        Boolean.prototype.toJSONObject = function (propKey) {
            return this.valueOf();
        };
    }

    // Regular expressions and lookup tables for string serialization.
    const unicodeControlRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    const specialCharEscapeRegex = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    let currentIndentationLevel; // Stores the current indentation string for pretty printing.
    let indentUnitString;        // Defines the string used for a single level of indentation.
    const charEscapeLookup = {    // Mapping for common character substitutions.
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
    let valueTransformerFunction; // Holds the optional replacer function or array for serialization.

    /**
     * Encloses a string in double quotes and escapes necessary characters.
     * @param {string} inputString - The string to quote and escape.
     * @returns {string} The JSON-formatted string.
     */
    function formatAndQuoteString(inputString) {
        specialCharEscapeRegex.lastIndex = 0; // Reset regex index for safety.

        // If no special characters are found, simply wrap in quotes.
        // Otherwise, replace problematic characters with their escape sequences.
        if (!specialCharEscapeRegex.test(inputString)) {
            return '"' + inputString + '"';
        }

        return '"' + inputString.replace(specialCharEscapeRegex, function (matchedChar) {
            const replacement = charEscapeLookup[matchedChar];
            // If a direct mapping exists, use it. Otherwise, encode as Unicode escape.
            if (typeof replacement === 'string') {
                return replacement;
            }
            // Fallback to Unicode escape sequence for other control characters.
            return '\\u' + ('0000' + matchedChar.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    }

    /**
     * Recursively serializes a JavaScript value into a JSON string.
     * @param {string} propName - The property name of the current value within its parent.
     * @param {object} parentContainer - The object or array containing the current value.
     * @returns {string|undefined} The JSON string representation of the value, or undefined if it should be omitted.
     */
    function serializeStructure(propName, parentContainer) {
        let loopCounter;
        let objectKeyIter;
        let currentValueString;
        let currentArrayLength;
        const previousIndentationLevel = currentIndentationLevel; // Save current indentation before recursing.
        let serializedFragments;

        let itemValue = parentContainer[propName];

        // If the value has a custom `toJSONObject` method, invoke it to get a replacement value.
        if (itemValue && typeof itemValue === 'object' && typeof itemValue.toJSONObject === 'function') {
            itemValue = itemValue.toJSONObject(propName);
        }

        // If a replacer function is provided, call it to transform the value.
        if (typeof valueTransformerFunction === 'function') {
            itemValue = valueTransformerFunction.call(parentContainer, propName, itemValue);
        }

        // Determine how to serialize based on the value's type.
        switch (typeof itemValue) {
            case 'string':
                return formatAndQuoteString(itemValue);

            case 'number':
                // JSON numbers must be finite. Non-finite numbers (NaN, Infinity) are serialized as "null".
                return isFinite(itemValue) ? String(itemValue) : 'null';

            case 'boolean':
            case 'null':
                // Booleans and null are directly converted to their string equivalents.
                return String(itemValue);

            case 'object':
                // Handle null explicitly, as `typeof null` is 'object'.
                if (itemValue === null) {
                    return 'null';
                }

                // Prepare to accumulate serialized parts.
                currentIndentationLevel += indentUnitString;
                serializedFragments = [];

                // Check if the value is an array.
                if (Object.prototype.toString.call(itemValue) === '[object Array]') {
                    currentArrayLength = itemValue.length;
                    for (loopCounter = 0; loopCounter < currentArrayLength; loopCounter += 1) {
                        currentValueString = serializeStructure(String(loopCounter), itemValue);
                        // If a value cannot be serialized (e.g., undefined from a replacer), use 'null'.
                        serializedFragments[loopCounter] = currentValueString === undefined ? 'null' : currentValueString;
                    }

                    // Join array elements, applying indentation if specified.
                    const finalArrayString = serializedFragments.length === 0 ? '[]' :
                        indentUnitString ? '[\n' + currentIndentationLevel +
                            serializedFragments.join(',\n' + currentIndentationLevel) + '\n' +
                            previousIndentationLevel + ']' :
                            '[' + serializedFragments.join(',') + ']';
                    currentIndentationLevel = previousIndentationLevel; // Restore previous indentation.
                    return finalArrayString;
                }

                // Handle object serialization.
                if (valueTransformerFunction && typeof valueTransformerFunction === 'object' && Array.isArray(valueTransformerFunction)) {
                    // If replacer is an array, iterate over its elements to select properties.
                    currentArrayLength = valueTransformerFunction.length;
                    for (loopCounter = 0; loopCounter < currentArrayLength; loopCounter += 1) {
                        objectKeyIter = valueTransformerFunction[loopCounter];
                        if (typeof objectKeyIter === 'string') {
                            currentValueString = serializeStructure(objectKeyIter, itemValue);
                            // Only include if the serialized value is not undefined.
                            if (currentValueString !== undefined) {
                                serializedFragments.push(formatAndQuoteString(objectKeyIter) + (indentUnitString ? ': ' : ':') + currentValueString);
                            }
                        }
                    }
                } else {
                    // Otherwise, iterate through all own enumerable properties of the object.
                    for (objectKeyIter in itemValue) {
                        if (Object.prototype.hasOwnProperty.call(itemValue, objectKeyIter)) {
                            currentValueString = serializeStructure(objectKeyIter, itemValue);
                            if (currentValueString !== undefined) {
                                serializedFragments.push(formatAndQuoteString(objectKeyIter) + (indentUnitString ? ': ' : ':') + currentValueString);
                            }
                        }
                    }
                }

                // Join object members, applying indentation if specified.
                const finalObjectString = serializedFragments.length === 0 ? '{}' :
                    indentUnitString ? '{\n' + currentIndentationLevel + serializedFragments.join(',\n' + currentIndentationLevel) + '\n' +
                        previousIndentationLevel + '}' : '{' + serializedFragments.join(',') + '}';
                currentIndentationLevel = previousIndentationLevel; // Restore previous indentation.
                return finalObjectString;
            default:
                // For 'undefined', 'function', 'symbol', BigInt, etc., return undefined to omit them.
                return undefined;
        }
    }

    // Provide the `serialize` method for `ModernJSON` if it doesn't exist.
    if (typeof window.ModernJSON.serialize !== 'function') {
        /**
         * Converts a JavaScript value to a JSON string.
         * @param {*} inputData - The value to convert to a JSON string.
         * @param {Function|Array} [transformer] - A function that alters the behavior of the stringification process,
         * or an array of String and Number objects that serves as a whitelist for selecting the properties of the value object to be included in the JSON string.
         * @param {string|number} [indentSize] - A String or Number object that's used to insert white space into the output JSON string for readability purposes.
         * @returns {string|undefined} The JSON string representation of the value, or undefined.
         */
        window.ModernJSON.serialize = function (inputData, transformer, indentSize) {
            // Initialize indentation variables.
            currentIndentationLevel = '';
            indentUnitString = '';

            // Process the `indentSize` parameter to create the `indentUnitString`.
            if (typeof indentSize === 'number' && indentSize > 0) {
                // Limit indentation to 10 spaces as per standard behavior.
                const actualIndent = Math.min(10, Math.floor(indentSize));
                indentUnitString = Array(actualIndent + 1).join(' ');
            } else if (typeof indentSize === 'string' && indentSize.length > 0) {
                // Use the first 10 characters of the string as the indent unit.
                indentUnitString = indentSize.slice(0, 10);
            }

            // Validate the `transformer` parameter.
            valueTransformerFunction = transformer;
            if (transformer && typeof transformer !== 'function' && !Array.isArray(transformer)) {
                // Throw an error if the replacer is neither a function nor an array.
                throw new Error('ModernJSON.serialize: Invalid replacer argument type.');
            }

            // Use a temporary root object to kick off the recursive serialization.
            // This allows the initial value to be processed correctly by `serializeStructure`.
            return serializeStructure('', { '': inputData });
        };
    }

    // Provide the `deserialize` method for `ModernJSON` if it doesn't exist.
    if (typeof window.ModernJSON.deserialize !== 'function') {
        /**
         * Parses a JSON string, constructing the JavaScript value or object described by the string.
         * @param {string} jsonText - The JSON string to parse.
         * @param {Function} [valueModifier] - A function that prescribes how the value originally produced by parsing
         * the JSON string is transformed before being returned.
         * @returns {*} The JavaScript value or object parsed from the JSON string.
         */
        window.ModernJSON.deserialize = function (jsonText, valueModifier) {
            let parsedResult;

            /**
             * Recursively traverses the parsed structure and applies the reviver function.
             * @param {object} container - The current object or array being traversed.
             * @param {string} currentKey - The key of the value within the container.
             * @returns {*} The (potentially modified) value.
             */
            function traverseAndRevive(container, currentKey) {
                let propertyIterator;
                let processedValue;
                const currentItem = container[currentKey];

                // Recursively process nested objects and arrays.
                if (currentItem && typeof currentItem === 'object') {
                    for (propertyIterator in currentItem) {
                        if (Object.prototype.hasOwnProperty.call(currentItem, propertyIterator)) {
                            processedValue = traverseAndRevive(currentItem, propertyIterator);
                            if (processedValue !== undefined) {
                                currentItem[propertyIterator] = processedValue;
                            } else {
                                delete currentItem[propertyIterator]; // Remove properties for which reviver returns undefined.
                            }
                        }
                    }
                }
                // Apply the reviver function to the current value.
                return valueModifier.call(container, currentKey, currentItem);
            }

            // Stage 1: Escape problematic Unicode control characters.
            unicodeControlRegex.lastIndex = 0;
            if (unicodeControlRegex.test(jsonText)) {
                jsonText = jsonText.replace(unicodeControlRegex, function (matchedChar) {
                    return '\\u' + ('0000' + matchedChar.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // Stage 2: Validate the JSON string using a set of regular expressions.
            // This complex regex check is designed to prevent injection attacks when using `eval`.
            // It replaces JSON tokens with safe placeholders to simplify validation.
            const tempText1 = jsonText.replace(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@'); // Replace escaped sequences with '@'
            const tempText2 = tempText1.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']'); // Replace simple values with ']'
            const tempText3 = tempText2.replace(/(?:^|:|,)(?:\s*\[)+/g, ''); // Remove array openings following colon/comma or at start

            if (!/^[\],:{}\s]*$/.test(tempText3)) {
                throw new SyntaxError('ModernJSON.deserialize: Invalid JSON format detected.');
            }

            // Stage 3: Use `eval` to parse the validated JSON string into a JavaScript structure.
            // The parentheses around `jsonText` resolve ambiguity for object literals.
            try {
                parsedResult = eval('(' + jsonText + ')');
            } catch (e) {
                throw new SyntaxError('ModernJSON.deserialize: Failed to parse JSON string: ' + e.message);
            }

            // Stage 4: If a `valueModifier` function is provided, recursively traverse the parsed structure
            // to apply transformations.
            if (typeof valueModifier === 'function') {
                // Create a dummy root object to start the traversal, allowing the reviver to process the top-level value.
                return traverseAndRevive({ '': parsedResult }, '');
            }

            return parsedResult;
        };
    }
}());

// --- Integrated JSON Linter and Parser (Jison generated) ---
// This section provides a supplementary utility for stricter JSON validation.
// It is intentionally kept largely intact due to its generated nature, with
// only top-level variable renaming and minor structural adjustments.

var jsonValidator = (function () {
    var enableDebug = false; // Flag to enable or disable debug tracing for the parser.
    var validationResult = {}; // Object to hold parser output.

    var jsonParsingLogic = function () {
        var grammarConfig = {
            trace: function () { /* No tracing by default */ },
            yy: {},
            symbols_: {
                error: 2, JSONString: 3, STRING: 4, JSONNumber: 5, NUMBER: 6, JSONNullLiteral: 7, NULL: 8,
                JSONBooleanLiteral: 9, TRUE: 10, FALSE: 11, JSONText: 12, JSONValue: 13, EOF: 14,
                JSONObject: 15, JSONArray: 16, "{": 17, "}": 18, JSONMemberList: 19, JSONMember: 20, ":": 21,
                ",": 22, "[": 23, "]": 24, JSONElementList: 25, $accept: 0, $end: 1
            },
            terminals_: {
                2: "error", 4: "STRING", 6: "NUMBER", 8: "NULL", 10: "TRUE", 11: "FALSE", 14: "EOF",
                17: "{", 18: "}", 21: ":", 22: ",", 23: "[", 24: "]"
            },
            productions_: [
                0, [3, 1], [5, 1], [7, 1], [9, 1], [9, 1], [12, 2], [13, 1], [13, 1], [13, 1], [13, 1],
                [13, 1], [13, 1], [15, 2], [15, 3], [20, 3], [19, 1], [19, 3], [16, 2], [16, 3], [25, 1], [25, 3]
            ],
            performAction: function (tokenVal, tokenCount, lineNum, yyContext, productionIndex, stackValues, locInfo) {
                var lastStackIndex = stackValues.length - 1;
                switch (productionIndex) {
                    case 1:
                        this.$ = tokenVal.replace(/\\(\\|")/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\v/g, "\v").replace(/\\f/g, "\f").replace(/\\b/g, "\b");
                        break;
                    case 2:
                        this.$ = Number(tokenVal);
                        break;
                    case 3:
                        this.$ = null;
                        break;
                    case 4:
                        this.$ = true;
                        break;
                    case 5:
                        this.$ = false;
                        break;
                    case 6:
                        return (this.$ = stackValues[lastStackIndex - 1]);
                    case 13:
                        this.$ = {};
                        break;
                    case 14:
                        this.$ = stackValues[lastStackIndex - 1];
                        break;
                    case 15:
                        this.$ = [stackValues[lastStackIndex - 2], stackValues[lastStackIndex]];
                        break;
                    case 16:
                        this.$ = {};
                        this.$[stackValues[lastStackIndex][0]] = stackValues[lastStackIndex][1];
                        break;
                    case 17:
                        this.$ = stackValues[lastStackIndex - 2];
                        stackValues[lastStackIndex - 2][stackValues[lastStackIndex][0]] = stackValues[lastStackIndex][1];
                        break;
                    case 18:
                        this.$ = [];
                        break;
                    case 19:
                        this.$ = stackValues[lastStackIndex - 1];
                        break;
                    case 20:
                        this.$ = [stackValues[lastStackIndex]];
                        break;
                    case 21:
                        this.$ = stackValues[lastStackIndex - 2];
                        stackValues[lastStackIndex - 2].push(stackValues[lastStackIndex]);
                        break;
                }
            },
            table: [{
                3: 5, 4: [1, 12], 5: 6, 6: [1, 13], 7: 3, 8: [1, 9], 9: 4, 10: [1, 10], 11: [1, 11], 12: 1, 13: 2, 15: 7, 16: 8, 17: [1, 14], 23: [1, 15]
            }, {
                1: [3]
            }, {
                14: [1, 16]
            }, {
                14: [2, 7], 18: [2, 7], 22: [2, 7], 24: [2, 7]
            }, {
                14: [2, 8], 18: [2, 8], 22: [2, 8], 24: [2, 8]
            }, {
                14: [2, 9], 18: [2, 9], 22: [2, 9], 24: [2, 9]
            }, {
                14: [2, 10], 18: [2, 10], 22: [2, 10], 24: [2, 10]
            }, {
                14: [2, 11], 18: [2, 11], 22: [2, 11], 24: [2, 11]
            }, {
                14: [2, 12], 18: [2, 12], 22: [2, 12], 24: [2, 12]
            }, {
                14: [2, 3], 18: [2, 3], 22: [2, 3], 24: [2, 3]
            }, {
                14: [2, 4], 18: [2, 4], 22: [2, 4], 24: [2, 4]
            }, {
                14: [2, 5], 18: [2, 5], 22: [2, 5], 24: [2, 5]
            }, {
                14: [2, 1], 18: [2, 1], 21: [2, 1], 22: [2, 1], 24: [2, 1]
            }, {
                14: [2, 2], 18: [2, 2], 22: [2, 2], 24: [2, 2]
            }, {
                3: 20, 4: [1, 12], 18: [1, 17], 19: 18, 20: 19
            }, {
                3: 5, 4: [1, 12], 5: 6, 6: [1, 13], 7: 3, 8: [1, 9], 9: 4, 10: [1, 10], 11: [1, 11], 13: 23, 15: 7, 16: 8, 17: [1, 14], 23: [1, 15], 24: [1, 21], 25: 22
            }, {
                1: [2, 6]
            }, {
                14: [2, 13], 18: [2, 13], 22: [2, 13], 24: [2, 13]
            }, {
                18: [1, 24], 22: [1, 25]
            }, {
                18: [2, 16], 22: [2, 16]
            }, {
                21: [1, 26]
            }, {
                14: [2, 18], 18: [2, 18], 22: [2, 18], 24: [2, 18]
            }, {
                22: [1, 28], 24: [1, 27]
            }, {
                22: [2, 20], 24: [2, 20]
            }, {
                14: [2, 14], 18: [2, 14], 22: [2, 14], 24: [2, 14]
            }, {
                3: 20, 4: [1, 12], 20: 29
            }, {
                3: 5, 4: [1, 12], 5: 6, 6: [1, 13], 7: 3, 8: [1, 9], 9: 4, 10: [1, 10], 11: [1, 11], 13: 30, 15: 7, 16: 8, 17: [1, 14], 23: [1, 15]
            }, {
                14: [2, 19], 18: [2, 19], 22: [2, 19], 24: [2, 19]
            }, {
                3: 5, 4: [1, 12], 5: 6, 6: [1, 13], 7: 3, 8: [1, 9], 9: 4, 10: [1, 10], 11: [1, 11], 13: 31, 15: 7, 16: 8, 17: [1, 14], 23: [1, 15]
            }, {
                18: [2, 17], 22: [2, 17]
            }, {
                18: [2, 15], 22: [2, 15]
            }, {
                22: [2, 21], 24: [2, 21]
            }],
            defaultActions: {
                16: [2, 6]
            },
            parseError: function (message, hash) {
                throw new Error(message);
            },
            parse: function (inputString) {
                function popStack(numItems) {
                    stateStack.length = stateStack.length - 2 * numItems;
                    valueStack.length = valueStack.length - numItems;
                    locationStack.length = locationStack.length - numItems;
                }

                function getNextToken() {
                    var nextToken;
                    nextToken = lexerInstance.lex() || 1; // 1 is EOF
                    if (typeof nextToken !== "number") {
                        nextToken = grammarConfig.symbols_[nextToken] || nextToken;
                    }
                    return nextToken;
                }

                var lexerInstance = this.lexer;
                var stateStack = [0];
                var valueStack = [null];
                var locationStack = [];
                var currentInput = "";
                var currentInputLength = 0;
                var currentLineNum = 0;
                var currentLexerLine = 1;
                var parseErrorRecovery = 2; // Error recovery mode (0: no, 1: token, 2: rule)

                this.lexer.setInput(inputString);
                this.lexer.yy = this.yy;
                this.yy.lexer = this.lexer;
                if (typeof this.lexer.yylloc === "undefined") {
                    this.lexer.yylloc = {};
                }
                var tokenLocation = this.lexer.yylloc;
                locationStack.push(tokenLocation);

                if (typeof this.yy.parseError === "function") {
                    this.parseError = this.yy.parseError;
                }

                var currentState, nextAction, currentToken, lookaheadToken, reduceLength;
                var errorContext = {}; // Context for error reporting.

                for (;;) {
                    currentState = stateStack[stateStack.length - 1];
                    if (this.defaultActions[currentState]) {
                        nextAction = this.defaultActions[currentState];
                    } else {
                        if (currentToken === null || currentToken === undefined) {
                            currentToken = getNextToken();
                        }
                        nextAction = grammarConfig.table[currentState] && grammarConfig.table[currentState][currentToken];
                    }

                    if (typeof nextAction === "undefined" || !nextAction.length || !nextAction[0]) {
                        if (!parseErrorRecovery) {
                            var expectedTokens = [];
                            for (var sym in grammarConfig.table[currentState]) {
                                if (this.terminals_[sym] && sym > 2) {
                                    expectedTokens.push("'" + this.terminals_[sym] + "'");
                                }
                            }
                            var errorMessage = "";
                            if (this.lexer.showPosition) {
                                errorMessage = "Parse error on line " + (currentLineNum + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expectedTokens.join(", ") + ", got '" + this.terminals_[currentToken] + "'";
                            } else {
                                errorMessage = "Parse error on line " + (currentLineNum + 1) + ": Unexpected " + (currentToken === 1 ? "end of input" : "'" + (this.terminals_[currentToken] || currentToken) + "'");
                            }
                            this.parseError(errorMessage, {
                                text: this.lexer.match,
                                token: this.terminals_[currentToken] || currentToken,
                                line: this.lexer.yylineno,
                                loc: tokenLocation,
                                expected: expectedTokens
                            });
                        }
                        if (parseErrorRecovery === 3) {
                            if (currentToken === lookaheadToken) {
                                throw new Error(errorMessage || "Parsing halted.");
                            }
                            currentInputLength = this.lexer.yyleng;
                            currentInput = this.lexer.yytext;
                            currentLineNum = this.lexer.yylineno;
                            tokenLocation = this.lexer.yylloc;
                            currentToken = getNextToken();
                        }
                        for (;;) {
                            if (parseErrorRecovery.toString() in grammarConfig.table[currentState]) {
                                break;
                            }
                            if (currentState === 0) {
                                throw new Error(errorMessage || "Parsing halted.");
                            }
                            popStack(1);
                            currentState = stateStack[stateStack.length - 1];
                        }
                        lookaheadToken = currentToken;
                        currentToken = parseErrorRecovery;
                        currentState = stateStack[stateStack.length - 1];
                        nextAction = grammarConfig.table[currentState] && grammarConfig.table[currentState][parseErrorRecovery];
                        parseErrorRecovery = 3;
                    }

                    if (nextAction[0] instanceof Array && nextAction.length > 1) {
                        throw new Error("Parse Error: multiple actions possible at state: " + currentState + ", token: " + currentToken);
                    }

                    switch (nextAction[0]) {
                        case 1: // Shift
                            stateStack.push(currentToken);
                            valueStack.push(this.lexer.yytext);
                            locationStack.push(this.lexer.yylloc);
                            stateStack.push(nextAction[1]);
                            currentToken = null;
                            if (lookaheadToken) {
                                currentToken = lookaheadToken;
                                lookaheadToken = null;
                            } else {
                                currentInputLength = this.lexer.yyleng;
                                currentInput = this.lexer.yytext;
                                currentLineNum = this.lexer.yylineno;
                                tokenLocation = this.lexer.yylloc;
                                if (parseErrorRecovery > 0) {
                                    parseErrorRecovery--;
                                }
                            }
                            break;

                        case 2: // Reduce
                            reduceLength = this.productions_[nextAction[1]][1];
                            errorContext.$ = valueStack[valueStack.length - reduceLength];
                            errorContext._$ = {
                                first_line: locationStack[locationStack.length - (reduceLength || 1)].first_line,
                                last_line: locationStack[locationStack.length - 1].last_line,
                                first_column: locationStack[locationStack.length - (reduceLength || 1)].first_column,
                                last_column: locationStack[locationStack.length - 1].last_column
                            };
                            var result = this.performAction.call(
                                errorContext,
                                currentInput,
                                currentInputLength,
                                currentLineNum,
                                this.yy,
                                nextAction[1],
                                valueStack,
                                locationStack
                            );
                            if (typeof result !== "undefined") {
                                return result;
                            }
                            if (reduceLength) {
                                stateStack = stateStack.slice(0, -1 * reduceLength * 2);
                                valueStack = valueStack.slice(0, -1 * reduceLength);
                                locationStack = locationStack.slice(0, -1 * reduceLength);
                            }
                            stateStack.push(this.productions_[nextAction[1]][0]);
                            valueStack.push(errorContext.$);
                            locationStack.push(errorContext._$);
                            var nextState = grammarConfig.table[stateStack[stateStack.length - 2]][stateStack[stateStack.length - 1]];
                            stateStack.push(nextState);
                            break;

                        case 3: // Accept
                            return true;
                    }
                }
                return true;
            }
        };

        var jsonLexer = function () {
            var lexerConfig = {
                EOF: 1,
                parseError: function (str, hash) {
                    if (!this.yy.parseError) {
                        throw new Error(str);
                    }
                    this.yy.parseError(str, hash);
                },
                setInput: function (input) {
                    this._input = input;
                    this._more = this._less = this.done = false;
                    this.yylineno = this.yyleng = 0;
                    this.yytext = this.matched = this.match = "";
                    this.conditionStack = ["INITIAL"];
                    this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
                    return this;
                },
                input: function () {
                    var char = this._input[0];
                    this.yytext += char;
                    this.yyleng++;
                    this.match += char;
                    this.matched += char;
                    var newlineMatch = char.match(/\n/);
                    if (newlineMatch) {
                        this.yylineno++;
                    }
                    this._input = this._input.slice(1);
                    return char;
                },
                unput: function (char) {
                    this._input = char + this._input;
                    return this;
                },
                more: function () {
                    this._more = true;
                    return this;
                },
                less: function (n) {
                    this._input = this.match.slice(n) + this._input;
                },
                pastInput: function () {
                    var past = this.matched.substr(0, this.matched.length - this.match.length);
                    return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
                },
                upcomingInput: function () {
                    var upcoming = this.match;
                    if (upcoming.length < 20) {
                        upcoming += this._input.substr(0, 20 - upcoming.length);
                    }
                    return (upcoming.substr(0, 20) + (upcoming.length > 20 ? "..." : "")).replace(/\n/g, "");
                },
                showPosition: function () {
                    var pre = this.pastInput();
                    var indicator = new Array(pre.length + 1).join("-");
                    return pre + this.upcomingInput() + "\n" + indicator + "^";
                },
                next: function () {
                    if (this.done) {
                        return this.EOF;
                    }
                    if (!this._input) {
                        this.done = true;
                    }

                    var token, ruleMatch, ruleIndex, currentCondition, matchedLength;
                    this._more || (this.yytext = "", this.match = "");
                    currentCondition = this._currentRules();

                    for (var i = 0; i < currentCondition.length; i++) {
                        ruleMatch = this._input.match(this.rules[currentCondition[i]]);
                        if (ruleMatch && (!token || ruleMatch[0].length > token[0].length)) {
                            token = ruleMatch;
                            ruleIndex = i;
                            if (!this.options.flex) break; // If not flex, take the first match.
                        }
                    }

                    if (token) {
                        var newlines = token[0].match(/\n.*/g);
                        if (newlines) {
                            this.yylineno += newlines.length;
                        }
                        this.yylloc = {
                            first_line: this.yylloc.last_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.last_column,
                            last_column: newlines ? newlines[newlines.length - 1].length - 1 : this.yylloc.last_column + token[0].length
                        };
                        this.yytext += token[0];
                        this.match += token[0];
                        this.yyleng = this.yytext.length;
                        this._more = false;
                        this._input = this._input.slice(token[0].length);
                        this.matched += token[0];
                        token = this.performAction.call(this, this.yy, this, currentCondition[ruleIndex], this.conditionStack[this.conditionStack.length - 1]);
                        if (this.done && this._input) {
                            this.done = false;
                        }
                        if (token) {
                            return token;
                        }
                        return; // Continue lexing if no token was returned.
                    }

                    if (this._input === "") {
                        return this.EOF;
                    }
                    this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                        text: "",
                        token: null,
                        line: this.yylineno
                    });
                },
                lex: function () {
                    var nextLexToken = this.next();
                    return (typeof nextLexToken !== "undefined") ? nextLexToken : this.lex();
                },
                begin: function (condition) {
                    this.conditionStack.push(condition);
                },
                popState: function () {
                    return this.conditionStack.pop();
                },
                _currentRules: function () {
                    return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                },
                topState: function () {
                    return this.conditionStack[this.conditionStack.length - 2];
                },
                pushState: function (condition) {
                    this.begin(condition);
                }
            };
            lexerConfig.options = {};
            lexerConfig.performAction = function (yy, lexer, ruleIndex, currentCondition) {
                var f = currentCondition; // Original 'f' variable from generated code.
                switch (ruleIndex) {
                    case 0:
                        break; // Whitespace, ignore.
                    case 1:
                        return 6; // NUMBER
                    case 2:
                        lexer.yytext = lexer.yytext.substr(1, lexer.yyleng - 2);
                        return 4; // STRING
                    case 3:
                        return 17; // '{'
                    case 4:
                        return 18; // '}'
                    case 5:
                        return 23; // '['
                    case 6:
                        return 24; // ']'
                    case 7:
                        return 22; // ','
                    case 8:
                        return 21; // ':'
                    case 9:
                        return 10; // TRUE
                    case 10:
                        return 11; // FALSE
                    case 11:
                        return 8; // NULL
                    case 12:
                        return 14; // EOF ($)
                    case 13:
                        return "INVALID"; // Any other character is invalid.
                }
            };
            lexerConfig.rules = [
                /^(?:\s+)/,
                /^(?:(-?([0-9]|[1-9][0-9]+))(\.[0-9]+)?([eE][-+]?[0-9]+)?\b)/,
                /^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/,
                /^(?:\{)/,
                /^(?:\})/,
                /^(?:\[)/,
                /^(?:\])/,
                /^(?:,)/,
                /^(?::)/,
                /^(?:true\b)/,
                /^(?:false\b)/,
                /^(?:null\b)/,
                /^(?:$)/,
                /^(?:.)/
            ];
            lexerConfig.conditions = {
                INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], inclusive: true }
            };
            return lexerConfig;
        }();

        grammarConfig.lexer = jsonLexer;
        return grammarConfig;
    }();

    // Export the parser and a main function for command-line usage.
    if (typeof validationResult !== "undefined" && typeof validationResult !== "undefined") {
        validationResult.parser = jsonParsingLogic;
        validationResult.parse = function () {
            return jsonParsingLogic.parse.apply(jsonParsingLogic, arguments);
        };

        // Add a simple main function for potential NodeJS/Rhino environment usage.
        validationResult.main = function (args) {
            if (!args[1]) {
                throw new Error("Usage: " + args[0] + " FILE");
            }
            var fileContent;
            if (typeof process !== "undefined" && process.versions && process.versions.node) {
                // Node.js environment
                var fs = require("fs");
                var path = require("path");
                fileContent = fs.readFileSync(path.join(process.cwd(), args[1]), "utf8");
            } else if (typeof system !== "undefined" && system.args) {
                // Rhino/SpiderMonkey environment
                var fileUtil = require("file"); // Assuming 'file' module is available
                var currentDir = fileUtil.path(fileUtil.cwd());
                fileContent = currentDir.join(args[1]).read({ charset: "utf-8" });
            } else {
                throw new Error("Unsupported environment for file operations.");
            }
            return validationResult.parser.parse(fileContent);
        };

        // If 'module' is defined and 'module.exports' is available (Node.js CommonJS),
        // and if 'require.main === module' (script is run directly), then execute main.
        if (typeof module !== "undefined" && typeof module.exports === 'object' && require.main === module) {
            try {
                validationResult.main(process.argv.slice(1));
            } catch (e) {
                console.error("JSON Linter Error:", e.message);
                process.exit(1); // Exit with error code
            }
        }
    }
    return validationResult;
})();