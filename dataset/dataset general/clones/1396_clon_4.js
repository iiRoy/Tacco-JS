const processJsonText = (function () {
    "use strict";

    // Defines different types of tokens recognized by the lexer.
    const SYMBOL_TYPES = {
        LEFT_BRACE: "LEFT_BRACE",
        RIGHT_BRACE: "RIGHT_BRACE",
        LEFT_BRACKET: "LEFT_BRACKET",
        RIGHT_BRACKET: "RIGHT_BRACKET",
        COLON: "COLON",
        COMMA: "COMMA",
        STRING: "STRING",
        NUMBER: "NUMBER",
        TRUE_KEYWORD: "TRUE_KEYWORD",
        FALSE_KEYWORD: "FALSE_KEYWORD",
        NULL_KEYWORD: "NULL_KEYWORD",
        END_OF_INPUT: "END_OF_INPUT"
    };

    // Regular expressions for matching each token type.
    // The 'y' (sticky) flag ensures matches only occur at RegExp.lastIndex.
    // Order matters: more specific patterns (like string) should come before less specific ones.
    const TOKEN_PATTERNS = [
        { type: SYMBOL_TYPES.STRING, regex: /"(?:[^"\\]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/y },
        { type: SYMBOL_TYPES.NUMBER, regex: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y },
        { type: SYMBOL_TYPES.TRUE_KEYWORD, regex: /true/y },
        { type: SYMBOL_TYPES.FALSE_KEYWORD, regex: /false/y },
        { type: SYMBOL_TYPES.NULL_KEYWORD, regex: /null/y },
        { type: SYMBOL_TYPES.LEFT_BRACE, regex: /{/y },
        { type: SYMBOL_TYPES.RIGHT_BRACE, regex: /}/y },
        { type: SYMBOL_TYPES.LEFT_BRACKET, regex: /\[/y },
        { type: SYMBOL_TYPES.RIGHT_BRACKET, regex: /]/y },
        { type: SYMBOL_TYPES.COLON, regex: /:/y },
        { type: SYMBOL_TYPES.COMMA, regex: /,/y }
    ];

    // Regular expression for matching and skipping whitespace.
    const WHITESPACE_REGEX = /\s+/y;

    // Lexer function: transforms the input string into an array of tokens.
    function tokenizeInput(inputSource) {
        const generatedTokens = [];
        let currentScanPoint = 0;

        while (currentScanPoint < inputSource.length) {
            // First, attempt to skip any whitespace.
            WHITESPACE_REGEX.lastIndex = currentScanPoint;
            let wsMatch = WHITESPACE_REGEX.exec(inputSource);
            if (wsMatch && wsMatch.index === currentScanPoint) {
                currentScanPoint += wsMatch[0].length;
                continue; // Continue to the next character after whitespace
            }

            // Then, try to match a JSON token.
            let tokenFound = false;
            for (const pattern of TOKEN_PATTERNS) {
                pattern.regex.lastIndex = currentScanPoint;
                let match = pattern.regex.exec(inputSource);
                if (match && match.index === currentScanPoint) {
                    generatedTokens.push({
                        kind: pattern.type,
                        data: match[0],
                        span: currentScanPoint // Record position for error reporting
                    });
                    currentScanPoint += match[0].length;
                    tokenFound = true;
                    break; // Move to the next character after the found token
                }
            }

            // If no whitespace or token was matched, it's a syntax error.
            if (!tokenFound) {
                throw {
                    name: 'SyntaxError',
                    message: "Unexpected character '" + inputSource.charAt(currentScanPoint) + "'",
                    at: currentScanPoint,
                    text: inputSource
                };
            }
        }

        // Add an end-of-input token to simplify parser logic.
        generatedTokens.push({ kind: SYMBOL_TYPES.END_OF_INPUT, data: "", span: currentScanPoint });
        return generatedTokens;
    }

    // Parser state variables (scoped within the IIFE to avoid global pollution).
    let tokenStream;
    let tokenIndex;
    let rawInputForErrors; // Stores the original input string for detailed error messages.

    // Reports a syntax problem, mimicking the original's error object structure.
    function signalProblem(msg) {
        const currentToken = tokenStream[tokenIndex];
        throw {
            name: 'SyntaxError',
            message: msg,
            at: currentToken ? currentToken.span : rawInputForErrors.length,
            text: rawInputForErrors
        };
    }

    // Verifies the current token's type, throws an error if it doesn't match.
    function ensureTokenKind(expectedKind) {
        if (tokenStream[tokenIndex].kind === expectedKind) {
            return tokenStream[tokenIndex];
        }
        signalProblem("Expected " + expectedKind + " but found " + tokenStream[tokenIndex].kind);
    }

    // Consumes the current token and advances the token stream index.
    function consumeToken() {
        return tokenStream[tokenIndex++];
    }

    // Peeks at the kind of the current token without consuming it.
    function peekCurrentTokenKind() {
        return tokenStream[tokenIndex].kind;
    }

    // Parses a JSON string value, including handling of escape sequences.
    function extractLiteral() {
        const token = ensureTokenKind(SYMBOL_TYPES.STRING);
        consumeToken(); // Consume the string token identified by the lexer.
        
        let rawContent = token.data.slice(1, -1); // Remove the outer quotes.
        let finalString = '';
        for (let i = 0; i < rawContent.length; i++) {
            let char = rawContent[i];
            if (char === '\\') {
                i++; // Move past the backslash.
                char = rawContent[i];
                switch (char) {
                    case '"': finalString += '"'; break;
                    case '\\': finalString += '\\'; break;
                    case '/': finalString += '/'; break;
                    case 'b': finalString += '\b'; break;
                    case 'f': finalString += '\f'; break;
                    case 'n': finalString += '\n'; break;
                    case 'r': finalString += '\r'; break;
                    case 't': finalString += '\t'; break;
                    case 'u':
                        // Handle Unicode escape sequences (e.g., \u000a).
                        let hexDigits = rawContent.substring(i + 1, i + 5);
                        if (!/^[0-9a-fA-F]{4}$/.test(hexDigits)) {
                            signalProblem("Invalid Unicode escape sequence");
                        }
                        finalString += String.fromCharCode(parseInt(hexDigits, 16));
                        i += 4; // Skip the 4 hex characters.
                        break;
                    default:
                        signalProblem("Invalid escape sequence '\\" + char + "'");
                }
            } else {
                finalString += char;
            }
        }
        return finalString;
    }

    // Parses a JSON number value.
    function extractNumeric() {
        const token = ensureTokenKind(SYMBOL_TYPES.NUMBER);
        consumeToken(); // Consume the number token.
        const numeric = +token.data; // Convert string to number.
        if (!Number.isFinite(numeric)) { // Check for NaN or Infinity.
            signalProblem("Bad number value");
        }
        return numeric;
    }

    // Parses JSON 'true', 'false', or 'null' keywords.
    function identifyKeyword() {
        const token = consumeToken(); // Consume the keyword token.
        switch (token.kind) {
            case SYMBOL_TYPES.TRUE_KEYWORD: return true;
            case SYMBOL_TYPES.FALSE_KEYWORD: return false;
            case SYMBOL_TYPES.NULL_KEYWORD: return null;
            default: signalProblem("Unexpected keyword token kind: " + token.kind);
        }
    }

    // Parses a JSON array structure.
    function handleList() {
        ensureTokenKind(SYMBOL_TYPES.LEFT_BRACKET);
        consumeToken(); // Consume '['.
        const items = [];
        if (peekCurrentTokenKind() !== SYMBOL_TYPES.RIGHT_BRACKET) {
            while (true) {
                items.push(evaluateElement()); // Parse each element.
                if (peekCurrentTokenKind() === SYMBOL_TYPES.RIGHT_BRACKET) {
                    break; // End of array.
                }
                ensureTokenKind(SYMBOL_TYPES.COMMA);
                consumeToken(); // Consume ','.
            }
        }
        ensureTokenKind(SYMBOL_TYPES.RIGHT_BRACKET);
        consumeToken(); // Consume ']'.
        return items;
    }

    // Parses a JSON object structure.
    function manageMap() {
        ensureTokenKind(SYMBOL_TYPES.LEFT_BRACE);
        consumeToken(); // Consume '{'.
        const dataMap = {};
        if (peekCurrentTokenKind() !== SYMBOL_TYPES.RIGHT_BRACE) {
            while (true) {
                const key = extractLiteral(); // Object keys must be strings.
                
                ensureTokenKind(SYMBOL_TYPES.COLON);
                consumeToken(); // Consume ':'.

                if (Object.prototype.hasOwnProperty.call(dataMap, key)) {
                    signalProblem('Duplicate key "' + key + '"'); // Report duplicate keys.
                }
                
                dataMap[key] = evaluateElement(); // Parse the value associated with the key.

                if (peekCurrentTokenKind() === SYMBOL_TYPES.RIGHT_BRACE) {
                    break; // End of object.
                }
                ensureTokenKind(SYMBOL_TYPES.COMMA);
                consumeToken(); // Consume ','.
            }
        }
        ensureTokenKind(SYMBOL_TYPES.RIGHT_BRACE);
        consumeToken(); // Consume '}'.
        return dataMap;
    }

    // The main dispatcher function for parsing any JSON value type.
    function evaluateElement() {
        const kind = peekCurrentTokenKind();
        switch (kind) {
            case SYMBOL_TYPES.STRING:
                return extractLiteral();
            case SYMBOL_TYPES.NUMBER:
                return extractNumeric();
            case SYMBOL_TYPES.TRUE_KEYWORD:
            case SYMBOL_TYPES.FALSE_KEYWORD:
            case SYMBOL_TYPES.NULL_KEYWORD:
                return identifyKeyword();
            case SYMBOL_TYPES.LEFT_BRACKET:
                return handleList();
            case SYMBOL_TYPES.LEFT_BRACE:
                return manageMap();
            default:
                signalProblem("Unexpected token kind: " + kind);
        }
    }

    // The public function for parsing JSON text.
    return function (inputSource, transformFunction) {
        rawInputForErrors = inputSource;
        tokenStream = tokenizeInput(inputSource);
        tokenIndex = 0; // Reset the token index for each new parsing operation.

        const primaryResult = evaluateElement();

        // Ensure no leftover tokens after parsing the main JSON structure.
        if (peekCurrentTokenKind() !== SYMBOL_TYPES.END_OF_INPUT) {
            signalProblem("Unexpected tokens after root value");
        }

        // Apply the optional reviver function, if provided.
        // This logic is functionally equivalent to the original's reviver implementation.
        return typeof transformFunction === 'function' ? (function traverseStructure(container, propKey) {
            let currentProp, subValue = container[propKey];
            if (subValue && typeof subValue === 'object') {
                for (currentProp in subValue) {
                    // Ensure it's an own property to avoid prototype chain issues.
                    if (Object.prototype.hasOwnProperty.call(subValue, currentProp)) {
                        let processed = traverseStructure(subValue, currentProp);
                        if (processed !== undefined) {
                            subValue[currentProp] = processed;
                        } else {
                            delete subValue[currentProp];
                        }
                    }
                }
            }
            return transformFunction.call(container, propKey, subValue);
        }({'': primaryResult}, '')) : primaryResult;
    };
}());