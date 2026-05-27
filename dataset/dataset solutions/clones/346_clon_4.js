(function (rawInput) {
    const operatorPrecedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };

    const isOperatorChar = (char) => ['+', '-', '*', '/'].includes(char);

    const isNumericToken = (token) => typeof token === 'number';

    function tokenizeExpression(expressionString) {
        const tokens = [];
        let currentPosition = 0;

        while (currentPosition < expressionString.length) {
            let char = expressionString[currentPosition];

            if (char >= '0' && char <= '9') {
                let numStr = '';
                while (currentPosition < expressionString.length && expressionString[currentPosition] >= '0' && expressionString[currentPosition] <= '9') {
                    numStr += expressionString[currentPosition];
                    currentPosition++;
                }
                tokens.push(parseInt(numStr, 10));
                continue;
            }

            if (isOperatorChar(char) || char === '(' || char === ')') {
                tokens.push(char);
                currentPosition++;
                continue;
            }

            throw new Error(`Unexpected character encountered during tokenization: ${char}`);
        }
        return tokens;
    }

    function convertToRPN(infixTokens) {
        const outputQueue = [];
        const operatorStack = [];

        for (const token of infixTokens) {
            if (isNumericToken(token)) {
                outputQueue.push(token);
            } else if (isOperatorChar(token)) {
                while (
                    operatorStack.length > 0 &&
                    isOperatorChar(operatorStack[operatorStack.length - 1]) &&
                    operatorPrecedence[token] <= operatorPrecedence[operatorStack[operatorStack.length - 1]]
                ) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            } else if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
                    throw new Error("Mismatched parentheses in expression.");
                }
                operatorStack.pop();
            } else {
                throw new Error(`Unexpected token type during RPN conversion: ${token}`);
            }
        }

        while (operatorStack.length > 0) {
            const op = operatorStack.pop();
            if (op === '(' || op === ')') {
                throw new Error("Mismatched parentheses in expression.");
            }
            outputQueue.push(op);
        }

        return outputQueue;
    }

    function evaluateRPN(rpnTokens) {
        const valueStack = [];

        for (const token of rpnTokens) {
            if (isNumericToken(token)) {
                valueStack.push(token);
            } else if (isOperatorChar(token)) {
                const operand2 = valueStack.pop();
                const operand1 = valueStack.pop();

                if (operand1 === undefined || operand2 === undefined) {
                    throw new Error("Invalid RPN expression: insufficient operands for operator.");
                }

                let calculationResult;
                switch (token) {
                    case '+':
                        calculationResult = operand1 + operand2;
                        break;
                    case '-':
                        calculationResult = operand1 - operand2;
                        break;
                    case '*':
                        calculationResult = Math.floor(operand1 * operand2);
                        break;
                    case '/':
                        calculationResult = Math.floor(operand1 / operand2);
                        break;
                    default:
                        throw new Error(`Unknown operator encountered during RPN evaluation: ${token}`);
                }
                valueStack.push(calculationResult);
            } else {
                throw new Error(`Unexpected token type during RPN evaluation: ${token}`);
            }
        }

        if (valueStack.length !== 1) {
            throw new Error("Invalid RPN expression: final result stack has incorrect size.");
        }

        return valueStack.pop();
    }

    const inputLines = rawInput.replace(/\r/g, '').split("\n");
    let numberOfExpressions = parseInt(inputLines.shift(), 10);

    while (numberOfExpressions--) {
        const currentExpressionLine = inputLines.shift().replace(/\s/g, "");
        
        const tokens = tokenizeExpression(currentExpressionLine);
        const rpnForm = convertToRPN(tokens);
        const finalResult = evaluateRPN(rpnForm);
        
        console.log(finalResult);
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));
