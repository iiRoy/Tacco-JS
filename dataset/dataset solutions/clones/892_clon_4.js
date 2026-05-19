var outputLogger = console.log;
if (typeof process !== "undefined") {
    var accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        accumulatedInput += chunk;
    });
    process.stdin.on('end', function() {
        var inputLines = accumulatedInput.split("\n");
        entryPoint(inputLines);
    });
}

function entryPoint(inputLines) {
    for (const currentLine of inputLines) {
        if (currentLine !== "#") {
            evaluateInputLine(currentLine);
        }
    }
}

function modularProduct(factorA, factorB) {
    const modulusVal = 1000000007;
    let resultAccumulator = 0;
    factorA %= modulusVal;

    while (factorB > 0) {
        if (factorB % 2 === 1) {
            resultAccumulator = (resultAccumulator + factorA) % modulusVal;
        }
        factorA = (factorA * 2) % modulusVal;
        factorB = Math.floor(factorB / 2);
    }
    return resultAccumulator;
}

function squareModulo(val) {
    return modularProduct(val, val);
}

function shiftRightFloor(baseVal, shiftAmount) {
    return baseVal >> shiftAmount;
}

function cleanseString(rawString) {
    return rawString.split('').filter(char => char !== ' ' && char !== 'S').join('');
}

function isNumericString(candidateStr) {
    return !Number.isNaN(Number(candidateStr));
}

function segmentInput(cleanedString) {
    if (!cleanedString) {
        return [];
    }
    const tokenRegex = /\d+|>>|[<>]/g;
    const matches = Array.from(cleanedString.matchAll(tokenRegex));
    
    return matches.map(match => {
        const token = match[0];
        return isNumericString(token) ? Number(token) : token;
    });
}

function tokenizeExpression(segmentedParts) {
    if (!segmentedParts) {
        return [];
    }
    return segmentedParts.map(part => {
        if (typeof part === 'number') {
            return part;
        }
        switch (part) {
            case '<':
                return 'openS';
            case '>':
                return 'closeS';
            case '>>':
                return 'shiftOp';
            default:
                return part; // Should not happen with current regex
        }
    });
}

function evaluateTokenSequence(expressionTokens) {
    if (!expressionTokens || expressionTokens.length === 0) {
        return [];
    }

    let currentWorkingTokens = [...expressionTokens];

    // First pass: Evaluate 'openS' X 'closeS' (S<x>) due to higher precedence
    let closeSIndex;
    while ((closeSIndex = currentWorkingTokens.indexOf('closeS')) !== -1) {
        // Expected pattern: [..., 'openS', X, 'closeS', ...]
        // X is at closeSIndex - 1
        // 'openS' is at closeSIndex - 2
        const operandValue = currentWorkingTokens[closeSIndex - 1];
        const resultOfS = squareModulo(operandValue);
        // Replace ['openS', X, 'closeS'] with [resultOfS]
        currentWorkingTokens.splice(closeSIndex - 2, 3, resultOfS);
    }

    // Second pass: Evaluate X 'shiftOp' Y (x>>y)
    let shiftOpIndex;
    while ((shiftOpIndex = currentWorkingTokens.indexOf('shiftOp')) !== -1) {
        // Expected pattern: [..., X, 'shiftOp', Y, ...]
        // X is at shiftOpIndex - 1
        // Y is at shiftOpIndex + 1
        const leftOperand = currentWorkingTokens[shiftOpIndex - 1];
        const rightOperand = currentWorkingTokens[shiftOpIndex + 1];
        const resultOfShift = shiftRightFloor(leftOperand, rightOperand);
        // Replace [X, 'shiftOp', Y] with [resultOfShift]
        currentWorkingTokens.splice(shiftOpIndex - 1, 3, resultOfShift);
    }

    return currentWorkingTokens[0]; // The final result should be a single number
}

function evaluateInputLine(inputStr) {
    let processedResult;

    const cleaned = cleanseString(inputStr);
    if (!cleaned) { outputLogger(''); return; }

    const segmented = segmentInput(cleaned);
    if (!segmented || segmented.length === 0) { outputLogger(''); return; }

    const tokenized = tokenizeExpression(segmented);
    if (!tokenized || tokenized.length === 0) { outputLogger(''); return; }

    processedResult = evaluateTokenSequence(tokenized);
    if (processedResult === undefined || processedResult === null) { outputLogger(''); return; }
    
    outputLogger(processedResult);
}
