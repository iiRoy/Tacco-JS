const processEnv = require('node:fs');

const extractSegments = (textSource) => {
    const rawContent = textSource.readFileSync('/dev/stdin', 'utf8');
    const refinedContent = rawContent.trim();
    return refinedContent.split(' ');
};

const interpretSegment = (segmentText) => {
    const numericCandidate = parseInt(segmentText, 10);
    return isNaN(numericCandidate) ? segmentText : numericCandidate;
};

const initialSegments = extractSegments(processEnv);
const parsedElements = initialSegments.map(interpretSegment);

const arithmeticOperations = {
    '+': (stackArray) => {
        const [secondOperand, firstOperand, ...remainingStack] = stackArray;
        return [firstOperand + secondOperand, ...remainingStack];
    },
    '-': (stackArray) => {
        const [secondOperand, firstOperand, ...remainingStack] = stackArray;
        return [firstOperand - secondOperand, ...remainingStack];
    },
    '*': (stackArray) => {
        const [secondOperand, firstOperand, ...remainingStack] = stackArray;
        return [firstOperand * secondOperand, ...remainingStack];
    },
};

const evaluatePostfix = (currentStack, itemValue) => {
    if (typeof itemValue === 'number') {
        return [itemValue, ...currentStack];
    } else {
        const operationHandler = arithmeticOperations[itemValue];
        if (operationHandler) {
            return operationHandler(currentStack);
        }
        return currentStack;
    }
};

const finalComputationResult = parsedElements.reduce(evaluatePostfix, []);

console.log(finalComputationResult[0]);