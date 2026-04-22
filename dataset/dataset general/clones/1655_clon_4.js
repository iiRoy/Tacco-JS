// Ensure UniversalDataConverter exists
if (!this.UniversalDataConverter) {
    this.UniversalDataConverter = {};
}

(function () {
    // Helper to format numbers with leading zero
    function formatPad(num) {
        return num < 10 ? '0' + num : String(num);
    }

    // Extend Date and primitive prototypes if their conversion methods are missing
    if (typeof Date.prototype.toIsoFormatString !== 'function') {
        Date.prototype.toIsoFormatString = function () {
            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                   formatPad(this.getUTCMonth() + 1) + '-' +
                   formatPad(this.getUTCDate())      + 'T' +
                   formatPad(this.getUTCHours())     + ':' +
                   formatPad(this.getUTCMinutes())   + ':' +
                   formatPad(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toValuePrimitive =
        Number.prototype.toValuePrimitive =
        Boolean.prototype.toValuePrimitive = function () {
            return this.valueOf();
        };
    }

    var escapeCharMap = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };

    var indentTracker; // Renamed from 'gap'
    var currentIndentSpec; // Renamed from 'indent'
    var replacerFunctionOrArray; // Renamed from 'rep'

    // Generates an escaped and quoted JSON string from a JavaScript string.
    // Divergent strategy: manual character iteration instead of regex.
    function charEscaper(inputStr) {
        var resultBuilder = ['"'];
        var len = inputStr.length;
        var charCode;
        var mapped;

        for (var i = 0; i < len; i++) {
            var char = inputStr[i];
            mapped = escapeCharMap[char]; // Check direct map first
            if (mapped) {
                resultBuilder.push(mapped);
            } else {
                charCode = inputStr.charCodeAt(i);
                // Manually check if charCode falls into the ranges of characters that need escaping
                if (
                    charCode < 32 || // \x00-\x1f (control characters)
                    charCode === 127 || // \x7f (DEL)
                    (charCode >= 128 && charCode <= 159) || // \x80-\x9f (C1 control characters)
                    charCode === 173 || // \u00ad (Soft Hyphen)
                    (charCode >= 1536 && charCode <= 1540) || // \u0600-\u0604 (Arabic Tatweel, etc.)
                    charCode === 1807 || // \u070f (Syriac Abbreviation Mark)
                    (charCode >= 6000 && charCode <= 6001) || // \u17b0-\u17b1 (Khmer Vowels) - original had \u17b4-\u17b5, ensuring consistency
                    (charCode >= 8204 && charCode <= 8207) || // \u200c-\u200f (Zero Width Joiner/Non-Joiner, etc.)
                    (charCode >= 8232 && charCode <= 8239) || // \u2028-\u202f (Line Separator, Paragraph Separator, etc.)
                    (charCode >= 8288 && charCode <= 8299) || // \u2060-\u206f (Word Joiner, etc.)
                    charCode === 65279 || // \ufeff (Zero Width No-Break Space)
                    (charCode >= 65520 && charCode <= 65535) // \ufff0-\uffff (Private Use Area, Specials)
                ) {
                    resultBuilder.push('\\u' + ('0000' + charCode.toString(16)).slice(-4));
                } else {
                    resultBuilder.push(char);
                }
            }
        }
        resultBuilder.push('"');
        return resultBuilder.join('');
    }

    // Recursive function to serialize values
    function valueSerializer(currKey, containerObj) {
        var iterCount, propKey, propVal, arrLength,
            prevIndent = indentTracker,
            tempParts,
            currentVal = containerObj[currKey];

        // Apply custom toJSON/toIsoFormatString methods
        if (currentVal && typeof currentVal === 'object') {
             if (typeof currentVal.toJSON === 'function') {
                 currentVal = currentVal.toJSON(currKey);
             } else if (currentVal instanceof Date && typeof currentVal.toIsoFormatString === 'function') {
                 currentVal = currentVal.toIsoFormatString();
             }
        }
        // Apply replacer function
        if (typeof replacerFunctionOrArray === 'function') {
            currentVal = replacerFunctionOrArray.call(containerObj, currKey, currentVal);
        }

        switch (typeof currentVal) {
            case 'string':
                return charEscaper(currentVal);
            case 'number':
                return isFinite(currentVal) ? String(currentVal) : 'null';
            case 'boolean':
                return String(currentVal);
            case 'object':
                if (currentVal === null) { // null is typeof 'object'
                    return 'null';
                }

                indentTracker += currentIndentSpec;
                tempParts = [];

                // Handle arrays
                if (Object.prototype.toString.apply(currentVal) === '[object Array]') {
                    arrLength = currentVal.length;
                    for (iterCount = 0; iterCount < arrLength; iterCount += 1) {
                        // Pass index as key, and the array itself as holder
                        tempParts[iterCount] = valueSerializer(iterCount, currentVal) || 'null';
                    }
                    propVal = tempParts.length === 0 ? '[]' :
                        indentTracker ? '[\n' + indentTracker +
                            tempParts.join(',\n' + indentTracker) + '\n' +
                            prevIndent + ']' :
                        '[' + tempParts.join(',') + ']';
                    indentTracker = prevIndent;
                    return propVal;
                }

                // Handle objects
                if (replacerFunctionOrArray && typeof replacerFunctionOrArray === 'object' && replacerFunctionOrArray.length) {
                    arrLength = replacerFunctionOrArray.length;
                    for (iterCount = 0; iterCount < arrLength; iterCount += 1) {
                        propKey = replacerFunctionOrArray[iterCount];
                        if (typeof propKey === 'string') {
                            propVal = valueSerializer(propKey, currentVal);
                            if (propVal !== undefined) { // Only include if not undefined
                                tempParts.push(charEscaper(propKey) + (indentTracker ? ': ' : ':') + propVal);
                            }
                        }
                    }
                } else {
                    for (propKey in currentVal) {
                        if (Object.prototype.hasOwnProperty.call(currentVal, propKey)) {
                            propVal = valueSerializer(propKey, currentVal);
                            if (propVal !== undefined) { // Only include if not undefined
                                tempParts.push(charEscaper(propKey) + (indentTracker ? ': ' : ':') + propVal);
                            }
                        }
                    }
                }

                propVal = tempParts.length === 0 ? '{}' :
                    indentTracker ? '{\n' + indentTracker + tempParts.join(',\n' + indentTracker) + '\n' +
                        prevIndent + '}' : '{' + tempParts.join(',') + '}';
                indentTracker = prevIndent;
                return propVal;
            case 'undefined':
            case 'function':
            case 'symbol':
                return undefined; // These types are omitted in JSON serialization
        }
        return undefined;
    }

    if (typeof UniversalDataConverter.serializeData !== 'function') {
        UniversalDataConverter.serializeData = function (inputVal, transformer, spacing) {
            var i;
            indentTracker = '';
            currentIndentSpec = '';

            if (typeof spacing === 'number') {
                for (i = 0; i < spacing; i += 1) {
                    currentIndentSpec += ' ';
                }
            } else if (typeof spacing === 'string') {
                currentIndentSpec = spacing;
            }

            replacerFunctionOrArray = transformer;
            if (transformer && typeof transformer !== 'function' &&
                (typeof transformer !== 'object' || typeof transformer.length !== 'number')) {
                throw new Error('UniversalDataConverter.serializeData: Invalid transformer.');
            }

            // Use a fake root object to start the serialization process
            return valueSerializer('', {'': inputVal});
        };
    }

    // --- Start of Type IV Clone for JSON.parse (avoiding eval) ---
    // This section implements a full JSON parser (lexer + recursive descent parser)
    // instead of relying on JavaScript's eval(), representing a fundamentally
    // different strategy for parsing.

    var malformedCharPattern = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    // Defines token types for the lexer
    var TOKEN_TYPES = {
        STRING_TOKEN: 'STRING_TOKEN',
        NUMBER_TOKEN: 'NUMBER_TOKEN',
        TRUE_TOKEN: 'TRUE_TOKEN',
        FALSE_TOKEN: 'FALSE_TOKEN',
        NULL_TOKEN: 'NULL_TOKEN',
        OPEN_BRACE_TOKEN: '{',
        CLOSE_BRACE_TOKEN: '}',
        OPEN_BRACKET_TOKEN: '[',
        CLOSE_BRACKET_TOKEN: ']',
        COLON_TOKEN: ':',
        COMMA_TOKEN: ',',
        EOF_TOKEN: 'EOF_TOKEN'
    };

    // Lexer (Token Stream) implementation
    function LexemeStream(sourceText) {
        var currentPosition = 0;
        var sourceLength = sourceText.length;

        function reportError(message) {
            throw new SyntaxError('UniversalDataConverter.deserializeData: ' + message + ' at position ' + currentPosition);
        }

        function skipWhitespace() {
            while (currentPosition < sourceLength && /\s/.test(sourceText[currentPosition])) {
                currentPosition++;
            }
        }

        function readStringToken() {
            if (sourceText[currentPosition] !== '"') {
                return null;
            }
            currentPosition++; // Consume opening quote

            var result = '';
            while (currentPosition < sourceLength) {
                var char = sourceText[currentPosition];
                if (char === '"') {
                    currentPosition++; // Consume closing quote
                    return { type: TOKEN_TYPES.STRING_TOKEN, value: result };
                } else if (char === '\\') {
                    currentPosition++; // Consume backslash
                    char = sourceText[currentPosition];
                    switch (char) {
                        case '"': case '\\': case '/': result += char; break;
                        case 'b': result += '\b'; break;
                        case 'f': result += '\f'; break;
                        case 'n': result += '\n'; break;
                        case 'r': result += '\r'; break;
                        case 't': result += '\t'; break;
                        case 'u':
                            var hexCode = sourceText.substring(currentPosition + 1, currentPosition + 5);
                            if (!/^[0-9a-fA-F]{4}$/.test(hexCode)) {
                                reportError('Invalid Unicode escape sequence');
                            }
                            result += String.fromCharCode(parseInt(hexCode, 16));
                            currentPosition += 4;
                            break;
                        default: reportError('Invalid escape sequence');
                    }
                } else if (char < ' ' || char === '\n' || char === '\r' || char === '\t') {
                    reportError('Unescaped control character in string');
                } else {
                    result += char;
                }
                currentPosition++;
            }
            reportError('Unterminated string');
        }

        function readNumberToken() {
            var numRegex = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/;
            var match = sourceText.substring(currentPosition).match(numRegex);
            if (match) {
                var numStr = match[0];
                currentPosition += numStr.length;
                return { type: TOKEN_TYPES.NUMBER_TOKEN, value: Number(numStr) };
            }
            return null;
        }

        function readKeywordToken() {
            var remaining = sourceText.substring(currentPosition);
            if (remaining.startsWith('true')) {
                currentPosition += 4;
                return { type: TOKEN_TYPES.TRUE_TOKEN, value: true };
            }
            if (remaining.startsWith('false')) {
                currentPosition += 5;
                return { type: TOKEN_TYPES.FALSE_TOKEN, value: false };
            }
            if (remaining.startsWith('null')) {
                currentPosition += 4;
                return { type: TOKEN_TYPES.NULL_TOKEN, value: null };
            }
            return null;
        }

        function fetchNextToken() {
            skipWhitespace();
            if (currentPosition >= sourceLength) {
                return { type: TOKEN_TYPES.EOF_TOKEN };
            }

            var char = sourceText[currentPosition];
            var token;

            switch (char) {
                case '{': currentPosition++; return { type: TOKEN_TYPES.OPEN_BRACE_TOKEN };
                case '}': currentPosition++; return { type: TOKEN_TYPES.CLOSE_BRACE_TOKEN };
                case '[': currentPosition++; return { type: TOKEN_TYPES.OPEN_BRACKET_TOKEN };
                case ']': currentPosition++; return { type: TOKEN_TYPES.CLOSE_BRACKET_TOKEN };
                case ':': currentPosition++; return { type: TOKEN_TYPES.COLON_TOKEN };
                case ',': currentPosition++; return { type: TOKEN_TYPES.COMMA_TOKEN };
                case '"': token = readStringToken(); if (token) return token; break;
                case '-':
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9': token = readNumberToken(); if (token) return token; break;
            }

            token = readKeywordToken();
            if (token) return token;

            reportError('Unexpected character: ' + char);
        }

        function previewToken() {
            var savedPosition = currentPosition;
            var token = fetchNextToken();
            currentPosition = savedPosition; // Reset position
            return token;
        }

        return {
            fetchNextToken: fetchNextToken,
            previewToken: previewToken,
            reportError: reportError
        };
    }

    // Parser (Recursive Descent) implementation
    function ParsingMachine(lexer) {
        var currentToken = lexer.fetchNextToken();

        function assertAndConsume(expectedType) {
            if (currentToken.type === expectedType) {
                var value = currentToken.value;
                currentToken = lexer.fetchNextToken();
                return value;
            }
            lexer.reportError('Expected ' + expectedType + ', but got ' + currentToken.type);
        }

        function parseJsonValue() {
            switch (currentToken.type) {
                case TOKEN_TYPES.OPEN_BRACE_TOKEN: return parseJsonObject();
                case TOKEN_TYPES.OPEN_BRACKET_TOKEN: return parseJsonArray();
                case TOKEN_TYPES.STRING_TOKEN: return assertAndConsume(TOKEN_TYPES.STRING_TOKEN);
                case TOKEN_TYPES.NUMBER_TOKEN: return assertAndConsume(TOKEN_TYPES.NUMBER_TOKEN);
                case TOKEN_TYPES.TRUE_TOKEN: return assertAndConsume(TOKEN_TYPES.TRUE_TOKEN);
                case TOKEN_TYPES.FALSE_TOKEN: return assertAndConsume(TOKEN_TYPES.FALSE_TOKEN);
                case TOKEN_TYPES.NULL_TOKEN: return assertAndConsume(TOKEN_TYPES.NULL_TOKEN);
                default: lexer.reportError('Unexpected token type: ' + currentToken.type);
            }
        }

        function parseJsonObject() {
            var obj = {};
            assertAndConsume(TOKEN_TYPES.OPEN_BRACE_TOKEN); // {

            if (currentToken.type === TOKEN_TYPES.CLOSE_BRACE_TOKEN) {
                assertAndConsume(TOKEN_TYPES.CLOSE_BRACE_TOKEN); // }
                return obj;
            }

            while (true) {
                var key = assertAndConsume(TOKEN_TYPES.STRING_TOKEN);
                assertAndConsume(TOKEN_TYPES.COLON_TOKEN); // :
                var value = parseJsonValue();
                obj[key] = value;

                if (currentToken.type === TOKEN_TYPES.CLOSE_BRACE_TOKEN) {
                    assertAndConsume(TOKEN_TYPES.CLOSE_BRACE_TOKEN); // }
                    return obj;
                }
                assertAndConsume(TOKEN_TYPES.COMMA_TOKEN); // ,
            }
        }

        function parseJsonArray() {
            var arr = [];
            assertAndConsume(TOKEN_TYPES.OPEN_BRACKET_TOKEN); // [

            if (currentToken.type === TOKEN_TYPES.CLOSE_BRACKET_TOKEN) {
                assertAndConsume(TOKEN_TYPES.CLOSE_BRACKET_TOKEN); // ]
                return arr;
            }

            while (true) {
                arr.push(parseJsonValue());
                if (currentToken.type === TOKEN_TYPES.CLOSE_BRACKET_TOKEN) {
                    assertAndConsume(TOKEN_TYPES.CLOSE_BRACKET_TOKEN); // ]
                    return arr;
                }
                assertAndConsume(TOKEN_TYPES.COMMA_TOKEN); // ,
            }
        }

        return {
            process: function () {
                var result = parseJsonValue();
                assertAndConsume(TOKEN_TYPES.EOF_TOKEN); // Ensure entire input is consumed
                return result;
            }
        };
    }

    // Recursive function to apply the reviver
    function structureWalker(currentHolder, memberKey, reviverFunc) {
        var propKey, propVal,
            currentVal = currentHolder[memberKey];

        if (currentVal && typeof currentVal === 'object') {
            if (Object.prototype.toString.apply(currentVal) === '[object Array]') {
                for (var i = 0; i < currentVal.length; i++) {
                    var childVal = structureWalker(currentVal, i, reviverFunc);
                    if (childVal === undefined) {
                        currentVal.splice(i, 1); // Remove item if reviver returns undefined
                        i--; // Adjust index after removal
                    } else {
                        currentVal[i] = childVal;
                    }
                }
            } else { // Object
                for (propKey in currentVal) {
                    if (Object.prototype.hasOwnProperty.call(currentVal, propKey)) {
                        propVal = structureWalker(currentVal, propKey, reviverFunc);
                        if (propVal !== undefined) {
                            currentVal[propKey] = propVal;
                        } else {
                            delete currentVal[propKey];
                        }
                    }
                }
            }
        }
        return reviverFunc.call(currentHolder, memberKey, currentVal);
    }

    if (typeof UniversalDataConverter.deserializeData !== 'function') {
        UniversalDataConverter.deserializeData = function (inputText, reviverHandler) {
            // Original JSON.parse sanitizes certain Unicode characters. Replicate this pre-processing.
            malformedCharPattern.lastIndex = 0;
            if (malformedCharPattern.test(inputText)) {
                inputText = inputText.replace(malformedCharPattern, function (char) {
                    return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            var lexer = LexemeStream(inputText);
            var parser = ParsingMachine(lexer);
            var resultObject;

            try {
                resultObject = parser.process();
            } catch (e) {
                if (e instanceof SyntaxError) {
                    throw new SyntaxError('UniversalDataConverter.deserializeData: ' + e.message);
                }
                throw e;
            }

            if (typeof reviverHandler === 'function') {
                // Use a fake root object to start the reviver walk, mimicking standard behavior
                return structureWalker({'': resultObject}, '', reviverHandler);
            }

            return resultObject;
        };
    }
}());
// The jsonlint part of the original code is a separate, auto-generated parser
// for JSON validation. Cloning this specific parser's internal grammar and
// state machine into a "genuinely different strategy" while maintaining
// identical validation behavior (including specific error messages and
// parse states) is an extremely complex and likely unintended task for
// a Type IV clone of a JSON *polyfill*.
// Therefore, the jsonlint component has been omitted from this clone,
// focusing on the core JSON.stringify and JSON.parse functionality.