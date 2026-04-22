const patternUtility = {};

// --- Lexer Component ---
// This component is responsible for transforming the input pattern string
// into a sequence of meaningful tokens (lexemes).
function generateLexemes(sourceText) {
    const lexemeList = [];
    let processingPosition = 0;

    // Regular expressions for character classification
    const characterTests = {
        whitespace: /\s/,
        alphabeticStart: /[a-zA-Z$_]/,
        alphanumericPart: /[0-9a-zA-Z$_]/,
        numericComponent: /[0-9eE+\-.]/,
        stringBoundary: /['"]/,
        syntaxMarker: /[(),@.:|/]/
    };

    // Helper to add a token to the list
    function appendLexeme(kind, literal = '', startPos = processingPosition) {
        lexemeList.push({ kind, literal, position: startPos });
    }

    // Helper to scan characters while a condition is met
    function scanWhile(predicate) {
        let scanStart = processingPosition;
        while (processingPosition < sourceText.length && predicate(sourceText[processingPosition])) {
            processingPosition++;
        }
        return sourceText.substring(scanStart, processingPosition);
    }

    // Scan an identifier or keyword
    function scanIdentifier() {
        let scanStart = processingPosition;
        processingPosition++; // Consume the first character
        scanWhile(c => characterTests.alphanumericPart.test(c));
        return sourceText.substring(scanStart, processingPosition);
    }

    // Scan a numeric literal
    function scanNumber() {
        let scanStart = processingPosition;
        // Handle leading dot for numbers like .5
        if (sourceText[processingPosition] === '.') {
            processingPosition++;
            if (!/[0-9]/.test(sourceText[processingPosition])) {
                processingPosition = scanStart; // Backtrack if it's just a dot
                return null;
            }
        }
        scanWhile(c => characterTests.numericComponent.test(c));
        return sourceText.substring(scanStart, processingPosition);
    }

    // Scan a string literal (single or double quotes)
    function scanString() {
        const delimiter = sourceText[processingPosition++];
        let scanStart = processingPosition;
        while (processingPosition < sourceText.length && sourceText[processingPosition] !== delimiter) {
            processingPosition++;
        }
        if (processingPosition >= sourceText.length) {
            throw new Error(`Unterminated string literal starting at position ${scanStart - 1}`);
        }
        const literal = sourceText.substring(scanStart, processingPosition);
        processingPosition++; // Consume closing delimiter
        return literal;
    }

    // Main lexing loop
    while (processingPosition < sourceText.length) {
        const currentChar = sourceText[processingPosition];
        const currentLexemeStart = processingPosition;

        if (characterTests.whitespace.test(currentChar)) {
            const literal = scanWhile(c => characterTests.whitespace.test(c));
            appendLexeme('WHITESPACE', literal, currentLexemeStart);
            continue;
        }

        if (characterTests.alphabeticStart.test(currentChar)) {
            const literal = scanIdentifier();
            appendLexeme('IDENTIFIER_TOKEN', literal, currentLexemeStart);
            continue;
        }

        // Check for number before checking for '.' as a separate token
        if (/[0-9]/.test(currentChar) || (currentChar === '.' && /[0-9]/.test(sourceText[processingPosition + 1]))) {
            const literal = scanNumber();
            if (literal) { // literal could be null if it was just a '.'
                appendLexeme('NUMBER_TOKEN', literal, currentLexemeStart);
                continue;
            }
        }
        
        if (characterTests.stringBoundary.test(currentChar)) {
            const literal = scanString();
            appendLexeme('STRING_TOKEN', literal, currentLexemeStart);
            continue;
        }

        // Handle single-character syntax markers
        switch (currentChar) {
            case '(': appendLexeme('PAREN_OPEN', currentChar); processingPosition++; break;
            case ')': appendLexeme('PAREN_CLOSE', currentChar); processingPosition++; break;
            case ',': appendLexeme('COMMA_SEPARATOR', currentChar); processingPosition++; break;
            case '@': appendLexeme('BINDING_MARKER', currentChar); processingPosition++; break;
            case '.': appendLexeme('DOT_SEPARATOR', currentChar); processingPosition++; break;
            case ':': appendLexeme('COLON_SEPARATOR', currentChar); processingPosition++; break;
            case '|': appendLexeme('PIPE_SEPARATOR', currentChar); processingPosition++; break;
            case '/': appendLexeme('SLASH_MARKER', currentChar); processingPosition++; break;
            default:
                throw new Error(`Unexpected character '${currentChar}' at position ${processingPosition}`);
        }
    }

    appendLexeme('EOF_MARKER', '', processingPosition);
    return lexemeList;
}

// --- Parser Component ---
// This component takes the lexeme stream and builds an Abstract Syntax Tree (AST).

// Class to manage the token stream state
class LexemeStreamPointer {
    constructor(tokens) {
        this.lexemeSequence = tokens;
        this.currentPosition = 0;
    }

    // Returns the token at the current position without advancing
    examineNext() {
        if (this.currentPosition >= this.lexemeSequence.length) {
            // Return a synthetic EOF token for consistent handling
            return { kind: 'EOF_MARKER', literal: '', position: this.lexemeSequence.length > 0 ? this.lexemeSequence[this.lexemeSequence.length - 1].position : 0 };
        }
        return this.lexemeSequence[this.currentPosition];
    }

    // Consumes the current token and returns it
    retrieveNext() {
        const token = this.examineNext();
        if (token.kind !== 'EOF_MARKER') {
            this.currentPosition++;
        }
        return token;
    }

    // Skips all WHITESPACE tokens from the current position
    flushWhitespace() {
        while (this.examineNext().kind === 'WHITESPACE') {
            this.retrieveNext();
        }
    }

    // Peeks the next non-whitespace token
    peekSignificant() {
        this.flushWhitespace();
        return this.examineNext();
    }

    // Consumes the next non-whitespace token, ensuring it's of the expected kind
    requireAndAdvance(expectedKind, errorMsg = null) {
        const token = this.retrieveNext(); // Retrieve raw token first
        if (token.kind === 'WHITESPACE') { // If it was whitespace, get the next one
            this.flushWhitespace();
            token = this.retrieveNext();
        }

        if (token.kind !== expectedKind) {
            throw new Error(errorMsg || `Unexpected token '${token.literal}' of kind '${token.kind}' at position ${token.position}. Expected '${expectedKind}'.`);
        }
        return token;
    }

    // Checks if there are more tokens (including whitespace)
    stillRemaining() {
        return this.currentPosition < this.lexemeSequence.length;
    }

    // Get current position (for error reporting)
    getCurrentAbsolutePosition() {
        return this.examineNext().position;
    }
}

// AST Node classes, providing a structured representation of the pattern
class SyntacticNode {
    constructor(nodeKind, constituentNodes = [], designatedName = null) {
        this.classification = nodeKind;
        this.constituents = constituentNodes;
        this.designation = designatedName; // The variable name this node might be bound to
    }
}

class PropertyNode extends SyntacticNode {
    constructor(propertyName, isPrototypeProperty, constituentNodes = [], designatedName = null) {
        super(isPrototypeProperty ? 'PROTOTYPE_PROPERTY' : 'OWN_PROPERTY', constituentNodes, designatedName);
        this.attributeName = propertyName;
    }
}

class ValueNode extends SyntacticNode {
    constructor(value, valueCategory, designatedName = null) {
        super('LITERAL_VALUE', [], designatedName);
        this.dataValue = value;
        this.valueCategory = valueCategory; // e.g., 'NUMBER', 'STRING', 'BOOLEAN', 'DATE', 'REGEX'
    }
}

// --- Parser Functions ---

// Handles the binding logic (e.g., '@name')
function determineBinding(tokenPointer, targetNode) {
    tokenPointer.requireAndAdvance('BINDING_MARKER'); // Consume '@'
    const bindingIdentifierToken = tokenPointer.requireAndAdvance('IDENTIFIER_TOKEN'); // Get binding name

    if (bindingIdentifierToken.literal.length === 0) {
        throw new Error(`Empty binding name at position ${bindingIdentifierToken.position} for node type ${targetNode.classification}`);
    }
    targetNode.designation = bindingIdentifierToken.literal;
}

// Parses an array pattern, e.g., 'a(n, s@name, |rest)' or 'a@list'
function parseArrayStructure(tokenPointer, parentCollection) {
    tokenPointer.requireAndAdvance('IDENTIFIER_TOKEN', `Expected 'a' for array pattern.`);
    const arrayNode = new SyntacticNode('ARRAY_PATTERN');
    parentCollection.push(arrayNode);

    // Check for binding immediately after 'a' (e.g., 'a@list')
    if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
        determineBinding(tokenPointer, arrayNode);
        return arrayNode;
    }

    // Check for array pattern content 'a(...)'
    if (tokenPointer.peekSignificant().kind === 'PAREN_OPEN') {
        tokenPointer.requireAndAdvance('PAREN_OPEN'); // Consume '('

        // Handle empty array pattern 'a()'
        if (tokenPointer.peekSignificant().kind === 'PAREN_CLOSE') {
            arrayNode.classification = 'EMPTY_ARRAY_PATTERN'; // Specific type for empty array
            tokenPointer.requireAndAdvance('PAREN_CLOSE');
            // Check for binding after 'a()'
            if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
                determineBinding(tokenPointer, arrayNode);
            }
            return arrayNode;
        }

        // Parse array elements
        while (true) {
            tokenPointer.flushWhitespace();
            if (tokenPointer.peekSignificant().kind === 'PIPE_SEPARATOR') {
                break; // Found '|' for rest of array
            }
            constructSyntaxTree(tokenPointer, arrayNode.constituents); // Recursively parse child patterns
            tokenPointer.flushWhitespace();
            if (tokenPointer.peekSignificant().kind !== 'COMMA_SEPARATOR') {
                break; // End of elements
            }
            tokenPointer.requireAndAdvance('COMMA_SEPARATOR');
        }

        // Handle rest of array element '|'
        if (tokenPointer.peekSignificant().kind === 'PIPE_SEPARATOR') {
            tokenPointer.requireAndAdvance('PIPE_SEPARATOR');
            const restNode = new SyntacticNode('ARRAY_REST_ELEMENT');
            arrayNode.constituents.push(restNode);
            tokenPointer.flushWhitespace();
            if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
                determineBinding(tokenPointer, restNode);
                tokenPointer.flushWhitespace();
            }
        }

        tokenPointer.requireAndAdvance('PAREN_CLOSE', `Expected ')' to close array pattern.`);
        
        // Check for binding after 'a(...)'
        if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
            determineBinding(tokenPointer, arrayNode);
        }
    }
    return arrayNode;
}

