const modulusValue = 1000000007;
const outputResult = console.log;

function computeProductModulo(factorA, factorB) {
    let currentA = Number(factorA);
    let currentB = Number(factorB);
    let resultAccumulator = 0;

    currentA %= modulusValue;
    currentB %= modulusValue;

    while (currentB > 0) {
        if (currentB % 2 === 1) {
            resultAccumulator = (resultAccumulator + currentA) % modulusValue;
        }
        currentA = (currentA * 2) % modulusValue;
        currentB = Math.floor(currentB / 2);
    }
    return resultAccumulator;
}

function applySquareModulo(valueInput) {
    return computeProductModulo(valueInput, valueInput);
}

function performRightShift(baseValue, shiftAmount) {
    let currentVal = baseValue;
    for (let currentShift = 0; currentShift < shiftAmount; currentShift++) {
        currentVal = Math.floor(currentVal / 2);
    }
    return currentVal;
}

function isNumericToken(val) {
    return !isNaN(Number(val));
}

function cleanInputString(initialStatement) {
    return initialStatement.replace(/S/g, '').replace(/\s/g, '');
}

function segmentInputTokens(processedStatement) {
    const tokenList = [];
    const tokenRegex = /(\d+)|([<>])/g;
    let match;
    while ((match = tokenRegex.exec(processedStatement)) !== null) {
        if (match[1] !== undefined) {
            tokenList.push(Number(match[1]));
        } else if (match[2] !== undefined) {
            tokenList.push(match[2]);
        }
    }
    return tokenList;
}

const TOKEN_TYPES = {
    OPEN_SQUARE: 'OPEN_SQUARE_SYMBOL',
    CLOSE_SQUARE: 'CLOSE_SQUARE_SYMBOL',
    SHIFT_RIGHT: 'SHIFT_RIGHT_OPERATOR'
};

function classifyTokens(rawTokenSequence) {
    const semanticTokenStream = [];
    let position = 0;
    while (position < rawTokenSequence.length) {
        const currentItem = rawTokenSequence[position];
        if (isNumericToken(currentItem)) {
            semanticTokenStream.push(currentItem);
        } else if (currentItem === '<') {
            semanticTokenStream.push(TOKEN_TYPES.OPEN_SQUARE);
        } else if (currentItem === '>') {
            if (rawTokenSequence[position + 1] === '>') {
                const nextNextItem = rawTokenSequence[position + 2];
                if (isNumericToken(nextNextItem) || nextNextItem === '<') {
                    semanticTokenStream.push(TOKEN_TYPES.SHIFT_RIGHT);
                    position++;
                } else {
                    semanticTokenStream.push(TOKEN_TYPES.CLOSE_SQUARE);
                }
            } else {
                semanticTokenStream.push(TOKEN_TYPES.CLOSE_SQUARE);
            }
        }
        position++;
    }
    return semanticTokenStream;
}

function evaluateTokenSequence(semanticTokens) {
    const evaluationStack = [];
    for (const token of semanticTokens) {
        if (isNumericToken(token)) {
            evaluationStack.push(token);
            if (evaluationStack.length >= 3 && evaluationStack[evaluationStack.length - 2] === TOKEN_TYPES.SHIFT_RIGHT) {
                const rightOperand = evaluationStack.pop();
                evaluationStack.pop();
                const leftOperand = evaluationStack.pop();
                evaluationStack.push(performRightShift(leftOperand, rightOperand));
            }
        } else if (token === TOKEN_TYPES.OPEN_SQUARE) {
            evaluationStack.push(token);
        } else if (token === TOKEN_TYPES.CLOSE_SQUARE) {
            const valueForSquare = evaluationStack.pop();
            evaluationStack.pop();
            evaluationStack.push(applySquareModulo(valueForSquare));
            if (evaluationStack.length >= 3 && evaluationStack[evaluationStack.length - 2] === TOKEN_TYPES.SHIFT_RIGHT && isNumericToken(evaluationStack[evaluationStack.length - 1])) {
                const rightOperand = evaluationStack.pop();
                evaluationStack.pop();
                const leftOperand = evaluationStack.pop();
                evaluationStack.push(performRightShift(leftOperand, rightOperand));
            }
        } else if (token === TOKEN_TYPES.SHIFT_RIGHT) {
            evaluationStack.push(token);
        }
    }
    return evaluationStack[0];
}

function calculateExpressionValue(currentTextLine) {
    let processedResult = cleanInputString(currentTextLine);
    if (!processedResult) { outputResult(''); return; }

    let segmentedResult = segmentInputTokens(processedResult);
    if (!segmentedResult || segmentedResult.length === 0) { outputResult(''); return; }

    let classifiedResult = classifyTokens(segmentedResult);
    if (!classifiedResult || classifiedResult.length === 0) { outputResult(''); return; }

    let finalValue = evaluateTokenSequence(classifiedResult);
    outputResult(finalValue);
}

function processAllInputs(inputChunks) {
    for (const chunk of inputChunks) {
        if (chunk.trim() !== "#") {
            calculateExpressionValue(chunk.trim());
        }
    }
    outputResult('');
}

if (typeof process !== "undefined") {
    let receivedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(dataBlock) {
        receivedData += dataBlock;
    });
    process.stdin.on('end', function() {
        const allLines = receivedData.split("\n");
        processAllInputs(allLines);
    });
}