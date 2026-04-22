const printer = console.log;
let rawInputAccumulator = "";

if (typeof process !== "undefined") {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (fragment) => {
        rawInputAccumulator += fragment;
    });
    process.stdin.on('end', () => {
        const inputRecords = rawInputAccumulator.split("\n");
        startProcessing(inputRecords);
    });
}

const MODULUS_VAL = 1000000007;
const BIG_INT_MODULUS = BigInt(MODULUS_VAL);

function bigModMultiply(firstNum, secondNum) {
    let result = (BigInt(firstNum) * BigInt(secondNum)) % BIG_INT_MODULUS;
    return Number(result < 0n ? result + BIG_INT_MODULUS : result);
}

function funcSquareMod(val) {
    return bigModMultiply(val, val);
}

function funcRightShift(val, shiftAmount) {
    return val >> shiftAmount;
}

function stripMarks(initialText) {
    return initialText.replace(/[\sS]/g, '');
}

function isNumeric(val) {
    return !isNaN(Number(val));
}

function lexicalScan(cleanedText) {
    if (!cleanedText) return [];
    const tokenRegex = /(\d+)|[<>]/g;
    const elements = [];
    let match;
    while ((match = tokenRegex.exec(cleanedText)) !== null) {
        if (match[1] !== undefined) {
            elements.push(Number(match[1]));
        } else {
            elements.push(match[0]);
        }
    }
    return elements;
}

function parseTokens(elementList) {
    const processedTokens = [];
    for (let idx = 0; idx < elementList.length; idx++) {
        const currentElement = elementList[idx];
        if (isNumeric(currentElement)) {
            processedTokens.push({ type: 'NUMBER', value: currentElement });
        } else if (currentElement === '<') {
            processedTokens.push({ type: 'OPERATOR', value: 'S_OPEN' });
        } else if (currentElement === '>') {
            if (idx + 1 < elementList.length && elementList[idx + 1] === '>') {
                processedTokens.push({ type: 'OPERATOR', value: 'R_SHIFT' });
                idx++;
            } else {
                processedTokens.push({ type: 'OPERATOR', value: 'S_CLOSE' });
            }
        }
    }
    return processedTokens;
}

const operatorPrecedence = {
    'S_OPEN': 0,
    'R_SHIFT': 2,
    'S_FUNC_APPLY': 3,
};

function evaluateExpression(structuredTokens) {
    const rpnOutputQueue = [];
    const operatorPile = [];

    for (const currentToken of structuredTokens) {
        if (currentToken.type === 'NUMBER') {
            rpnOutputQueue.push(currentToken.value);
        } else if (currentToken.type === 'OPERATOR') {
            switch (currentToken.value) {
                case 'S_OPEN':
                    operatorPile.push(currentToken.value);
                    break;
                case 'S_CLOSE':
                    while (operatorPile.length > 0 && operatorPile[operatorPile.length - 1] !== 'S_OPEN') {
                        rpnOutputQueue.push(operatorPile.pop());
                    }
                    if (operatorPile.length === 0) {
                        throw new Error("Mismatched S< > parentheses.");
                    }
                    operatorPile.pop();
                    rpnOutputQueue.push('S_FUNC_APPLY');
                    break;
                case 'R_SHIFT':
                    while (
                        operatorPile.length > 0 &&
                        operatorPile[operatorPile.length - 1] !== 'S_OPEN' &&
                        operatorPrecedence[operatorPile[operatorPile.length - 1]] >= operatorPrecedence[currentToken.value]
                    ) {
                        rpnOutputQueue.push(operatorPile.pop());
                    }
                    operatorPile.push(currentToken.value);
                    break;
                default:
                    throw new Error(`Unknown operator: ${currentToken.value}`);
            }
        }
    }

    while (operatorPile.length > 0) {
        const op = operatorPile.pop();
        if (op === 'S_OPEN') {
            throw new Error("Mismatched S< > parentheses.");
        }
        rpnOutputQueue.push(op);
    }

    const operandPile = [];
    for (const item of rpnOutputQueue) {
        if (typeof item === 'number') {
            operandPile.push(item);
        } else if (item === 'S_FUNC_APPLY') {
            if (operandPile.length < 1) throw new Error("RPN error: not enough operands for S function.");
            const val = operandPile.pop();
            operandPile.push(funcSquareMod(val));
        } else if (item === 'R_SHIFT') {
            if (operandPile.length < 2) throw new Error("RPN error: not enough operands for right shift.");
            const right = operandPile.pop();
            const left = operandPile.pop();
            operandPile.push(funcRightShift(left, right));
        } else {
            throw new Error(`RPN evaluation error: unknown item ${item}`);
        }
    }

    if (operandPile.length !== 1) {
        throw new Error("RPN evaluation error: stack not clean.");
    }

    return operandPile.pop();
}

function handleSingleRecord(aLine) {
    if (aLine === "#") {
        return;
    }

    try {
        const stripped = stripMarks(aLine);
        if (stripped === "") {
            printer('');
            return;
        }

        const elements = lexicalScan(stripped);
        if (elements.length === 0) {
            printer('');
            return;
        }

        const classified = parseTokens(elements);
        if (classified.length === 0) {
             printer('');
             return;
        }

        const finalResult = evaluateExpression(classified);
        printer(finalResult);
    } catch (err) {
        printer('');
    }
}

function startProcessing(allLines) {
    allLines.forEach((currentLine) => {
        handleSingleRecord(currentLine);
    });
}