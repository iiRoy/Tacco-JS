const inputSourcePath = '/dev/stdin';
const rawFileContent = require('fs').readFileSync(inputSourcePath, 'utf8');

const inputLines = rawFileContent.split(/\n/);

const processNumericToken = (tokenValue) => {
    const parsedValue = parseFloat(tokenValue);
    return isNaN(parsedValue) ? '0' : parsedValue.toFixed(6);
};

const rpnOperatorHandlers = {
    '+': (currentOperandStack) => {
        const operand2 = currentOperandStack.pop();
        const operand1 = currentOperandStack.pop();
        currentOperandStack.push(operand1 + operand2);
    },
    '-': (currentOperandStack) => {
        const operand2 = currentOperandStack.pop();
        const operand1 = currentOperandStack.pop();
        currentOperandStack.push(parseFloat(operand1) - parseFloat(operand2));
    },
    '*': (currentOperandStack) => {
        const operand2 = currentOperandStack.pop();
        const operand1 = currentOperandStack.pop();
        currentOperandStack.push(parseFloat(operand1) * parseFloat(operand2));
    },
    '/': (currentOperandStack) => {
        const operand2 = currentOperandStack.pop();
        const operand1 = currentOperandStack.pop();
        currentOperandStack.push(parseFloat(operand1) / parseFloat(operand2));
    }
};

inputLines.forEach((lineContent) => {
    const currentLineTokens = lineContent.split(/\s/);
    const operandStack = [];

    currentLineTokens.forEach((currentTokenStr) => {
        if (rpnOperatorHandlers[currentTokenStr]) {
            rpnOperatorHandlers[currentTokenStr](operandStack);
        } else {
            const formattedNumber = processNumericToken(currentTokenStr);
            operandStack.push(formattedNumber);
        }
    });

    console.log(operandStack[0]);
});
