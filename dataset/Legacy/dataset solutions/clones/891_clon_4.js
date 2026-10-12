const MODULUS = 1000000007;

function performModularMultiplication(factorA, factorB) {
    let currentResult = 0;
    factorA %= MODULUS;
    while (factorB > 0) {
        if (factorB % 2 === 1) {
            currentResult = (currentResult + factorA) % MODULUS;
        }
        factorA = (factorA * 2) % MODULUS;
        factorB = Math.floor(factorB / 2);
    }
    return currentResult;
}

function calculateModularSquare(value) {
    return performModularMultiplication(value, value);
}

function applyRightShift(value, shiftAmount) {
    return value >> shiftAmount;
}

const TOKEN_TYPE = {
    NUMBER: 'NUMBER',
    S_OPEN: 'S_OPEN',
    S_CLOSE: 'S_CLOSE',
    R_SHIFT: 'R_SHIFT',
    S_APPLY: 'S_APPLY'
};

const OPERATOR_INFO = {
    'S_OPEN': { precedence: 3, associativity: 'none' },
    'S_CLOSE': { precedence: 3, associativity: 'none' },
    'R_SHIFT': { precedence: 4, associativity: 'left' }
};

function parseExpressionIntoTokens(rawInput) {
    const cleanedString = rawInput.replace(/\s|S/g, '');
    if (!cleanedString) return [];

    const regex = /(\d+)|(>>)|[<>]/g;
    let match;
    const tokenList = [];

    while ((match = regex.exec(cleanedString)) !== null) {
        if (match[1]) {
            tokenList.push({ type: TOKEN_TYPE.NUMBER, value: Number(match[1]) });
        } else if (match[2] === '>>') {
            tokenList.push({ type: TOKEN_TYPE.R_SHIFT, value: '>>' });
        } else if (match[0] === '<') {
            tokenList.push({ type: TOKEN_TYPE.S_OPEN, value: '<' });
        } else if (match[0] === '>') {
            tokenList.push({ type: TOKEN_TYPE.S_CLOSE, value: '>' });
        }
    }
    return tokenList;
}

function convertToRPN(infixTokens) {
    const outputQueue = [];
    const operatorStack = [];

    for (const token of infixTokens) {
        if (token.type === TOKEN_TYPE.NUMBER) {
            outputQueue.push(token);
        } else if (token.type === TOKEN_TYPE.S_OPEN) {
            operatorStack.push(token);
        } else if (token.type === TOKEN_TYPE.S_CLOSE) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TOKEN_TYPE.S_OPEN) {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1].type !== TOKEN_TYPE.S_OPEN) {
                throw new Error("Mismatched S<> operators.");
            }
            operatorStack.pop();
            outputQueue.push({ type: TOKEN_TYPE.S_APPLY, value: 'S_APPLY' });
        } else if (token.type === TOKEN_TYPE.R_SHIFT) {
            const currentOpInfo = OPERATOR_INFO[token.type];
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type !== TOKEN_TYPE.S_OPEN &&
                OPERATOR_INFO[operatorStack[operatorStack.length - 1].type].precedence >= currentOpInfo.precedence
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }
    }

    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op.type === TOKEN_TYPE.S_OPEN) {
            throw new Error("Mismatched S<> operators.");
        }
        outputQueue.push(op);
    }
    return outputQueue;
}

function evaluateRPNExpression(rpnTokens) {
    const valueStack = [];

    for (const token of rpnTokens) {
        if (token.type === TOKEN_TYPE.NUMBER) {
            valueStack.push(token.value);
        } else if (token.type === TOKEN_TYPE.S_APPLY) {
            const operand = valueStack.pop();
            valueStack.push(calculateModularSquare(operand));
        } else if (token.type === TOKEN_TYPE.R_SHIFT) {
            const rightOperand = valueStack.pop();
            const leftOperand = valueStack.pop();
            valueStack.push(applyRightShift(leftOperand, rightOperand));
        }
    }
    return valueStack[0];
}

function processInputLine(currentLine) {
    const tokens = parseExpressionIntoTokens(currentLine);
    if (tokens.length === 0) {
        console.log('');
        return;
    }

    const rpnExpression = convertToRPN(tokens);
    if (rpnExpression.length === 0) {
        console.log('');
        return;
    }

    const finalResult = evaluateRPNExpression(rpnExpression);
    console.log(finalResult);
}

if (typeof process !== "undefined") {
    let fullInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        fullInput += chunk;
    });
    process.stdin.on('end', function() {
        const allLines = fullInput.split("\n");
        executeMainLogic(allLines);
    });
}

function executeMainLogic(inputLines) {
    inputLines.forEach(function(line) {
        if (line !== "#") {
            processInputLine(line);
        }
    });
    console.log('');
}