// Parses an object pattern, e.g., 'o(.prop, :otherProp:o(.x))' or 'o@obj'
function handleObjectStructure(tokenPointer, parentCollection) {
    tokenPointer.requireAndAdvance('IDENTIFIER_TOKEN', `Expected 'o' for object pattern.`);
    const objectNode = new SyntacticNode('OBJECT_PATTERN');
    parentCollection.push(objectNode);

    // Check for binding immediately after 'o' (e.g., 'o@obj')
    if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
        determineBinding(tokenPointer, objectNode);
        return objectNode;
    }

    // Check for object pattern content 'o(...)'
    if (tokenPointer.peekSignificant().kind === 'PAREN_OPEN') {
        tokenPointer.requireAndAdvance('PAREN_OPEN'); // Consume '('

        while (true) {
            tokenPointer.flushWhitespace();
            const nextSignificant = tokenPointer.peekSignificant();
            let isPrototype = false;

            if (nextSignificant.kind === 'DOT_SEPARATOR') {
                tokenPointer.retrieveNext(); // Consume '.' for own property
            } else if (nextSignificant.kind === 'COLON_SEPARATOR') {
                tokenPointer.retrieveNext(); // Consume ':' for prototype property
                isPrototype = true;
            } else {
                break; // End of properties or unexpected token
            }

            const propertyNameToken = tokenPointer.requireAndAdvance('IDENTIFIER_TOKEN');
            
            const propertyNode = new PropertyNode(propertyNameToken.literal, isPrototype);
            objectNode.constituents.push(propertyNode);

            // Check for nested pattern or type specifier for the property value
            if (tokenPointer.peekSignificant().kind === 'COLON_SEPARATOR') { // e.g., o(.coord:o(.x, .y))
                tokenPointer.retrieveNext(); // Consume ':'
                constructSyntaxTree(tokenPointer, propertyNode.constituents);
            }

            // Check for binding on the property value (e.g., .prop@val)
            if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
                determineBinding(tokenPointer, propertyNode);
            }
            
            tokenPointer.flushWhitespace();
            if (tokenPointer.peekSignificant().kind !== 'COMMA_SEPARATOR') {
                break; // End of properties
            }
            tokenPointer.requireAndAdvance('COMMA_SEPARATOR');
        }

        tokenPointer.requireAndAdvance('PAREN_CLOSE', `Expected ')' to close object pattern.`);
        
        // Check for binding after 'o(...)'
        if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
            determineBinding(tokenPointer, objectNode);
        }
    }
    return objectNode;
}

