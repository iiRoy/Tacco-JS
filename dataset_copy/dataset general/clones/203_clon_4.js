var expressionProcessor = (function() {

    // --- Token Definitions ---
    const TokenKind = {
        NUMBER_LITERAL: 'NUMBER_LITERAL',
        IDENTIFIER_NAME: 'IDENTIFIER_NAME',
        OP_PLUS: 'OP_PLUS',
        OP_MINUS: 'OP_MINUS',
        OP_MULTIPLY: 'OP_MULTIPLY',
        OP_DIVIDE: 'OP_DIVIDE',
        OP_MODULO: 'OP_MODULO',
        OP_POWER: 'OP_POWER', // ^ for Math.pow
        OP_LSHIFT: 'OP_LSHIFT',
        OP_RSHIFT: 'OP_RSHIFT',
        OP_URSHIFT: 'OP_URSHIFT',
        OP_BITAND: 'OP_BITAND',
        OP_BITOR: 'OP_BITOR',
        OP_BITXOR: 'OP_BITXOR', // ^| for bitwise XOR
        OP_BITNOT: 'OP_BITNOT',
        PAREN_OPEN: 'PAREN_OPEN',
        PAREN_CLOSE: 'PAREN_CLOSE',
        COMMA_DELIMITER: 'COMMA_DELIMITER',
        EOF_MARKER: 'EOF_MARKER',
        UNKNOWN: 'UNKNOWN'
    };

    // --- Tokenizer (Lexer) ---
    class SymbolStream {
        constructor(textInput) {
            this.sourceText = textInput;
            this.currentPosition = 0;
            this.lineCounter = 1;
            this.columnCounter = 0;
            this.cachedTokens = [];
            this.cachedTokenIndex = 0;
            this.tokenize(); // Pre-tokenize the entire input
        }

        tokenize() {
            const tokenRegexes = [
                { kind: TokenKind.OP_URSHIFT, regex: /^>>>/ },
                { kind: TokenKind.OP_RSHIFT, regex: /^>>/ },
                { kind: TokenKind.OP_LSHIFT, regex: /^<</ },
                { kind: TokenKind.OP_BITXOR, regex: /^\^\|/ }, // Must be before OP_POWER
                { kind: TokenKind.OP_POWER, regex: /^\^/ },
                { kind: TokenKind.OP_PLUS, regex: /^\+/ },
                { kind: TokenKind.OP_MINUS, regex: /^-/ },
                { kind: TokenKind.OP_MULTIPLY, regex: /^\*/ },
                { kind: TokenKind.OP_DIVIDE, regex: /^\// },
                { kind: TokenKind.OP_MODULO, regex: /^%/ },
                { kind: TokenKind.OP_BITAND, regex: /^&/ },
                { kind: TokenKind.OP_BITOR, regex: /^\|/ },
                { kind: TokenKind.OP_BITNOT, regex: /^~/ },
                { kind: TokenKind.PAREN_OPEN, regex: /^\(/ },
                { kind: TokenKind.PAREN_CLOSE, regex: /^\)/ },
                { kind: TokenKind.COMMA_DELIMITER, regex: /^,/ },
                { kind: TokenKind.NUMBER_LITERAL, regex: /^\d+(\.\d*)?([eE][+-]?\d+)?/ },
                { kind: TokenKind.IDENTIFIER_NAME, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ }
            ];

            while (this.currentPosition < this.sourceText.length) {
                let segment = this.sourceText.substring(this.currentPosition);

                // Skip whitespace
                const whitespaceMatch = segment.match(/^\s+/);
                if (whitespaceMatch) {
                    const ws = whitespaceMatch[0];
                    const lines = ws.split('\n');
                    this.lineCounter += lines.length - 1;
                    if (lines.length > 1) {
                        this.columnCounter = ws.length - ws.lastIndexOf('\n') - 1;
                    } else {
                        this.columnCounter += ws.length;
                    }
                    this.currentPosition += ws.length;
                    continue;
                }

                let matched = false;
                for (const { kind, regex } of tokenRegexes) {
                    const match = segment.match(regex);
                    if (match) {
                        const value = match[0];
                        this.cachedTokens.push({
                            kind: kind,
                            value: value,
                            line: this.lineCounter,
                            column: this.columnCounter
                        });
                        this.currentPosition += value.length;
                        this.columnCounter += value.length;
                        matched = true;
                        break;
                    }
                }

                if (!matched) {
                    throw new Error(`Syntax Error on line ${this.lineCounter}, column ${this.columnCounter}: Unexpected character '${segment[0]}'`);
                }
            }
            this.cachedTokens.push({
                kind: TokenKind.EOF_MARKER,
                value: '',
                line: this.lineCounter,
                column: this.columnCounter
            });
        }

        viewNextToken() {
            return this.cachedTokens[this.cachedTokenIndex];
        }

        retrieveNextToken() {
            if (this.cachedTokenIndex >= this.cachedTokens.length) {
                return { kind: TokenKind.EOF_MARKER, value: '', line: this.lineCounter, column: this.columnCounter };
            }
            return this.cachedTokens[this.cachedTokenIndex++];
        }

        expectToken(expectedKind) {
            const token = this.retrieveNextToken();
            if (token.kind !== expectedKind) {
                throw new Error(`Syntax Error on line ${token.line}, column ${token.column}: Expected ${expectedKind}, got ${token.kind} ('${token.value}')`);
            }
            return token;
        }

        hasMoreTokens() {
            return this.viewNextToken().kind !== TokenKind.EOF_MARKER;
        }
    }

    // --- Abstract Syntax Tree Nodes ---
    class AbstractExpressionNode {
        constructor(type) {
            this.nodeType = type;
        }
        evaluate(functionRegistry, variableStore) {
            throw new Error(`Evaluation not implemented for node type: ${this.nodeType}`);
        }
    }

    class LiteralNumericNode extends AbstractExpressionNode {
        constructor(val) {
            super('NumericLiteral');
            this.numValue = Number(val);
        }
        evaluate() {
            return this.numValue;
        }
    }

    class ReferenceSymbolNode extends AbstractExpressionNode {
        constructor(symName) {
            super('Identifier');
            this.symbolName = symName;
        }
        evaluate(functionRegistry, variableStore) {
            let tempValue;
            if (Object.prototype.hasOwnProperty.call(variableStore, this.symbolName)) {
                tempValue = variableStore[this.symbolName];
            } else {
                throw new Error(`No such variable with name: ${this.symbolName}`);
            }
            return tempValue;
        }
    }

    class UnaryOperationNode extends AbstractExpressionNode {
        constructor(op, operandNode) {
            super('UnaryOperation');
            this.operator = op;
            this.operand = operandNode;
        }
        evaluate(functionRegistry, variableStore) {
            const operandResult = this.operand.evaluate(functionRegistry, variableStore);
            switch (this.operator) {
                case TokenKind.OP_MINUS:
                    return -operandResult;
                case TokenKind.OP_BITNOT:
                    return ~operandResult;
                default:
                    throw new Error(`Unknown unary operator: ${this.operator}`);
            }
        }
    }

    class BinaryOperationNode extends AbstractExpressionNode {
        constructor(op, leftNode, rightNode) {
            super('BinaryOperation');
            this.operator = op;
            this.left = leftNode;
            this.right = rightNode;
        }
        evaluate(functionRegistry, variableStore) {
            const leftResult = this.left.evaluate(functionRegistry, variableStore);
            const rightResult = this.right.evaluate(functionRegistry, variableStore);
            switch (this.operator) {
                case TokenKind.OP_PLUS:
                    return leftResult + rightResult;
                case TokenKind.OP_MINUS:
                    return leftResult - rightResult;
                case TokenKind.OP_MULTIPLY:
                    return leftResult * rightResult;
                case TokenKind.OP_DIVIDE:
                    return leftResult / rightResult;
                case TokenKind.OP_MODULO:
                    return leftResult % rightResult;
                case TokenKind.OP_POWER:
                    return Math.pow(leftResult, rightResult);
                case TokenKind.OP_LSHIFT:
                    return leftResult << rightResult;
                case TokenKind.OP_RSHIFT:
                    return leftResult >> rightResult;
                case TokenKind.OP_URSHIFT:
                    return leftResult >>> rightResult;
                case TokenKind.OP_BITAND:
                    return leftResult & rightResult;
                case TokenKind.OP_BITOR:
                    return leftResult | rightResult;
                case TokenKind.OP_BITXOR:
                    return leftResult ^ rightResult;
                default:
                    throw new Error(`Unknown binary operator: ${this.operator}`);
            }
        }
    }

    class FunctionCallNode extends AbstractExpressionNode {
        constructor(funcName, argNodes) {
            super('FunctionCall');
            this.functionName = funcName;
            this.argumentNodes = argNodes;
        }
        evaluate(functionRegistry, variableStore) {
            let tempValue;
            if (Object.prototype.hasOwnProperty.call(functionRegistry, this.functionName) && typeof functionRegistry[this.functionName] === 'function') {
                const evaluatedArgs = this.argumentNodes.map(argNode => argNode.evaluate(functionRegistry, variableStore));
                tempValue = functionRegistry[this.functionName](...evaluatedArgs);
            } else {
                throw new Error(`No such function with name: ${this.functionName}`);
            }
            return tempValue;
        }
    }

    // --- Parser (Recursive Descent) ---
    class SyntaxAnalyzer {
        constructor(expressionText) {
            this.tokenSource = new SymbolStream(expressionText);
        }

        // Entry point for parsing an entire expression (equation)
        parseExpressionSequence() {
            const expressionRoot = this.parseBitwiseOr();
            this.tokenSource.expectToken(TokenKind.EOF_MARKER);
            return new CompiledExpressionUnit(expressionRoot);
        }

        // Operator precedence parsing functions (from lowest to highest)
        parseBitwiseOr() {
            let left = this.parseBitwiseXor();
            while (this.tokenSource.viewNextToken().kind === TokenKind.OP_BITOR) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parseBitwiseXor();
                left = new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parseBitwiseXor() {
            let left = this.parseBitwiseAnd();
            while (this.tokenSource.viewNextToken().kind === TokenKind.OP_BITXOR) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parseBitwiseAnd();
                left = new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parseBitwiseAnd() {
            let left = this.parseShiftOps();
            while (this.tokenSource.viewNextToken().kind === TokenKind.OP_BITAND) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parseShiftOps();
                left = new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parseShiftOps() {
            let left = this.parseAddSub();
            while ([TokenKind.OP_LSHIFT, TokenKind.OP_RSHIFT, TokenKind.OP_URSHIFT].includes(this.tokenSource.viewNextToken().kind)) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parseAddSub();
                left = new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parseAddSub() {
            let left = this.parseMulDivMod();
            while ([TokenKind.OP_PLUS, TokenKind.OP_MINUS].includes(this.tokenSource.viewNextToken().kind)) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parseMulDivMod();
                left = new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parseMulDivMod() {
            let left = this.parsePower();
            while ([TokenKind.OP_MULTIPLY, TokenKind.OP_DIVIDE, TokenKind.OP_MODULO].includes(this.tokenSource.viewNextToken().kind)) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parsePower();
                left = new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parsePower() { // Right-associative
            let left = this.parseUnary();
            if (this.tokenSource.viewNextToken().kind === TokenKind.OP_POWER) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const right = this.parsePower(); // Recursive call for right-associativity
                return new BinaryOperationNode(operatorToken.kind, left, right);
            }
            return left;
        }

        parseUnary() {
            const nextToken = this.tokenSource.viewNextToken();
            if ([TokenKind.OP_MINUS, TokenKind.OP_BITNOT].includes(nextToken.kind)) {
                const operatorToken = this.tokenSource.retrieveNextToken();
                const operand = this.parseUnary(); // Unary operators can be stacked (e.g., --5, ~~5)
                return new UnaryOperationNode(operatorToken.kind, operand);
            }
            return this.parsePrimary();
        }

        parsePrimary() {
            const nextToken = this.tokenSource.viewNextToken();
            if (nextToken.kind === TokenKind.NUMBER_LITERAL) {
                return new LiteralNumericNode(this.tokenSource.retrieveNextToken().value);
            } else if (nextToken.kind === TokenKind.IDENTIFIER_NAME) {
                const identifierToken = this.tokenSource.retrieveNextToken();
                if (this.tokenSource.viewNextToken().kind === TokenKind.PAREN_OPEN) {
                    this.tokenSource.expectToken(TokenKind.PAREN_OPEN);
                    const args = this.parseArguments();
                    this.tokenSource.expectToken(TokenKind.PAREN_CLOSE);
                    return new FunctionCallNode(identifierToken.value, args);
                }
                return new ReferenceSymbolNode(identifierToken.value);
            } else if (nextToken.kind === TokenKind.PAREN_OPEN) {
                this.tokenSource.expectToken(TokenKind.PAREN_OPEN);
                const innerExpression = this.parseBitwiseOr(); // Start from lowest precedence for inner expression
                this.tokenSource.expectToken(TokenKind.PAREN_CLOSE);
                return innerExpression;
            } else {
                throw new Error(`Syntax Error on line ${nextToken.line}, column ${nextToken.column}: Unexpected token ${nextToken.kind} ('${nextToken.value}')`);
            }
        }

        parseArguments() {
            const argumentList = [];
            if (this.tokenSource.viewNextToken().kind === TokenKind.PAREN_CLOSE) {
                return argumentList; // No arguments
            }
            argumentList.push(this.parseBitwiseOr()); // First argument
            while (this.tokenSource.viewNextToken().kind === TokenKind.COMMA_DELIMITER) {
                this.tokenSource.expectToken(TokenKind.COMMA_DELIMITER);
                argumentList.push(this.parseBitwiseOr());
            }
            return argumentList;
        }
    }

    // --- Compiled Expression Unit ---
    class CompiledExpressionUnit {
        constructor(abstractSyntaxTreeRoot) {
            this.abstractTree = abstractSyntaxTreeRoot;
        }

        // This method replaces the 'new Function(...)' part of the original.
        // It directly evaluates the AST.
        execute(functionRegistry, variableStore) {
            if (!functionRegistry || typeof functionRegistry !== 'object') {
                functionRegistry = {};
            }
            if (!variableStore || typeof variableStore !== 'object') {
                variableStore = {};
            }
            return this.abstractTree.evaluate(functionRegistry, variableStore);
        }
    }

    // Public API for the clone
    return {
        // This 'process' method is the equivalent of the original 'mathparser.parse'
        process: function(expressionText) {
            const analyzer = new SyntaxAnalyzer(expressionText);
            return analyzer.parseExpressionSequence();
        }
    };
})();