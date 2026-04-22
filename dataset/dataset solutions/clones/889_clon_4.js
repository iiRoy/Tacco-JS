const MOD_VALUE = 1000000007;

function performModularProduct(operandOne, operandTwo) {
    return Number((BigInt(operandOne) * BigInt(operandTwo)) % BigInt(MOD_VALUE));
}

function calculateSquaredModulo(valueToSquare) {
    return performModularProduct(valueToSquare, valueToSquare);
}

function computeRightShift(initialValue, shiftMagnitude) {
    return Math.trunc(initialValue / (2 ** shiftMagnitude));
}

function parseExpressionTokens(rawInputLine) {
    if (!rawInputLine) return [];

    const cleanedInput = rawInputLine.replace(/S|\s/g, '');
    if (!cleanedInput) return [];

    const generatedTokens = [];
    let currentPosition = 0;

    while (currentPosition < cleanedInput.length) {
        const currentChar = cleanedInput[currentPosition];

        if (currentChar === '<') {
            generatedTokens.push('open_square_op');
            currentPosition++;
        } else if (currentChar === '>') {
            if (currentPosition + 1 < cleanedInput.length && cleanedInput[currentPosition + 1] === '>') {
                generatedTokens.push('right_shift_op');
                currentPosition += 2;
            } else {
                generatedTokens.push('close_square_op');
                currentPosition++;
            }
        } else if (/\d/.test(currentChar)) {
            let numberString = '';
            while (currentPosition < cleanedInput.length && /\d/.test(cleanedInput[currentPosition])) {
                numberString += cleanedInput[currentPosition];
                currentPosition++;
            }
            generatedTokens.push(Number(numberString));
        } else {
            currentPosition++;
        }
    }
    return generatedTokens;
}

function evaluateTokenSequence(expressionElements) {
    if (expressionElements.length === 0) return '';
    if (expressionElements.length === 1 && typeof expressionElements[0] === 'number') return expressionElements[0];

    let currentWorkingList = [...expressionElements];
    let changedInPass;

    do {
        changedInPass = false;
        const nextListAfterSquares = [];
        let i = 0;
        while (i < currentWorkingList.length) {
            if (i + 2 < currentWorkingList.length &&
                currentWorkingList[i] === 'open_square_op' &&
                typeof currentWorkingList[i+1] === 'number' &&
                currentWorkingList[i+2] === 'close_square_op') {
                
                const operandValue = currentWorkingList[i+1];
                nextListAfterSquares.push(calculateSquaredModulo(operandValue));
                i += 3;
                changedInPass = true;
            } else {
                nextListAfterSquares.push(currentWorkingList[i]);
                i++;
            }
        }
        currentWorkingList = nextListAfterSquares;
    } while (changedInPass);

    do {
        changedInPass = false;
        const nextListAfterShifts = [];
        let i = 0;
        while (i < currentWorkingList.length) {
            if (i + 2 < currentWorkingList.length &&
                typeof currentWorkingList[i] === 'number' &&
                currentWorkingList[i+1] === 'right_shift_op' &&
                typeof currentWorkingList[i+2] === 'number') {
                
                const leftOperand = currentWorkingList[i];
                const rightOperand = currentWorkingList[i+2];
                nextListAfterShifts.push(computeRightShift(leftOperand, rightOperand));
                i += 3;
                changedInPass = true;
            } else {
                nextListAfterShifts.push(currentWorkingList[i]);
                i++;
            }
        }
        currentWorkingList = nextListAfterShifts;
    } while (changedInPass);

    if (currentWorkingList.length === 1 && typeof currentWorkingList[0] === 'number') {
        return currentWorkingList[0];
    }
    return ''; 
}

function processInputLine(singleInputSegment) {
    if (singleInputSegment === "#") {
        return null;
    }
    
    const parsedTokens = parseExpressionTokens(singleInputSegment);
    if (parsedTokens.length === 0) {
        return '';
    }
    return evaluateTokenSequence(parsedTokens);
}

function executeOperations(sourceInputLines) {
    const collectedResults = [];
    for (const lineEntry of sourceInputLines) {
        const computedOutcome = processInputLine(lineEntry);
        if (computedOutcome !== null) {
            collectedResults.push(computedOutcome);
        }
    }
    return collectedResults;
}

const outputEmitter = console.log;
if (typeof process !== "undefined") {
    let accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(inputChunk) {
        accumulatedInput += inputChunk;
    });
    process.stdin.on('end', function() {
        const inputSegments = accumulatedInput.split("\n");
        const finalCalculations = executeOperations(inputSegments);
        finalCalculations.forEach(result => outputEmitter(result));
    });
}