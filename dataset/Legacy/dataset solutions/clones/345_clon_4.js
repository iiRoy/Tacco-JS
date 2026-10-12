var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const opPrecedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
};

const isOperator = (char) => opPrecedence.hasOwnProperty(char);

const transformToRPN = (infixTokens) => {
    const outputQueue = [];
    const operatorStack = [];

    for (const currentToken of infixTokens) {
        if (!isNaN(parseFloat(currentToken))) {
            outputQueue.push(currentToken);
        } else if (isOperator(currentToken)) {
            while (
                operatorStack.length > 0 &&
                isOperator(operatorStack[operatorStack.length - 1]) &&
                opPrecedence[currentToken] <= opPrecedence[operatorStack[operatorStack.length - 1]]
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(currentToken);
        }
    }

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
};

const computeRPN = (rpnTokens) => {
    const valueStack = [];

    for (const currentToken of rpnTokens) {
        if (!isNaN(parseFloat(currentToken))) {
            valueStack.push(parseFloat(currentToken));
        } else if (isOperator(currentToken)) {
            const secondOperand = valueStack.pop();
            const firstOperand = valueStack.pop();
            let operationResult;
            switch (currentToken) {
                case '+': operationResult = firstOperand + secondOperand; break;
                case '-': operationResult = firstOperand - secondOperand; break;
                case '*': operationResult = firstOperand * secondOperand; break;
                case '/': operationResult = firstOperand / secondOperand; break;
            }
            valueStack.push(operationResult);
        }
    }
    return valueStack.pop();
};

const processedLines = sourceData.trim().split("\n");
const countOfExpressions = parseInt(processedLines.shift(), 10);

const finalResults = processedLines.slice(0, countOfExpressions).map(currentExpressionLine => {
    const trimmedExpression = currentExpressionLine.substring(0, currentExpressionLine.length - 1);

    const integerizedExpression = trimmedExpression.replace(/(\d+)(\.\d+)?/g, (matchedString) => Math.trunc(parseFloat(matchedString)).toString());

    const expressionTokens = integerizedExpression.match(/\d+|[+\-*/]/g);

    const rpnForm = transformToRPN(expressionTokens);

    const rawEvaluation = computeRPN(rpnForm);

    return Math.trunc(rawEvaluation);
});

finalResults.forEach(finalValue => console.log(finalValue));
