const someInputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const allPossibleOperators = ['+', '-', '*'];

class ExpressionNode {
    constructor(val, repr, opsUsed) {
        this.currentValue = val;
        this.textRepresentation = repr;
        this.operatorsInvolved = opsUsed;
    }
}

function executeOperation(leftNode, rightNode, operationSymbol) {
    let resultValue;
    const leftText = leftNode.textRepresentation;
    const rightText = rightNode.textRepresentation;

    switch (operationSymbol) {
        case '+':
            resultValue = leftNode.currentValue + rightNode.currentValue;
            break;
        case '-':
            resultValue = leftNode.currentValue - rightNode.currentValue;
            break;
        case '*':
            resultValue = leftNode.currentValue * rightNode.currentValue;
            break;
        default:
            throw new Error('Unknown operation');
    }

    const resultText = `(${leftText} ${operationSymbol} ${rightText})`;
    const combinedOperators = leftNode.operatorsInvolved.concat(rightNode.operatorsInvolved, [operationSymbol]);

    return new ExpressionNode(resultValue, resultText, combinedOperators);
}

function produceAllArrangements(numbersToCombine) {
    if (numbersToCombine.length === 1) {
        return [new ExpressionNode(numbersToCombine[0], String(numbersToCombine[0]), [])];
    }

    const currentArrangements = [];

    for (let i = 1; i < numbersToCombine.length; i++) {
        const leftGroup = numbersToCombine.slice(0, i);
        const rightGroup = numbersToCombine.slice(i);

        const leftExpressions = produceAllArrangements(leftGroup);
        const rightExpressions = produceAllArrangements(rightGroup);

        for (const leftOperand of leftExpressions) {
            for (const rightOperand of rightExpressions) {
                for (const op of allPossibleOperators) {
                    const newExpression = executeOperation(leftOperand, rightOperand, op);

                    // Replicate the original code's specific skip: if all three operators are '-'
                    if (newExpression.operatorsInvolved.length === 3 && newExpression.operatorsInvolved.every(o => o === '-')) {
                        continue;
                    }
                    currentArrangements.push(newExpression);
                }
            }
        }
    }
    return currentArrangements;
}

function generateAllSequences(inputArray) {
    const resultSequences = [];
    function permuteRecursive(currentSequence, remainingElements) {
        if (remainingElements.length === 0) {
            resultSequences.push(currentSequence);
            return;
        }
        for (let i = 0; i < remainingElements.length; i++) {
            const nextElement = remainingElements[i];
            const updatedRemaining = remainingElements.filter((_, index) => index !== i);
            permuteRecursive(currentSequence.concat(nextElement), updatedRemaining);
        }
    }
    permuteRecursive([], inputArray);
    return resultSequences;
}

function processInputLine(lineContent) {
    if (lineContent === '0 0 0 0') {
        someInputReader.close();
        return;
    }

    const initialNumbers = lineContent.split(' ').map(Number);
    let solutionFound = false;

    const numberPermutations = generateAllSequences(initialNumbers);

    for (const currentPermutation of numberPermutations) {
        const allExpressionsForPermutation = produceAllArrangements(currentPermutation);

        for (const expr of allExpressionsForPermutation) {
            if (expr.currentValue === 10) {
                console.log(expr.textRepresentation);
                solutionFound = true;
                break;
            }
        }
        if (solutionFound) {
            break;
        }
    }

    if (!solutionFound) {
        console.log(0);
    }
}

someInputReader.on('line', processInputLine);
someInputReader.on('close', () => {});