// Parses generic type patterns (n, s, b, f, d, r, _)
function evaluateGenericType(tokenPointer, parentCollection, typeChar) {
    tokenPointer.requireAndAdvance('IDENTIFIER_TOKEN', `Expected generic type identifier.`);
    const genericNode = new SyntacticNode(`GENERIC_TYPE_${typeChar.toUpperCase()}`);
    parentCollection.push(genericNode);

    // Check for literal list (e.g., s("a", "b"), n(1, 2))
    if (tokenPointer.peekSignificant().kind === 'PAREN_OPEN') {
        genericNode.classification = 'LITERAL_LIST_MATCH'; // Redefine node type for literal lists
        tokenPointer.requireAndAdvance('PAREN_OPEN');

        while (true) {
            tokenPointer.flushWhitespace();
            let literalValueNode = null;
            switch (typeChar) {
                case 's': literalValueNode = extractStringOrRegexLiteral(tokenPointer); break;
                case 'n': literalValueNode = extractNumericLiteral(tokenPointer); break;
                case 'b': literalValueNode = extractBooleanLiteral(tokenPointer); break;
                case 'd': literalValueNode = extractDateLiteral(tokenPointer); break;
                case 'f': // 'f' (function) does not support literal lists in original
                case 'r': // 'r' (regex) does not support literal lists in original
                case '_': // '_' (any) does not support literal lists in original
                    throw new Error(`Literal list not supported for type '${typeChar}' at position ${tokenPointer.getCurrentAbsolutePosition()}`);
                default:
                    throw new Error(`Unrecognized generic type '${typeChar}' for literal list at position ${tokenPointer.getCurrentAbsolutePosition()}`);
            }
            genericNode.constituents.push(literalValueNode);
            tokenPointer.flushWhitespace();
            if (tokenPointer.peekSignificant().kind !== 'COMMA_SEPARATOR') {
                break; // End of literal list
            }
            tokenPointer.requireAndAdvance('COMMA_SEPARATOR');
        }
        tokenPointer.requireAndAdvance('PAREN_CLOSE', `Expected ')' to close literal list.`);
    }

    // Check for binding on the generic type (e.g., n@value)
    if (tokenPointer.peekSignificant().kind === 'BINDING_MARKER') {
        determineBinding(tokenPointer, genericNode);
    }
    return genericNode;
}

