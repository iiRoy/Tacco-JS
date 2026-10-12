const outputLog = console.log;

const MODULUS_VALUE = 1000000007;

function calculateSquareMod(inputNumber) {
    let adjustedNumber = inputNumber;
    if (adjustedNumber > 500000000) {
        adjustedNumber -= MODULUS_VALUE;
    }
    const squaredResult = adjustedNumber * adjustedNumber;
    return squaredResult % MODULUS_VALUE;
}

function performBitShift(leftOperand, rightOperand) {
    return Math.floor(leftOperand / Math.pow(2, rightOperand));
}

function filterInputString(rawString) {
    return rawString.split('').filter(char => char !== ' ' && char !== 'S').join('');
}

function isDigitChar(charToCheck) {
    const charCode = charToCheck.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
}

function generateTokens(sourceText) {
    const tokenList = [];
    let currentPosition = 0;
    const textLength = sourceText.length;

    while (currentPosition < textLength) {
        const charAtCurrent = sourceText[currentPosition];

        if (isDigitChar(charAtCurrent)) {
            let numberString = '';
            while (currentPosition < textLength && isDigitChar(sourceText[currentPosition])) {
                numberString += sourceText[currentPosition];
                currentPosition++;
            }
            tokenList.push({ type: 'NUM_LITERAL', value: Number(numberString) });
            continue;
        }

        if (charAtCurrent === '<') {
            tokenList.push({ type: 'S_START' });
            currentPosition++;
        } else if (charAtCurrent === '>') {
            if (currentPosition + 1 < textLength && sourceText[currentPosition + 1] === '>') {
                if (currentPosition + 2 < textLength && (isDigitChar(sourceText[currentPosition + 2]) || sourceText[currentPosition + 2] === '<')) {
                    tokenList.push({ type: 'SHIFT_OP' });
                    currentPosition += 2;
                } else {
                    tokenList.push({ type: 'S_END' });
                    tokenList.push({ type: 'S_END' });
                    currentPosition += 2;
                }
            } else {
                tokenList.push({ type: 'S_END' });
                currentPosition++;
            }
        } else {
            currentPosition++;
        }
    }
    return tokenList;
}

function evaluateTokenSequence(tokenSequence) {
    const valueStack = [];
    const operatorStack = [];

    const operatorPrecedence = {
        'SHIFT_OP': 1,
        'S_START': 2
    };

    function applyTopOperator() {
        const op = operatorStack.pop();
        if (op === 'S_START') {
            const operand = valueStack.pop();
            valueStack.push(calculateSquareMod(operand));
        } else if (op === 'SHIFT_OP') {
            const right = valueStack.pop();
            const left = valueStack.pop();
            valueStack.push(performBitShift(left, right));
        }
    }

    for (const token of tokenSequence) {
        if (token.type === 'NUM_LITERAL') {
            valueStack.push(token.value);
        } else if (token.type === 'S_START') {
            operatorStack.push(token.type);
        } else if (token.type === 'S_END') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== 'S_START') {
                applyTopOperator();
            }
            if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === 'S_START') {
                operatorStack.pop();
                applyTopOperator();
            }
        } else if (token.type === 'SHIFT_OP') {
            while (operatorStack.length > 0 &&
                   operatorStack[operatorStack.length - 1] !== 'S_START' &&
                   operatorPrecedence[operatorStack[operatorStack.length - 1]] >= operatorPrecedence['SHIFT_OP']) {
                applyTopOperator();
            }
            operatorStack.push(token.type);
        }
    }

    while (operatorStack.length > 0) {
        applyTopOperator();
    }

    return valueStack.length > 0 ? valueStack[0] : undefined;
}

function processSingleLine(currentLine) {
    const cleanedLine = filterInputString(currentLine);
    const tokens = generateTokens(cleanedLine);
    const result = evaluateTokenSequence(tokens);
    outputLog(result);
}

function processAllInput(inputLines) {
    inputLines.map(lineContent => {
        if (lineContent !== "#") {
            processSingleLine(lineContent);
        }
    });
}

if (typeof process !== "undefined") {
    let accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        accumulatedInput += chunk;
    });
    process.stdin.on('end', () => {
        const inputDataLines = accumulatedInput.split("\n");
        processAllInput(inputDataLines);
    });
}
