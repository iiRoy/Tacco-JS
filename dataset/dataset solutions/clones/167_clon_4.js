const operationSymbols = ['+', '-', '*'];
const operationFunctions = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b
};
const operatorPrecedenceMap = {
    '+': 1,
    '-': 1,
    '*': 2
};

function generateAllPermutations(initialSet) {
    const sequenceContainer = [];

    function recursivePermutation(currentSequence, remainingElements) {
        if (remainingElements.length === 0) {
            sequenceContainer.push(currentSequence);
            return;
        }
        for (let idx = 0; idx < remainingElements.length; idx++) {
            const nextElement = remainingElements[idx];
            const newRemaining = remainingElements.slice();
            newRemaining.splice(idx, 1);
            recursivePermutation(currentSequence.concat(nextElement), newRemaining);
        }
    }

    recursivePermutation([], initialSet);
    return sequenceContainer;
}

function tokenizeExpression(expressionString) {
    return expressionString.match(/(\d+|\+|\-|\*|\(|\))/g);
}

function convertToRPN(tokenList) {
    const outputQueue = [];
    const operatorStack = [];

    for (const currentToken of tokenList) {
        if (!isNaN(currentToken)) {
            outputQueue.push(Number(currentToken));
        } else if (operationSymbols.includes(currentToken)) {
            while (
                operatorStack.length > 0 &&
                operationSymbols.includes(operatorStack[operatorStack.length - 1]) &&
                operatorPrecedenceMap[operatorStack[operatorStack.length - 1]] >= operatorPrecedenceMap[currentToken]
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(currentToken);
        } else if (currentToken === '(') {
            operatorStack.push(currentToken);
        } else if (currentToken === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                operatorStack.pop();
            } else {
                throw new Error("Mismatched parentheses in expression.");
            }
        }
    }

    while (operatorStack.length > 0) {
        if (operatorStack[operatorStack.length - 1] === '(') {
            throw new Error("Mismatched parentheses in expression.");
        }
        outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
}

function evaluateRPN(rpnTokens) {
    const valueStack = [];
    for (const token of rpnTokens) {
        if (typeof token === 'number') {
            valueStack.push(token);
        } else {
            const operand2 = valueStack.pop();
            const operand1 = valueStack.pop();
            if (operand1 === undefined || operand2 === undefined) {
                 throw new Error("Insufficient operands for operator " + token);
            }
            const operation = operationFunctions[token];
            valueStack.push(operation(operand1, operand2));
        }
    }
    if (valueStack.length !== 1) {
        throw new Error("Invalid RPN expression, stack did not resolve to single value.");
    }
    return valueStack.pop();
}

function calculateInfixExpression(expressionString) {
    const tokens = tokenizeExpression(expressionString);
    const rpn = convertToRPN(tokens);
    return evaluateRPN(rpn);
}

const allIndexPermutations = generateAllPermutations([0, 1, 2, 3]);

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const linesOfInput = rawInputContent.trim().split("\n");

let lineCursor = 0;
while (true) {
    const currentInputLine = linesOfInput[lineCursor++];
    if (currentInputLine === "0 0 0 0") {
        break;
    }

    const currentNumberArray = currentInputLine.split(" ").map(Number);
    let solutionFound = null;

    for (let opOneIndex = 0; opOneIndex < 3; opOneIndex++) {
        for (let opTwoIndex = 0; opTwoIndex < 3; opTwoIndex++) {
            for (let opThreeIndex = 0; opThreeIndex < 3; opThreeIndex++) {

                for (const numberIndexSequence of allIndexPermutations) {
                    const numA = currentNumberArray[numberIndexSequence[0]];
                    const numB = currentNumberArray[numberIndexSequence[1]];
                    const numC = currentNumberArray[numberIndexSequence[2]];
                    const numD = currentNumberArray[numberIndexSequence[3]];

                    const op1Symbol = operationSymbols[opOneIndex];
                    const op2Symbol = operationSymbols[opTwoIndex];
                    const op3Symbol = operationSymbols[opThreeIndex];

                    const currentExpressions = [
                        `${numA}${op1Symbol}${numB}${op2Symbol}${numC}${op3Symbol}${numD}`,
                        `(${numA}${op1Symbol}${numB}${op2Symbol}${numC})${op3Symbol}${numD}`,
                        `(${numA}${op1Symbol}${numB})${op2Symbol}(${numC}${op3Symbol}${numD})`,
                        `(((${numA}${op1Symbol}${numB})${op2Symbol}${numC})${op3Symbol}${numD})`
                    ];

                    for (const currentExprString of currentExpressions) {
                        try {
                            if (calculateInfixExpression(currentExprString) === 10) {
                                solutionFound = currentExprString;
                                break;
                            }
                        } catch (e) {
                            // Error during evaluation (e.g., malformed expression, though unlikely with generated patterns)
                            // Continue to next expression
                        }
                    }
                    if (solutionFound !== null) break;
                }
                if (solutionFound !== null) break;
            }
            if (solutionFound !== null) break;
        }
        if (solutionFound !== null) break;
    }

    if (solutionFound !== null) {
        console.log(`(${solutionFound})`);
    } else {
        console.log("0");
    }
}