// Extracts a string or regex literal from the token stream
function extractStringOrRegexLiteral(tokenPointer) {
    const nextSignificant = tokenPointer.peekSignificant();
    if (nextSignificant.kind === 'SLASH_MARKER') {
        tokenPointer.retrieveNext(); // Consume '/'
        const regexStartPos = tokenPointer.getCurrentAbsolutePosition();
        let regexLiteral = '';
        while(tokenPointer.examineNext().kind !== 'SLASH_MARKER' && tokenPointer.stillRemaining()) {
            regexLiteral += tokenPointer.retrieveNext().literal;
        }
        if (tokenPointer.examineNext().kind !== 'SLASH_MARKER') {
            throw new Error(`Unterminated regex literal starting at position ${regexStartPos}`);
        }
        tokenPointer.retrieveNext(); // Consume closing '/'
        try {
            return new ValueNode(new RegExp(regexLiteral), 'REGEX');
        } catch (e) {
            throw new Error(`Invalid regex pattern '${regexLiteral}' at position ${regexStartPos}: ${e.message}`);
        }
    } else if (nextSignificant.kind === 'STRING_TOKEN') {
        const strToken = tokenPointer.requireAndAdvance('STRING_TOKEN');
        return new ValueNode(strToken.literal, 'STRING');
    } else {
        throw new Error(`Expected string or regex literal but got '${nextSignificant.literal}' at position ${nextSignificant.position}`);
    }
}

