const outputLog = console.log;

(function setupInputHandler() {
    if (typeof process !== "undefined" && process.stdin) {
        let rawInputData = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
            rawInputData += chunk;
        });
        process.stdin.on('end', () => {
            const processedInputLines = rawInputData.split("\n");
            processAllInputLines(processedInputLines);
        });
    }
})();

function processAllInputLines(inputLineArray) {
    if (!inputLineArray || inputLineArray.length === 0) {
        return;
    }

    for (const currentLine of inputLineArray) {
        if (currentLine !== "#") {
            handleSingleInputLine(currentLine);
        }
    }
}

const MODULO_CONSTANT = 1000000007;

function recursiveModMultiply(valX, valY) {
    if (valX > 90000000 && valY > 1) {
        const remainder = valY % 2;
        const halfY = Math.floor(valY / 2);
        const recursiveResult = recursiveModMultiply(valX, halfY);

        let currentSum;
        if (remainder === 1) {
            currentSum = (2 * recursiveResult + valX) % MODULO_CONSTANT;
        } else {
            currentSum = (2 * recursiveResult) % MODULO_CONSTANT;
        }
        return currentSum % MODULO_CONSTANT;
    }
    return (valX * valY) % MODULO_CONSTANT;
}

function applySFunction(inputVal) {
    return recursiveModMultiply(inputVal, inputVal);
}

function applyTFunction(baseVal, shiftAmount) {
    const powerOfTwo = Math.pow(2, shiftAmount);
    return Math.floor(baseVal / powerOfTwo);
}

function cleanInputString(rawLine) {
    const cleanupRegex = /\s|S/g;
    return rawLine.replace(cleanupRegex, '');
}

function isNumericToken(tokenValue) {
    return !isNaN(Number(tokenValue));
}

function tokenizeInitial(inputString) {
    const charArray = inputString.split('');
    const strLength = charArray.length;
    const tokenList = [];
    let numStartIdx = -1;

    for (let i = 0; i < strLength; i++) {
        const charElem = charArray[i];
        const isCurrentCharNumeric = isNumericToken(charElem);

        if (isCurrentCharNumeric) {
            if (numStartIdx === -1) {
                numStartIdx = i;
            }
        } else {
            if (numStartIdx !== -1) {
                const numStr = charArray.slice(numStartIdx, i).join('');
                tokenList.push(Number(numStr));
                numStartIdx = -1;
            }
            tokenList.push(charElem);
        }
    }

    if (numStartIdx !== -1) {
        const numStr = charArray.slice(numStartIdx, strLength).join('');
        tokenList.push(Number(numStr));
    }
    return tokenList;
}

function isQToken(currentIndex, tokenArray) {
    const nextChar = tokenArray[currentIndex + 1];
    if (nextChar === '>') {
        const charAfterNext = tokenArray[currentIndex + 2];
        if (isNumericToken(charAfterNext) || charAfterNext === '<') {
            return false;
        }
    }
    return true;
}

function refineTokens(rawTokenList) {
    const refinedTokenList = [];
    const tokenLength = rawTokenList.length;

    for (let i = 0; i < tokenLength; i++) {
        const tokenElem = rawTokenList[i];

        if (isNumericToken(tokenElem)) {
            refinedTokenList.push(tokenElem);
        } else if (tokenElem === '<') {
            refinedTokenList.push('p');
        } else if (tokenElem === '>') {
            if (isQToken(i, rawTokenList)) {
                refinedTokenList.push('q');
            } else {
                refinedTokenList.push('t');
                i++;
            }
        }
    }
    return refinedTokenList;
}

function evaluateExpressionTree(tokenExpression) {
    let currentIdx = 0;
    while (tokenExpression.length > 1 && currentIdx < tokenExpression.length) {
        const currentElem = tokenExpression[currentIdx];

        if (isNumericToken(currentElem)) {
            if (currentIdx > 0 && tokenExpression[currentIdx - 1] === 't') {
                const baseValue = tokenExpression[currentIdx - 2];
                const shiftAmount = currentElem;
                tokenExpression[currentIdx - 2] = applyTFunction(baseValue, shiftAmount);
                tokenExpression.splice(currentIdx - 1, 2);
                currentIdx = -1;
            }
        } else if (currentElem === 'q') {
            const valueForS = tokenExpression[currentIdx - 1];
            tokenExpression[currentIdx - 2] = applySFunction(valueForS);
            tokenExpression.splice(currentIdx - 1, 2);
            currentIdx = -1;
        }
        currentIdx++;
    }
    return tokenExpression;
}

function handleSingleInputLine(rawInputLine) {
    let processedLine = cleanInputString(rawInputLine);

    if (processedLine === "") {
        outputLog('');
        return;
    }

    processedLine = tokenizeInitial(processedLine);
    processedLine = refineTokens(processedLine);
    processedLine = evaluateExpressionTree(processedLine);

    outputLog(processedLine);
}
