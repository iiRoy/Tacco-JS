(function (sourceData) {
    const operationProperties = {
        '+': { priority: 1, type: 'left' },
        '-': { priority: 1, type: 'left' },
        '*': { priority: 2, type: 'left' },
        '/': { priority: 2, type: 'left' }
    };

    function isAnOperator(symbol) {
        return operationProperties.hasOwnProperty(symbol);
    }

    // Determines if an operator on the stack (stackTopOp) should be moved to output
    // before an incoming operator (incomingOp) is pushed to the stack.
    function shouldTransferFromStack(incomingOp, stackTopOp) {
        if (!isAnOperator(incomingOp) || !isAnOperator(stackTopOp)) return false;

        const incomingProps = operationProperties[incomingOp];
        const stackTopProps = operationProperties[stackTopOp];

        // Pop if stackTop has strictly higher priority
        if (stackTopProps.priority > incomingProps.priority) {
            return true;
        }
        // Pop if stackTop has equal priority AND is left-associative
        if (stackTopProps.priority === incomingProps.priority && stackTopProps.type === 'left') {
            return true;
        }
        return false;
    }

    // Phase 1: Convert expression string into an array of distinct tokens
    function segmentExpressionIntoTokens(expressionString) {
        const tokenList = [];
        let cursor = 0;
        while (cursor < expressionString.length) {
            let char = expressionString[cursor];
            if (char === ' ' || char === '\t') {
                cursor++;
                continue;
            }

            if (char === '(' || char === ')') {
                tokenList.push(char);
                cursor++;
                continue;
            }

            if (isAnOperator(char)) {
                tokenList.push(char);
                cursor++;
                continue;
            }

            if (/[0-9]/.test(char)) {
                let numberBuffer = '';
                while (cursor < expressionString.length && /[0-9]/.test(expressionString[cursor])) {
                    numberBuffer += expressionString[cursor];
                    cursor++;
                }
                tokenList.push(numberBuffer);
                continue;
            }
            throw new Error("Unrecognized character in expression: " + char);
        }
        return tokenList;
    }

    // Phase 2: Apply Shunting-yard algorithm to transform infix tokens to Postfix (RPN)
    function convertToReversePolishNotation(infixTokens) {
        const outputSequence = [];
        const operatorPile = [];

        for (let i = 0; i < infixTokens.length; i++) {
            const currentToken = infixTokens[i];

            if (!isNaN(parseFloat(currentToken))) { // Is a number
                outputSequence.push(currentToken);
            } else if (isAnOperator(currentToken)) {
                while (operatorPile.length > 0 &&
                       isAnOperator(operatorPile[operatorPile.length - 1]) &&
                       shouldTransferFromStack(currentToken, operatorPile[operatorPile.length - 1])) {
                    outputSequence.push(operatorPile.pop());
                }
                operatorPile.push(currentToken);
            } else if (currentToken === '(') {
                operatorPile.push(currentToken);
            } else if (currentToken === ')') {
                while (operatorPile.length > 0 && operatorPile[operatorPile.length - 1] !== '(') {
                    outputSequence.push(operatorPile.pop());
                }
                if (operatorPile.length === 0 || operatorPile[operatorPile.length - 1] !== '(') {
                    throw new Error("Parentheses mismatch error");
                }
                operatorPile.pop(); // Discard the '('
            } else {
                throw new Error("Invalid token encountered: " + currentToken);
            }
        }

        while (operatorPile.length > 0) {
            const remainingOp = operatorPile.pop();
            if (remainingOp === '(' || remainingOp === ')') {
                throw new Error("Unmatched parentheses remaining on stack");
            }
            outputSequence.push(remainingOp);
        }

        return outputSequence;
    }

    // Phase 3: Evaluate the Reverse Polish Notation (RPN) expression
    function computePostfixResult(rpnTokens) {
        const calculationStack = [];

        for (let i = 0; i < rpnTokens.length; i++) {
            const token = rpnTokens[i];

            if (!isNaN(parseFloat(token))) { // Is a number
                calculationStack.push(parseInt(token, 10));
            } else if (isAnOperator(token)) {
                const operandB = calculationStack.pop();
                const operandA = calculationStack.pop();

                if (operandA === undefined || operandB === undefined) {
                    throw new Error("Insufficient operands for operator: " + token);
                }

                let interimResult;
                switch (token) {
                    case '+': interimResult = operandA + operandB; break;
                    case '-': interimResult = operandA - operandB; break;
                    case '*': interimResult = Math.floor(operandA * operandB); break;
                    case '/': interimResult = Math.floor(operandA / operandB); break;
                    default: throw new Error("Unknown operator in RPN: " + token);
                }
                calculationStack.push(interimResult);
            } else {
                throw new Error("Invalid token in RPN sequence: " + token);
            }
        }

        if (calculationStack.length !== 1) {
            throw new Error("Malformed RPN expression: stack not in final state");
        }

        return calculationStack[0];
    }

    // Main program flow
    const processedInputLines = sourceData.replace(/\r/g, '').split("\n");
    let lineIndex = 0;

    const totalExpressionCount = parseInt(processedInputLines[lineIndex++], 10);

    for (let currentIteration = 0; currentIteration < totalExpressionCount; currentIteration++) {
        const currentExpressionLine = processedInputLines[lineIndex++].replace(/\s/g, "");
        
        const tokens = segmentExpressionIntoTokens(currentExpressionLine);
        const postfixForm = convertToReversePolishNotation(tokens);
        const finalComputedValue = computePostfixResult(postfixForm);
        
        console.log(finalComputedValue);
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));