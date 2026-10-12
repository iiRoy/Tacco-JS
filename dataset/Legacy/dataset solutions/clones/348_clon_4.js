"use strict";

var utilModule = require("util");
var outputLog = console.log;

const TOKEN_NUMBER = 'NUMERIC_VALUE_TOKEN';
const TOKEN_ADD = 'ADDITION_SYMBOL';
const TOKEN_SUB = 'SUBTRACTION_SYMBOL';
const TOKEN_MUL = 'MULTIPLICATION_SYMBOL';
const TOKEN_DIV = 'DIVISION_SYMBOL';
const TOKEN_OPEN_PAREN = 'LEFT_PAREN_SYMBOL';
const TOKEN_CLOSE_PAREN = 'RIGHT_PAREN_SYMBOL';

const AST_LITERAL = 'LITERAL_NODE';
const AST_BINARY_OP = 'BINARY_OPERATION_NODE';

function createExpressionTokenizer(inputString) {
    let currentCharacterPosition = 0;
    const generatedTokenList = [];

    while (currentCharacterPosition < inputString.length) {
        let char = inputString[currentCharacterPosition];

        if (/\s/.test(char)) {
            currentCharacterPosition++;
            continue;
        }

        if (/\d/.test(char)) {
            let numberString = '';
            while (currentCharacterPosition < inputString.length && /\d/.test(inputString[currentCharacterPosition])) {
                numberString += inputString[currentCharacterPosition];
                currentCharacterPosition++;
            }
            generatedTokenList.push({ kind: TOKEN_NUMBER, val: parseInt(numberString, 10) });
            continue;
        }

        switch (char) {
            case '+': generatedTokenList.push({ kind: TOKEN_ADD }); break;
            case '-': generatedTokenList.push({ kind: TOKEN_SUB }); break;
            case '*': generatedTokenList.push({ kind: TOKEN_MUL }); break;
            case '/': generatedTokenList.push({ kind: TOKEN_DIV }); break;
            case '(': generatedTokenList.push({ kind: TOKEN_OPEN_PAREN }); break;
            case ')': generatedTokenList.push({ kind: TOKEN_CLOSE_PAREN }); break;
            default: throw new Error(`Unexpected character encountered: ${char}`);
        }
        currentCharacterPosition++;
    }
    return generatedTokenList;
}

class SyntaxTreeBuilder {
    constructor(tokenArray) {
        this.tokenSequence = tokenArray;
        this.currentSequenceIndex = 0;
    }

    peekToken() {
        return this.tokenSequence[this.currentSequenceIndex];
    }

    consumeToken() {
        if (this.currentSequenceIndex >= this.tokenSequence.length) {
            throw new Error("Unexpected end of token stream");
        }
        return this.tokenSequence[this.currentSequenceIndex++];
    }

    constructTree() {
        return this.parseAdditionSubtraction();
    }

    parseAdditionSubtraction() {
        let leftNode = this.parseMultiplicationDivision();

        while (this.peekToken() && (this.peekToken().kind === TOKEN_ADD || this.peekToken().kind === TOKEN_SUB)) {
            const operatorToken = this.consumeToken();
            const rightNode = this.parseMultiplicationDivision();
            leftNode = {
                nodeType: AST_BINARY_OP,
                operation: operatorToken.kind,
                leftOperand: leftNode,
                rightOperand: rightNode
            };
        }
        return leftNode;
    }

    parseMultiplicationDivision() {
        let leftNode = this.parseAtomicExpression();

        while (this.peekToken() && (this.peekToken().kind === TOKEN_MUL || this.peekToken().kind === TOKEN_DIV)) {
            const operatorToken = this.consumeToken();
            const rightNode = this.parseAtomicExpression();
            leftNode = {
                nodeType: AST_BINARY_OP,
                operation: operatorToken.kind,
                leftOperand: leftNode,
                rightOperand: rightNode
            };
        }
        return leftNode;
    }

    parseAtomicExpression() {
        const current = this.peekToken();

        if (current.kind === TOKEN_NUMBER) {
            return { nodeType: AST_LITERAL, value: this.consumeToken().val };
        } else if (current.kind === TOKEN_OPEN_PAREN) {
            this.consumeToken();
            const innerExpression = this.parseAdditionSubtraction();
            if (!this.peekToken() || this.peekToken().kind !== TOKEN_CLOSE_PAREN) {
                throw new Error("Missing closing parenthesis ')'");
            }
            this.consumeToken();
            return innerExpression;
        } else {
            throw new Error(`Unexpected token for atomic expression: ${JSON.stringify(current)}`);
        }
    }
}

function evaluateAbstractSyntaxTree(treeNode) {
    if (treeNode.nodeType === AST_LITERAL) {
        return treeNode.value;
    } else if (treeNode.nodeType === AST_BINARY_OP) {
        const leftResult = evaluateAbstractSyntaxTree(treeNode.leftOperand);
        const rightResult = evaluateAbstractSyntaxTree(treeNode.rightOperand);

        switch (treeNode.operation) {
            case TOKEN_ADD: return leftResult + rightResult;
            case TOKEN_SUB: return leftResult - rightResult;
            case TOKEN_MUL: return leftResult * rightResult;
            case TOKEN_DIV: return Math.trunc(leftResult / rightResult);
            default: throw new Error(`Unknown operation type: ${treeNode.operation}`);
        }
    }
    throw new Error(`Unknown AST node type for evaluation: ${treeNode.nodeType}`);
}

class InputDataProcessor {
    constructor(sourcePath, splitOnSpace = true) {
        const fileContents = require("fs").readFileSync(sourcePath, "utf8");
        const contentLines = fileContents.replace(/\r/g, '').split("\n");

        this.processedDataElements = contentLines.flatMap(lineItem => {
            if (splitOnSpace && lineItem !== "") {
                return lineItem.split(" ").filter(segment => segment !== "");
            } else {
                return [lineItem];
            }
        });
        this.currentElementIndex = 0;
    }

    hasMoreElements() {
        return this.currentElementIndex < this.processedDataElements.length;
    }

    getNextElement() {
        if (!this.hasMoreElements()) {
            throw new RangeError(`No more elements available at index ${this.currentElementIndex}`);
        }
        return this.processedDataElements[this.currentElementIndex++];
    }

    getNextNumericElement() {
        const currentElement = this.peekNextElement();
        if (!/^\d+$/.test(currentElement)) {
            throw new TypeError(`'${currentElement}' cannot be converted to a numeric value`);
        }
        return +this.getNextElement();
    }

    getNextIntegerElement() {
        return parseInt(this.getNextNumericElement(), 10);
    }

    peekNextElement() {
        if (!this.hasMoreElements()) {
            throw new RangeError(`No element to peek at index ${this.currentElementIndex}`);
        }
        return this.processedDataElements[this.currentElementIndex];
    }

    resetElementPosition() {
        this.currentElementIndex = 0;
    }
}

const inputHandler = new InputDataProcessor("/dev/stdin");

let remainingExpressionsCount = inputHandler.getNextIntegerElement();

while (remainingExpressionsCount--) {
    let currentExpressionText = inputHandler.getNextElement();
    currentExpressionText = currentExpressionText.slice(0, currentExpressionText.length - 1);

    const tokens = createExpressionTokenizer(currentExpressionText);
    const parser = new SyntaxTreeBuilder(tokens);
    const abstractSyntaxTree = parser.constructTree();
    const computedResult = evaluateAbstractSyntaxTree(abstractSyntaxTree);

    outputLog(computedResult);
}
