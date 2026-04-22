(function() {

    // --- Core Utility Functions (renamed to avoid original identifiers) ---

    // Analogous to original 'map'
    function transformCollection(items, transformer, contextObj) {
        const resultList = [];
        const itemCount = items.length;
        if (typeof transformer !== "function") {
            throw new TypeError("Transformation function must be callable.");
        }
        for (let i = 0; i < itemCount; i++) {
            if (i in items) {
                resultList.push(transformer.call(contextObj, items[i], i, items));
            }
        }
        return resultList;
    }

    // Analogous to original 'filter'
    function narrowCollection(items, predicate, contextObj) {
        const resultList = [];
        const itemCount = items.length;
        if (typeof predicate !== "function") {
            throw new TypeError("Predicate function must be callable.");
        }
        for (let i = 0; i < itemCount; i++) {
            if (i in items) {
                const currentVal = items[i];
                if (predicate.call(contextObj, currentVal, i, items)) {
                    resultList.push(currentVal);
                }
            }
        }
        return resultList;
    }

    // Analogous to original 'slice'
    function extractRange(dataStructure, startPos, endPos, stepSize) {
        const dataLength = dataStructure.length;
        const resultList = [];
        const finalStep = stepSize === undefined || stepSize === null ? 1 : stepSize;

        let resolvedStart = (startPos === undefined || startPos === null) ? 0 : startPos;
        let resolvedEnd = (endPos === undefined || endPos === null) ? dataLength : endPos;

        resolvedStart = (resolvedStart < 0) ? Math.max(0, resolvedStart + dataLength) : Math.min(dataLength, resolvedStart);
        resolvedEnd = (resolvedEnd < 0) ? Math.max(0, resolvedEnd + dataLength) : Math.min(dataLength, resolvedEnd);

        if (finalStep > 0) {
            for (let i = resolvedStart; i < resolvedEnd; i += finalStep) {
                resultList.push(dataStructure[i]);
            }
        } else if (finalStep < 0) {
            for (let i = resolvedStart; i > resolvedEnd; i += finalStep) {
                resultList.push(dataStructure[i]);
            }
        }
        return resultList;
    }

    // Analogous to original 'distinctFilter'
    function uniqueFilteredCollection(items, predicate, contextObj) {
        const outputItems = [];
        const seenPrimitives = new Set();
        const seenObjects = new WeakSet(); // For objects, to avoid modifying them or using temporary properties

        for (let i = 0; i < items.length; ++i) {
            const currentItem = items[i];
            if (predicate.call(contextObj, currentItem, i, items)) {
                if (typeof currentItem === 'object' && currentItem !== null) {
                    if (!seenObjects.has(currentItem)) {
                        seenObjects.add(currentItem);
                        outputItems.push(currentItem);
                    }
                } else {
                    const primitiveKey = String(currentItem) + typeof currentItem;
                    if (!seenPrimitives.has(primitiveKey)) {
                        seenPrimitives.add(primitiveKey);
                        outputItems.push(currentItem);
                    }
                }
            }
        }
        return outputItems;
    }

    // Wildcard comparison logic, analogous to original makeRegex part
    function matchWithWildcards(text, pattern, caseInsensitive) {
        if (typeof text !== 'string' || typeof pattern !== 'string') {
            return false; // Only compare strings with wildcards
        }
        const escapedPattern = pattern
            .replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&') // Escape regex special chars
            .replace(/\*/g, '.*') // Convert * to .*
            .replace(/\?/g, '.'); // Convert ? to .

        const regex = new RegExp('^' + escapedPattern + '$', caseInsensitive ? 'i' : '');
        return regex.test(text);
    }

    // --- Lexer (Tokenizer) ---

    const TokenKind = {
        EOF: 'EOF',
        DOT: 'DOT',
        DOUBLE_DOT: 'DOUBLE_DOT',
        LBRACKET: 'LBRACKET',
        RBRACKET: 'RBRACKET',
        QUESTION: 'QUESTION',
        CARET: 'CARET',
        SLASH: 'SLASH',
        BACKSLASH: 'BACKSLASH',
        COLON: 'COLON',
        COMMA: 'COMMA',
        STAR: 'STAR',
        IDENTIFIER: 'IDENTIFIER',
        NUMBER: 'NUMBER',
        STRING: 'STRING',
        OPERATOR: 'OPERATOR', // For binary/unary operators like ==, !=, >, <, +, -, *, /, %, &, |
        DOLLAR: 'DOLLAR',
        AT_SIGN: 'AT_SIGN',
        TILDE: 'TILDE', // For case-insensitive comparison
        LPAREN: 'LPAREN',
        RPAREN: 'RPAREN',
        ASSIGN: 'ASSIGN' // For = in [=expr] map operator
    };

    const OperatorMap = {
        '==': 'EQ',
        '!=': 'NEQ',
        '>=': 'GTE',
        '<=': 'LTE',
        '>': 'GT',
        '<': 'LT',
        '+': 'ADD',
        '-': 'SUB',
        '*': 'MUL',
        '/': 'DIV',
        '%': 'MOD',
        '&&': 'AND',
        '||': 'OR',
        '!': 'NOT',
        '~': 'TILDE' // Case-insensitive string comparison
    };

    class PathExpressionTokenizer {
        constructor(text) {
            this.input = text;
            this.position = 0;
            this.tokens = [];
            this.lexeme = '';
        }

        isWhitespace(char) { return /\s/.test(char); }
        isDigit(char) { return /\d/.test(char); }
        isAlpha(char) { return /[a-zA-Z_$]/.test(char); } // Allow $ in identifier for things like $1
        isAlphaNumeric(char) { return /[a-zA-Z0-9_$]/.test(char); }

        peek(offset = 0) {
            if (this.position + offset >= this.input.length) return null;
            return this.input[this.position + offset];
        }

        advance() {
            if (this.position < this.input.length) {
                return this.input[this.position++];
            }
            return null;
        }

        addToken(kind, value = this.lexeme) {
            this.tokens.push({ kind, value });
            this.lexeme = '';
        }

        readWhile(predicate) {
            while (this.peek() !== null && predicate(this.peek())) {
                this.lexeme += this.advance();
            }
        }

        scanTokens() {
            while (this.position < this.input.length) {
                const char = this.peek();
                this.lexeme = '';

                if (this.isWhitespace(char)) {
                    this.advance();
                    continue;
                }

                switch (char) {
                    case '$':
                        if (this.isDigit(this.peek(1))) { // $1, $2, etc.
                            this.lexeme += this.advance(); // consume $
                            this.readWhile(this.isDigit); // consume digits
                            this.addToken(TokenKind.IDENTIFIER, this.lexeme); // Treat as identifier for now, parser will resolve
                        } else {
                            this.lexeme += this.advance();
                            this.addToken(TokenKind.DOLLAR);
                        }
                        break;
                    case '@':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.AT_SIGN);
                        break;
                    case '[':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.LBRACKET);
                        break;
                    case ']':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.RBRACKET);
                        break;
                    case '(':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.LPAREN);
                        break;
                    case ')':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.RPAREN);
                        break;
                    case '?':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.QUESTION);
                        break;
                    case '^':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.CARET);
                        break;
                    case '/':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.SLASH);
                        break;
                    case '\\':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.BACKSLASH);
                        break;
                    case ':':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.COLON);
                        break;
                    case ',':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.COMMA);
                        break;
                    case '*':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.STAR);
                        break;
                    case '.':
                        this.lexeme += this.advance();
                        if (this.peek() === '.') {
                            this.lexeme += this.advance();
                            this.addToken(TokenKind.DOUBLE_DOT);
                        } else {
                            this.addToken(TokenKind.DOT);
                        }
                        break;
                    case '=':
                        this.lexeme += this.advance();
                        if (this.peek() === '=') {
                            this.lexeme += this.advance(); // ==
                            this.addToken(TokenKind.OPERATOR, OperatorMap['==']);
                        } else {
                            this.addToken(TokenKind.ASSIGN); // For [=expr] or general assignment in future
                        }
                        break;
                    case '!':
                        this.lexeme += this.advance();
                        if (this.peek() === '=') {
                            this.lexeme += this.advance(); // !=
                            this.addToken(TokenKind.OPERATOR, OperatorMap['!=']);
                        } else {
                            this.addToken(TokenKind.OPERATOR, OperatorMap['!']); // Unary NOT
                        }
                        break;
                    case '>':
                        this.lexeme += this.advance();
                        if (this.peek() === '=') {
                            this.lexeme += this.advance(); // >=
                            this.addToken(TokenKind.OPERATOR, OperatorMap['>=']);
                        } else {
                            this.addToken(TokenKind.OPERATOR, OperatorMap['>']);
                        }
                        break;
                    case '<':
                        this.lexeme += this.advance();
                        if (this.peek() === '=') {
                            this.lexeme += this.advance(); // <=
                            this.addToken(TokenKind.OPERATOR, OperatorMap['<=']);
                        } else {
                            this.addToken(TokenKind.OPERATOR, OperatorMap['<']);
                        }
                        break;
                    case '+': case '-': case '%':
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.OPERATOR, OperatorMap[this.lexeme]);
                        break;
                    case '&':
                        this.lexeme += this.advance();
                        if (this.peek() === '&') {
                            this.lexeme += this.advance(); // &&
                            this.addToken(TokenKind.OPERATOR, OperatorMap['&&']);
                        } else {
                            // Bitwise AND not supported by original, but if it were, this would be the place.
                            throw new Error(`Unexpected character: ${char} at position ${this.position - 1}. Did you mean '&&'?`);
                        }
                        break;
                    case '|':
                        this.lexeme += this.advance();
                        if (this.peek() === '|') {
                            this.lexeme += this.advance(); // ||
                            this.addToken(TokenKind.OPERATOR, OperatorMap['||']);
                        } else {
                            // Bitwise OR not supported by original.
                            throw new Error(`Unexpected character: ${char} at position ${this.position - 1}. Did you mean '||'?`);
                        }
                        break;
                    case '~': // Case-insensitive comparison
                        this.lexeme += this.advance();
                        this.addToken(TokenKind.TILDE);
                        break;
                    case '"':
                    case "'":
                        this.readStringLiteral(char);
                        break;
                    default:
                        if (this.isDigit(char)) {
                            this.readNumberLiteral();
                        } else if (this.isAlpha(char)) {
                            this.readIdentifier();
                        } else {
                            throw new Error(`Unexpected character: ${char} at position ${this.position - 1}`);
                        }
                        break;
                }
            }
            this.addToken(TokenKind.EOF, null);
        }

        readStringLiteral(quoteChar) {
            this.advance(); // Consume the opening quote
            let value = '';
            while (this.peek() !== null && this.peek() !== quoteChar) {
                if (this.peek() === '\\') { // Handle escape sequences
                    this.advance(); // Consume '\'
                    const escapedChar = this.advance();
                    switch (escapedChar) {
                        case 'n': value += '\n'; break;
                        case 't': value += '\t'; break;
                        case 'r': value += '\r'; break;
                        case 'b': value += '\b'; break;
                        case 'f': value += '\f'; break;
                        case "'": value += "'"; break;
                        case '"': value += '"'; break;
                        case '\\': value += '\\'; break;
                        default: value += escapedChar; // For other escaped chars, just take the char
                    }
                } else {
                    value += this.advance();
                }
            }
            if (this.peek() !== quoteChar) {
                throw new Error("Unterminated string literal.");
            }
            this.advance(); // Consume the closing quote
            this.addToken(TokenKind.STRING, value);
        }

        readNumberLiteral() {
            this.readWhile(this.isDigit);
            if (this.peek() === '.' && this.isDigit(this.peek(1))) {
                this.lexeme += this.advance(); // Consume '.'
                this.readWhile(this.isDigit);
            }
            this.addToken(TokenKind.NUMBER, parseFloat(this.lexeme));
        }

        readIdentifier() {
            this.readWhile(this.isAlphaNumeric);
            const identifierValue = this.lexeme;
            // Check for keywords like 'true', 'false', 'null' which are part of expressions
            if (identifierValue === 'true') {
                 this.addToken(TokenKind.OPERATOR, 'TRUE');
            } else if (identifierValue === 'false') {
                 this.addToken(TokenKind.OPERATOR, 'FALSE');
            } else if (identifierValue === 'null') {
                 this.addToken(TokenKind.OPERATOR, 'NULL');
            } else if (identifierValue === 'and') {
                 this.addToken(TokenKind.OPERATOR, 'AND');
            } else if (identifierValue === 'or') {
                 this.addToken(TokenKind.OPERATOR, 'OR');
            } else {
                 this.addToken(TokenKind.IDENTIFIER, identifierValue);
            }
        }

        getAllTokens() {
            this.scanTokens();
            return this.tokens;
        }
    }

    // --- AST Nodes ---
    // Using plain objects for simplicity, each node has a 'kind' property.

    const NodeKind = {
        QUERY_ROOT: 'QueryRoot',
        PROPERTY_ACCESS: 'PropertyAccess',
        INDEX_ACCESS: 'IndexAccess',
        FILTER_OP: 'FilterOperation',
        UNIQUE_FILTER_OP: 'UniqueFilterOperation',
        SORT_OP: 'SortOperation',
        MAP_OP: 'MapOperation',
        SLICE_OP: 'SliceOperation',
        UNION_OP: 'UnionOperation',
        WILDCARD_PROPERTIES: 'WildcardProperties',
        RECURSIVE_ALL: 'RecursiveAll', // ..
        RECURSIVE_PROPERTY: 'RecursiveProperty', // ..prop
        LITERAL_VALUE: 'LiteralValue',
        IDENTIFIER: 'Identifier',
        BINARY_EXPR: 'BinaryExpression',
        UNARY_EXPR: 'UnaryExpression',
        PARAM_REFERENCE: 'ParameterReference',
        CURRENT_ITEM: 'CurrentItem', // @
        ROOT_ITEM: 'RootItem', // $
        EXPRESSION_GROUP: 'ExpressionGroup',
        SORT_CRITERION: 'SortCriterion'
    };

    // --- Parser (Syntax Analyzer) ---

    class QuerySyntaxAnalyzer {
        constructor(tokens) {
            this.tokens = tokens;
            this.currentTokenIndex = 0;
        }

        peek(offset = 0) {
            if (this.currentTokenIndex + offset >= this.tokens.length) {
                return { kind: TokenKind.EOF, value: null };
            }
            return this.tokens[this.currentTokenIndex + offset];
        }

        consume(expectedKind) {
            const token = this.peek();
            if (token.kind === expectedKind) {
                this.currentTokenIndex++;
                return token;
            }
            throw new Error(`Expected token kind ${expectedKind} but got ${token.kind} with value '${token.value}' at index ${this.currentTokenIndex}`);
        }

        match(...kinds) {
            for (const kind of kinds) {
                if (this.peek().kind === kind) {
                    return true;
                }
            }
            return false;
        }

        parse() {
            let ast = { kind: NodeKind.QUERY_ROOT, segments: [] };
            let currentTargetNode = null;

            // Handle implicit '$' at the start if not present
            if (this.peek().kind === TokenKind.DOLLAR) {
                this.consume(TokenKind.DOLLAR);
                currentTargetNode = { kind: NodeKind.ROOT_ITEM };
            } else {
                currentTargetNode = { kind: NodeKind.ROOT_ITEM }; // Implicit root
            }

            while (this.peek().kind !== TokenKind.EOF) {
                currentTargetNode = this.parseSegment(currentTargetNode);
                ast.segments.push(currentTargetNode);
            }
            return ast;
        }

        parseSegment(previousTargetNode) {
            const nextToken = this.peek();

            switch (nextToken.kind) {
                case TokenKind.DOT:
                    this.consume(TokenKind.DOT);
                    if (this.peek().kind === TokenKind.STAR) { // .*
                        this.consume(TokenKind.STAR);
                        return { kind: NodeKind.WILDCARD_PROPERTIES, target: previousTargetNode };
                    }
                    const propToken = this.consume(TokenKind.IDENTIFIER);
                    return { kind: NodeKind.PROPERTY_ACCESS, target: previousTargetNode, key: propToken.value };
                case TokenKind.DOUBLE_DOT:
                    this.consume(TokenKind.DOUBLE_DOT);
                    if (this.peek().kind === TokenKind.IDENTIFIER) { // ..prop
                        const recursivePropToken = this.consume(TokenKind.IDENTIFIER);
                        return { kind: NodeKind.RECURSIVE_PROPERTY, target: previousTargetNode, key: recursivePropToken.value };
                    } else if (this.peek().kind === TokenKind.LBRACKET && this.peek(1).kind === TokenKind.QUESTION) { // ..[?expr]
                        // This is a recursive filter. The filter itself will be a segment
                        // The recursive part wraps the filter.
                        const filterSegment = this.parseBracketedOperation({ kind: NodeKind.CURRENT_ITEM }); // Filter operates on current recursive item
                        return { kind: NodeKind.RECURSIVE_ALL, target: previousTargetNode, nestedOperation: filterSegment };
                    } else { // .. (recursive all values)
                         return { kind: NodeKind.RECURSIVE_ALL, target: previousTargetNode, nestedOperation: null };
                    }
                case TokenKind.LBRACKET:
                    return this.parseBracketedOperation(previousTargetNode);
                case TokenKind.QUESTION: // ?expr (standalone filter)
                    this.consume(TokenKind.QUESTION);
                    const filterExpr = this.parseExpression();
                    return { kind: NodeKind.FILTER_OP, target: previousTargetNode, expression: filterExpr };
                default:
                    // This case should ideally not be reached if the query is well-formed
                    // and all prefixes are handled. If it's not EOF, it's an error.
                    if (nextToken.kind !== TokenKind.EOF) {
                        throw new Error(`Unexpected token '${nextToken.value}' (${nextToken.kind}) at position ${this.currentTokenIndex} when parsing segment.`);
                    }
                    return previousTargetNode;
            }
        }

        parseBracketedOperation(previousTargetNode) {
            this.consume(TokenKind.LBRACKET);
            const firstInnerToken = this.peek();

            if (firstInnerToken.kind === TokenKind.QUESTION) { // [?expr]
                this.consume(TokenKind.QUESTION);
                const filterExpression = this.parseExpression();
                this.consume(TokenKind.RBRACKET);
                return { kind: NodeKind.FILTER_OP, target: previousTargetNode, expression: filterExpression };
            } else if (firstInnerToken.kind === TokenKind.CARET && this.peek(1).kind === TokenKind.QUESTION) { // [^?expr]
                this.consume(TokenKind.CARET);
                this.consume(TokenKind.QUESTION);
                const distinctFilterExpression = this.parseExpression();
                this.consume(TokenKind.RBRACKET);
                return { kind: NodeKind.UNIQUE_FILTER_OP, target: previousTargetNode, expression: distinctFilterExpression };
            } else if (firstInnerToken.kind === TokenKind.SLASH || firstInnerToken.kind === TokenKind.BACKSLASH) { // [/expr] or [\expr]
                const sortCriteria = [];
                while (this.peek().kind === TokenKind.SLASH || this.peek().kind === TokenKind.BACKSLASH) {
                    const direction = this.consume(this.peek().kind); // SLASH for asc, BACKSLASH for desc
                    const sortExpr = this.parseExpression();
                    sortCriteria.push({ kind: NodeKind.SORT_CRITERION, expression: sortExpr, ascending: direction.kind === TokenKind.SLASH });
                    if (this.peek().kind === TokenKind.COMMA) {
                        this.consume(TokenKind.COMMA);
                    }
                }
                this.consume(TokenKind.RBRACKET);
                return { kind: NodeKind.SORT_OP, target: previousTargetNode, criteria: sortCriteria };
            } else if (firstInnerToken.kind === TokenKind.ASSIGN) { // [=expr]
                this.consume(TokenKind.ASSIGN);
                const mapExpression = this.parseExpression();
                this.consume(TokenKind.RBRACKET);
                return { kind: NodeKind.MAP_OP, target: previousTargetNode, expression: mapExpression };
            } else if (firstInnerToken.kind === TokenKind.COLON || firstInnerToken.kind === TokenKind.NUMBER || (this.peek(1) && this.peek(1).kind === TokenKind.COLON)) { // [start:end:step]
                let start = null, end = null, step = null;
                if (this.peek().kind !== TokenKind.COLON) {
                    start = this.parseExpression();
                }
                if (this.peek().kind === TokenKind.COLON) {
                    this.consume(TokenKind.COLON);
                    if (this.peek().kind !== TokenKind.COLON && this.peek().kind !== TokenKind.RBRACKET && this.peek().kind !== TokenKind.COMMA) {
                        end = this.parseExpression();
                    }
                }
                if (this.peek().kind === TokenKind.COLON) {
                    this.consume(TokenKind.COLON);
                    if (this.peek().kind !== TokenKind.RBRACKET && this.peek().kind !== TokenKind.COMMA) {
                        step = this.parseExpression();
                    }
                }
                this.consume(TokenKind.RBRACKET);
                return { kind: NodeKind.SLICE_OP, target: previousTargetNode, start: start, end: end, step: step };
            } else if (firstInnerToken.kind === TokenKind.STAR) { // [*]
                this.consume(TokenKind.STAR);
                this.consume(TokenKind.RBRACKET);
                return { kind: NodeKind.WILDCARD_PROPERTIES, target: previousTargetNode };
            } else { // [expr, expr] (union) or [index] or [propName]
                const expressions = [];
                expressions.push(this.parseExpression());
                while (this.peek().kind === TokenKind.COMMA) {
                    this.consume(TokenKind.COMMA);
                    expressions.push(this.parseExpression());
                }
                this.consume(TokenKind.RBRACKET);
                if (expressions.length === 1) { // Single expression, could be index or property name
                    const expr = expressions[0];
                    if (expr.kind === NodeKind.LITERAL_VALUE && typeof expr.value === 'number') {
                        return { kind: NodeKind.INDEX_ACCESS, target: previousTargetNode, index: expr };
                    } else if (expr.kind === NodeKind.LITERAL_VALUE && typeof expr.value === 'string') {
                        return { kind: NodeKind.PROPERTY_ACCESS, target: previousTargetNode, key: expr.value };
                    } else if (expr.kind === NodeKind.IDENTIFIER) { // [propName] where propName is an identifier
                         return { kind: NodeKind.PROPERTY_ACCESS, target: previousTargetNode, key: expr.name };
                    }
                    // Fallback for complex expressions that resolve to a single key/index
                    return { kind: NodeKind.INDEX_ACCESS, target: previousTargetNode, index: expr }; // Treat as dynamic index/key
                } else { // Multiple expressions, union
                    return { kind: NodeKind.UNION_OP, target: previousTargetNode, expressions: expressions };
                }
            }
        }

        // --- Expression Parsing (similar to standard arithmetic/boolean expression parsing) ---
        parseExpression() {
            return this.parseLogicalOr();
        }

        parseLogicalOr() {
            let expr = this.parseLogicalAnd();
            while (this.match(TokenKind.OPERATOR) && this.peek().value === 'OR') {
                const operatorToken = this.consume(TokenKind.OPERATOR);
                const right = this.parseLogicalAnd();
                expr = { kind: NodeKind.BINARY_EXPR, left: expr, operator: operatorToken.value, right: right };
            }
            return expr;
        }

        parseLogicalAnd() {
            let expr = this.parseEquality();
            while (this.match(TokenKind.OPERATOR) && this.peek().value === 'AND') {
                const operatorToken = this.consume(TokenKind.OPERATOR);
                const right = this.parseEquality();
                expr = { kind: NodeKind.BINARY_EXPR, left: expr, operator: operatorToken.value, right: right };
            }
            return expr;
        }

        parseEquality() {
            let expr = this.parseComparison();
            while (this.match(TokenKind.OPERATOR, TokenKind.TILDE)) {
                const operatorToken = this.consume(this.peek().kind === TokenKind.TILDE ? TokenKind.TILDE : TokenKind.OPERATOR);
                const right = this.parseComparison();
                expr = { kind: NodeKind.BINARY_EXPR, left: expr, operator: operatorToken.kind === TokenKind.TILDE ? OperatorMap['~'] : operatorToken.value, right: right };
            }
            return expr;
        }

        parseComparison() {
            let expr = this.parseAdditive();
            while (this.match(TokenKind.OPERATOR) && (this.peek().value === 'GT' || this.peek().value === 'GTE' || this.peek().value === 'LT' || this.peek().value === 'LTE')) {
                const operatorToken = this.consume(TokenKind.OPERATOR);
                const right = this.parseAdditive();
                expr = { kind: NodeKind.BINARY_EXPR, left: expr, operator: operatorToken.value, right: right };
            }
            return expr;
        }

        parseAdditive() {
            let expr = this.parseMultiplicative();
            while (this.match(TokenKind.OPERATOR) && (this.peek().value === 'ADD' || this.peek().value === 'SUB')) {
                const operatorToken = this.consume(TokenKind.OPERATOR);
                const right = this.parseMultiplicative();
                expr = { kind: NodeKind.BINARY_EXPR, left: expr, operator: operatorToken.value, right: right };
            }
            return expr;
        }

        parseMultiplicative() {
            let expr = this.parseUnary();
            while (this.match(TokenKind.OPERATOR) && (this.peek().value === 'MUL' || this.peek().value === 'DIV' || this.peek().value === 'MOD')) {
                const operatorToken = this.consume(TokenKind.OPERATOR);
                const right = this.parseUnary();
                expr = { kind: NodeKind.BINARY_EXPR, left: expr, operator: operatorToken.value, right: right };
            }
            return expr;
        }

        parseUnary() {
            if (this.match(TokenKind.OPERATOR) && (this.peek().value === 'SUB' || this.peek().value === 'NOT')) { // Unary minus or logical NOT
                const operatorToken = this.consume(TokenKind.OPERATOR);
                const right = this.parseUnary();
                return { kind: NodeKind.UNARY_EXPR, operator: operatorToken.value, operand: right };
            }
            return this.parsePrimary();
        }

        parsePrimary() {
            const token = this.peek();
            switch (token.kind) {
                case TokenKind.NUMBER:
                    this.consume(TokenKind.NUMBER);
                    return { kind: NodeKind.LITERAL_VALUE, value: token.value };
                case TokenKind.STRING:
                    this.consume(TokenKind.STRING);
                    return { kind: NodeKind.LITERAL_VALUE, value: token.value };
                case TokenKind.OPERATOR: // true, false, null
                    if (token.value === 'TRUE') { this.consume(TokenKind.OPERATOR); return { kind: NodeKind.LITERAL_VALUE, value: true }; }
                    if (token.value === 'FALSE') { this.consume(TokenKind.OPERATOR); return { kind: NodeKind.LITERAL_VALUE, value: false }; }
                    if (token.value === 'NULL') { this.consume(TokenKind.OPERATOR); return { kind: NodeKind.LITERAL_VALUE, value: null }; }
                    break;
                case TokenKind.IDENTIFIER:
                    this.consume(TokenKind.IDENTIFIER);
                    // Parameter references $1, $2... are parsed as identifiers by lexer, now resolve
                    if (token.value.match(/^\$[1-9]$/)) {
                        return { kind: NodeKind.PARAM_REFERENCE, index: parseInt(token.value.substring(1), 10) - 1 };
                    }
                    // It's a property access relative to @ by default in expressions
                    return { kind: NodeKind.PROPERTY_ACCESS, target: { kind: NodeKind.CURRENT_ITEM }, key: token.value };
                case TokenKind.DOLLAR:
                    this.consume(TokenKind.DOLLAR);
                    // This is for root access within an expression (e.g., $$.prop or $.prop)
                    // The initial $ is handled by parse() to set the overall target.
                    // This refers to the root object.
                    return { kind: NodeKind.ROOT_ITEM };
                case TokenKind.AT_SIGN:
                    this.consume(TokenKind.AT_SIGN);
                    return { kind: NodeKind.CURRENT_ITEM };
                case TokenKind.LPAREN:
                    this.consume(TokenKind.LPAREN);
                    const expr = this.parseExpression();
                    this.consume(TokenKind.RPAREN);
                    return { kind: NodeKind.EXPRESSION_GROUP, expression: expr };
            }
            throw new Error(`Unexpected token '${token.value}' (${token.kind}) when parsing primary expression.`);
        }
    }

    // --- Interpreter (Execution Engine) ---

    class QueryExecutionEngine {
        constructor() {
            this.evaluators = {
                [NodeKind.QUERY_ROOT]: this._evalQueryRoot,
                [NodeKind.PROPERTY_ACCESS]: this._evalPropertyAccess,
                [NodeKind.INDEX_ACCESS]: this._evalIndexAccess,
                [NodeKind.FILTER_OP]: this._evalFilterOperation,
                [NodeKind.UNIQUE_FILTER_OP]: this._evalUniqueFilterOperation,
                [NodeKind.SORT_OP]: this._evalSortOperation,
                [NodeKind.MAP_OP]: this._evalMapOperation,
                [NodeKind.SLICE_OP]: this._evalSliceOperation,
                [NodeKind.UNION_OP]: this._evalUnionOperation,
                [NodeKind.WILDCARD_PROPERTIES]: this._evalWildcardProperties,
                [NodeKind.RECURSIVE_ALL]: this._evalRecursiveAll,
                [NodeKind.RECURSIVE_PROPERTY]: this._evalRecursiveProperty,
                [NodeKind.LITERAL_VALUE]: this._evalLiteralValue,
                [NodeKind.IDENTIFIER]: this._evalIdentifier,
                [NodeKind.BINARY_EXPR]: this._evalBinaryExpression,
                [NodeKind.UNARY_EXPR]: this._evalUnaryExpression,
                [NodeKind.PARAM_REFERENCE]: this._evalParameterReference,
                [NodeKind.CURRENT_ITEM]: this._evalCurrentItem,
                [NodeKind.ROOT_ITEM]: this._evalRootItem,
                [NodeKind.EXPRESSION_GROUP]: this._evalExpressionGroup
            };
        }

        execute(ast, initialData, rootData, params) {
            let currentResult = initialData;

            for (const segment of ast.segments) {
                currentResult = this.evaluate(segment, currentResult, rootData, params);
            }
            return currentResult;
        }

        evaluate(node, context, rootData, params) {
            if (!node) return undefined;

            const evaluator = this.evaluators[node.kind];
            if (evaluator) {
                return evaluator.call(this, node, context, rootData, params);
            }
            throw new Error(`Unknown AST node kind: ${node.kind}`);
        }

        _evalQueryRoot(node, context, rootData, params) {
            // This node represents the overall query, its segments are processed sequentially.
            return context;
        }

        _evalPropertyAccess(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            const key = node.key; // Key is a string literal from parser

            if (Array.isArray(target)) {
                const results = [];
                target.forEach(item => {
                    if (item && typeof item === 'object' && item.hasOwnProperty(key)) {
                        results.push(item[key]);
                    } else {
                        // Original behavior: if property not found or item not an object, nothing is added.
                    }
                });
                return results;
            } else if (target && typeof target === 'object' && target.hasOwnProperty(key)) {
                return target[key];
            }
            return undefined;
        }

        _evalIndexAccess(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            const indexValue = this.evaluate(node.index, context, rootData, params);

            if (Array.isArray(target) && typeof indexValue === 'number') {
                return target[indexValue];
            } else if (target && typeof target === 'object' && typeof indexValue === 'string') {
                 // Allow string keys for objects, e.g., obj['prop']
                return target[indexValue];
            }
            return undefined;
        }

        _evalFilterOperation(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (!Array.isArray(target)) {
                // If not an array, filter applies to the single item.
                const predicateFn = (item) => this.evaluate(node.expression, item, rootData, params);
                if (predicateFn(target)) {
                    return [target]; // Return as an array, matching array-filter output
                }
                return [];
            }
            const predicateFn = (item) => this.evaluate(node.expression, item, rootData, params);
            return narrowCollection(target, predicateFn);
        }

        _evalUniqueFilterOperation(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (!Array.isArray(target)) {
                 const predicateFn = (item) => this.evaluate(node.expression, item, rootData, params);
                if (predicateFn(target)) {
                    return [target];
                }
                return [];
            }
            const predicateFn = (item) => this.evaluate(node.expression, item, rootData, params);
            return uniqueFilteredCollection(target, predicateFn);
        }

        _evalSortOperation(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (!Array.isArray(target)) {
                return target; // Sort only applies to arrays
            }

            // Create a shallow copy to sort without modifying original
            const sortableArray = [...target];

            sortableArray.sort((a, b) => {
                for (const criterion of node.criteria) {
                    const valA = this.evaluate(criterion.expression, a, rootData, params);
                    const valB = this.evaluate(criterion.expression, b, rootData, params);

                    // Original behavior: null/undefined are considered "smaller" than non-null.
                    // If both are null/undefined, they are equal for this criterion.
                    if (valA === null || valA === undefined) {
                        if (valB === null || valB === undefined) continue;
                        return criterion.ascending ? -1 : 1;
                    }
                    if (valB === null || valB === undefined) {
                        return criterion.ascending ? 1 : -1;
                    }

                    if (valA > valB) {
                        return criterion.ascending ? 1 : -1;
                    }
                    if (valA < valB) {
                        return criterion.ascending ? -1 : 1;
                    }
                }
                return 0; // Equal according to all criteria
            });
            return sortableArray;
        }

        _evalMapOperation(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (!Array.isArray(target)) {
                // If not an array, map applies to the single item.
                return this.evaluate(node.expression, target, rootData, params);
            }
            const mapperFn = (item) => this.evaluate(node.expression, item, rootData, params);
            return transformCollection(target, mapperFn);
        }

        _evalSliceOperation(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (!Array.isArray(target)) {
                return target; // Slice only applies to arrays
            }
            const start = node.start ? this.evaluate(node.start, context, rootData, params) : undefined;
            const end = node.end ? this.evaluate(node.end, context, rootData, params) : undefined;
            const step = node.step ? this.evaluate(node.step, context, rootData, params) : undefined;

            return extractRange(target, start, end, step);
        }

        _evalUnionOperation(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            const results = [];
            for (const expr of node.expressions) {
                // For union, each expression is evaluated against the target.
                // The original code uses `results.push(obj[name[i]])` directly.
                // This means if `name[i]` resolves to an array, it's pushed as an array element, not flattened.
                // Replicate this by using _evalPropertyAccess or _evalIndexAccess directly.
                let evaluatedValue;
                if (expr.kind === NodeKind.LITERAL_VALUE && typeof expr.value === 'number') {
                    evaluatedValue = this._evalIndexAccess({ kind: NodeKind.INDEX_ACCESS, target: node.target, index: expr }, context, rootData, params);
                } else if (expr.kind === NodeKind.LITERAL_VALUE && typeof expr.value === 'string') {
                    evaluatedValue = this._evalPropertyAccess({ kind: NodeKind.PROPERTY_ACCESS, target: node.target, key: expr.value }, context, rootData, params);
                } else if (expr.kind === NodeKind.IDENTIFIER) {
                    evaluatedValue = this._evalPropertyAccess({ kind: NodeKind.PROPERTY_ACCESS, target: node.target, key: expr.name }, context, rootData, params);
                } else {
                    // For more complex expressions that might resolve to a key/index
                    const resolvedKeyOrIndex = this.evaluate(expr, context, rootData, params);
                    if (typeof resolvedKeyOrIndex === 'number') {
                        evaluatedValue = this._evalIndexAccess({ kind: NodeKind.INDEX_ACCESS, target: node.target, index: { kind: NodeKind.LITERAL_VALUE, value: resolvedKeyOrIndex } }, context, rootData, params);
                    } else if (typeof resolvedKeyOrIndex === 'string') {
                        evaluatedValue = this._evalPropertyAccess({ kind: NodeKind.PROPERTY_ACCESS, target: node.target, key: resolvedKeyOrIndex }, context, rootData, params);
                    } else {
                        evaluatedValue = undefined; // Expression didn't resolve to a valid key/index
                    }
                }

                if (evaluatedValue !== undefined) {
                    // If the target is an array and we're unioning properties, it can return an array of arrays
                    // e.g. [{a:1,b:2},{a:3,b:4}][a,b] -> [[1,2],[3,4]]
                    // The original code `results.push(obj[name[i]])` does not flatten.
                    if (Array.isArray(target) && (expr.kind === NodeKind.LITERAL_VALUE || expr.kind === NodeKind.IDENTIFIER)) {
                        // If target is an array, and the union expression is a simple key/index,
                        // each element of the target array will yield a value or undefined.
                        // The `_evalPropertyAccess` and `_evalIndexAccess` for an array target *already* returns an array of results.
                        // So, we just push that array.
                        results.push(evaluatedValue);
                    } else {
                        // For single object targets, or complex expressions, push the single value.
                        results.push(evaluatedValue);
                    }
                }
            }
            // Flatten the results if they contain arrays of results from array targets
            return results.flat(1); // Only flatten one level, to match what original `push` behavior implies.
        }


        _evalWildcardProperties(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            const results = [];

            if (Array.isArray(target)) {
                // For `[*]`, `.*` on an array, it returns values of properties of objects within the array.
                // If array contains primitives, they are included. If it contains nested arrays, they are included.
                target.forEach(item => {
                    if (item && typeof item === 'object') {
                        if (Array.isArray(item)) {
                            results.push(item); // Keep nested arrays as is
                        } else {
                            for (const key in item) {
                                if (Object.prototype.hasOwnProperty.call(item, key)) {
                                    results.push(item[key]);
                                }
                            }
                        }
                    } else { // Primitives in array
                        results.push(item);
                    }
                });
            } else if (target && typeof target === 'object') {
                for (const key in target) {
                    if (Object.prototype.hasOwnProperty.call(target, key)) {
                        results.push(target[key]);
                    }
                }
            }
            return results;
        }

        _evalRecursiveAll(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (target === undefined || target === null) return [];

            const results = [];
            const visited = new WeakSet(); // To prevent infinite loops with circular references

            const deepWalk = (currentValue) => {
                if (currentValue === null || typeof currentValue !== 'object') {
                    return;
                }
                if (visited.has(currentValue)) {
                    return;
                }
                visited.add(currentValue);

                if (node.nestedOperation) { // ..[?expr]
                    // The nested operation is a filter that evaluates on the 'currentValue'
                    const evaluated = this.evaluate(node.nestedOperation, currentValue, rootData, params);
                    if (Array.isArray(evaluated)) {
                        results.push(...evaluated);
                    } else if (evaluated !== undefined) {
                         results.push(evaluated);
                    }
                } else { // .. (recursive all objects/arrays)
                    // The original `expand` with `name===true` pushes the object itself for recursive object search
                    // then iterates properties.
                    if (!Array.isArray(currentValue)) { // Only push objects, not arrays themselves
                         results.push(currentValue);
                    }
                }

                if (Array.isArray(currentValue)) {
                    currentValue.forEach(item => deepWalk(item));
                } else {
                    for (const key in currentValue) {
                        if (Object.prototype.hasOwnProperty.call(currentValue, key)) {
                            deepWalk(currentValue[key]);
                        }
                    }
                }
            };

            deepWalk(target);
            return results;
        }


        _evalRecursiveProperty(node, context, rootData, params) {
            const target = this.evaluate(node.target, context, rootData, params);
            if (target === undefined || target === null) return [];

            const results = [];
            const visited = new WeakSet();

            const deepWalkProp = (currentValue) => {
                if (currentValue === null || typeof currentValue !== 'object') {
                    return;
                }
                if (visited.has(currentValue)) {
                    return;
                }
                visited.add(currentValue);

                if (currentValue.hasOwnProperty(node.key)) {
                    results.push(currentValue[node.key]);
                }

                if (Array.isArray(currentValue)) {
                    currentValue.forEach(item => deepWalkProp(item));
                } else {
                    for (const key in currentValue) {
                        if (Object.prototype.hasOwnProperty.call(currentValue, key)) {
                            deepWalkProp(currentValue[key]);
                        }
                    }
                }
            };
            deepWalkProp(target);
            return results;
        }

        _evalLiteralValue(node, context, rootData, params) {
            return node.value;
        }

        _evalIdentifier(node, context, rootData, params) {
            // This node kind should typically be resolved to a property access relative to '@'
            // or a parameter reference earlier in parsing. If it gets here, it's an error
            // or an unhandled case. For robustness, if an identifier is evaluated directly,
            // assume it refers to a property of the current context.
            if (context && typeof context === 'object' && context.hasOwnProperty(node.name)) {
                return context[node.name];
            }
            return undefined;
        }

        _evalBinaryExpression(node, context, rootData, params) {
            const leftVal = this.evaluate(node.left, context, rootData, params);
            const rightVal = this.evaluate(node.right, context, rootData, params);

            switch (node.operator) {
                case 'EQ': return leftVal == rightVal;
                case 'NEQ': return leftVal != rightVal;
                case 'GT': return leftVal > rightVal;
                case 'GTE': return leftVal >= rightVal;
                case 'LT': return leftVal < rightVal;
                case 'LTE': return leftVal <= rightVal;
                case 'ADD': return leftVal + rightVal;
                case 'SUB': return leftVal - rightVal;
                case 'MUL': return leftVal * rightVal;
                case 'DIV': return leftVal / rightVal;
                case 'MOD': return leftVal % rightVal;
                case 'AND': return leftVal && rightVal;
                case 'OR': return leftVal || rightVal;
                case 'TILDE': return matchWithWildcards(leftVal, rightVal, true); // Case-insensitive wildcard match
                default: throw new Error(`Unknown binary operator: ${node.operator}`);
            }
        }

        _evalUnaryExpression(node, context, rootData, params) {
            const operandVal = this.evaluate(node.operand, context, rootData, params);
            switch (node.operator) {
                case 'SUB': return -operandVal;
                case 'NOT': return !operandVal;
                default: throw new Error(`Unknown unary operator: ${node.operator}`);
            }
        }

        _evalParameterReference(node, context, rootData, params) {
            // $1, $2, etc. refer to params[0], params[1], etc.
            return params[node.index];
        }

        _evalCurrentItem(node, context, rootData, params) {
            return context;
        }

        _evalRootItem(node, context, rootData, params) {
            return rootData;
        }

        _evalExpressionGroup(node, context, rootData, params) {
            return this.evaluate(node.expression, context, rootData, params);
        }
    }

    // --- Main entry point (renamed to avoid original identifier) ---
    const processStructuredData = function(pathQueryString, initialDataObject, ...extraParams) {
        // 1. Pre-process query (add '$' if missing, similar to original)
        let processedQuery = pathQueryString.trim();
        // The original logic checks if the first char is '$'. If not, it prepends '$'.
        // It also checks for `[` to avoid prepending `$` when it's a bracketed operation on root.
        // For example, `[?prop]` implicitly operates on the root.
        if (processedQuery.length > 0 && processedQuery.charAt(0) !== '$') {
            // If it starts with `?` or `[`, it implicitly operates on the root, so prepend '$'
            // The parser will then correctly interpret `$`, followed by the operation.
            // The original JSONQuery prepends '$' if not present, then its parser
            // adds '$obj.' to plain names. My parser handles plain names as properties of '@'
            // within expressions, and prepends '$' for the main query path.
            processedQuery = '$' + processedQuery;
        }

        // 2. Tokenize
        const tokenizer = new PathExpressionTokenizer(processedQuery);
        const tokens = tokenizer.getAllTokens();

        // 3. Parse to AST
        const parser = new QuerySyntaxAnalyzer(tokens);
        const ast = parser.parse();

        // 4. Create an execution engine instance
        const engine = new QueryExecutionEngine();

        // 5. Define the function that will execute the AST
        const executionFunction = function(dataObject, ...runtimeParams) {
            // Combine initial extraParams from processStructuredData call with runtimeParams
            const allParams = extraParams.concat(runtimeParams);
            return engine.execute(ast, dataObject, dataObject, allParams);
        };

        // 6. If initialDataObject is provided, execute immediately. Otherwise, return the function.
        if (initialDataObject !== undefined) {
            return executionFunction(initialDataObject);
        } else {
            return executionFunction;
        }
    };

    // Global exposure (renamed to avoid original identifier)
    if (typeof namespace === "function") {
        namespace("json::DataPathProcessor", processStructuredData);
    } else {
        window["DataPathProcessor"] = processStructuredData;
    }
})();