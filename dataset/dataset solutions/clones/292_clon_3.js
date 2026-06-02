const inputSourcePath = '/dev/stdin';
const rawFileContent = require('fs').readFileSync(inputSourcePath, 'utf8');

const inputLines = rawFileContent.split(/\n/);

const processNumericToken = (tokenValue) => {
    return isNaN(tokenValue) ? 0 : parseFloat(tokenValue).toFixed(6);
};

const rpnOperatorHandlers = Object.create(null);

rpnOperatorHandlers['+'] = (currentOperandStack) => {
    currentOperandStack.push(
        currentOperandStack.pop() + currentOperandStack.pop()
    );
};

rpnOperatorHandlers['-'] = (currentOperandStack) => {
    currentOperandStack.push(
        -currentOperandStack.pop() + currentOperandStack.pop()
    );
};

rpnOperatorHandlers['*'] = (currentOperandStack) => {
    currentOperandStack.push(
        currentOperandStack.pop() * currentOperandStack.pop()
    );
};

rpnOperatorHandlers['/'] = (currentOperandStack) => {
    currentOperandStack.push(
        1 / currentOperandStack.pop() * currentOperandStack.pop()
    );
};

inputLines.forEach((lineContent) => {
    const currentLineTokens = lineContent.split(/\s/);
    const operandStack = [];

    currentLineTokens.forEach((currentTokenStr) => {
        if (Object.prototype.hasOwnProperty.call(rpnOperatorHandlers, currentTokenStr)) {
            rpnOperatorHandlers[currentTokenStr](operandStack);
        } else {
            operandStack.push(processNumericToken(currentTokenStr));
        }
    });

    console.log(operandStack[0]);
});