// Extracts a numeric literal
function extractNumericLiteral(tokenPointer) {
    const numToken = tokenPointer.requireAndAdvance('NUMBER_TOKEN', `Expected numeric literal.`);
    const value = parseFloat(numToken.literal);
    if (isNaN(value) || !isFinite(value)) {
        throw new Error(`Invalid numeric literal '${numToken.literal}' at position ${numToken.position}`);
    }
    return new ValueNode(value, 'NUMBER');
}

// Extracts a boolean literal ('true' or 'false')
function extractBooleanLiteral(tokenPointer) {
    const boolToken = tokenPointer.requireAndAdvance('IDENTIFIER_TOKEN', `Expected boolean literal 'true' or 'false'.`);
    if (boolToken.literal === 'true') {
        return new ValueNode(true, 'BOOLEAN');
    } else if (boolToken.literal === 'false') {
        return new ValueNode(false, 'BOOLEAN');
    } else {
        throw new Error(`Expected 'true' or 'false' but got '${boolToken.literal}' at position ${boolToken.position}`);
    }
}

// Extracts a date literal (from a string)
function extractDateLiteral(tokenPointer) {
    const strToken = tokenPointer.requireAndAdvance('STRING_TOKEN', `Expected string for date literal.`);
    const date = new Date(strToken.literal);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string '${strToken.literal}' at position ${strToken.position}`);
    }
    return new ValueNode(date, 'DATE');
}

// Entry point for recursive descent parsing
function constructSyntaxTree(tokenPointer, parentCollection) {
    if (!tokenPointer.stillRemaining()) {
        return parentCollection;
    }

    const nextToken = tokenPointer.peekSignificant();
    
    switch (nextToken.literal) {
        case 'a':
            parseArrayStructure(tokenPointer, parentCollection);
            break;
        case 'o':
            handleObjectStructure(tokenPointer, parentCollection);
            break;
        case 'n':
        case 's':
        case 'b':
        case 'f':
        case 'd':
        case 'r':
        case '_': // Generic types
            evaluateGenericType(tokenPointer, parentCollection, nextToken.literal);
            break;
        default:
            throw new Error(`Unexpected pattern type identifier '${nextToken.literal}' at position ${nextToken.position}. Expected one of (a,o,n,s,b,f,d,r,_)`);
    }
    
    return parentCollection;
}

// Main factory function for the pattern processor
patternUtility.createPatternProcessor = function (sourceText) {
    "use strict";

    if (!sourceText || sourceText.length === 0) {
        throw new Error("Cannot process empty pattern string.");
    }

    const lexemes = generateLexemes(sourceText);
    const tokenPointer = new LexemeStreamPointer(lexemes);

    return {
        process: function () {
            const rootAST = [];
            
            constructSyntaxTree(tokenPointer, rootAST);
            tokenPointer.flushWhitespace();

            if (tokenPointer.examineNext().kind !== 'EOF_MARKER') {
                throw new Error(`Unexpected tokens found after parsing: '${sourceText.substring(tokenPointer.getCurrentAbsolutePosition())}'`);
            }
            return rootAST;
        }
    };
};