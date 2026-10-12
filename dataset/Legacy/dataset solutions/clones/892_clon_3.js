const outputLog = console.log;

if (typeof process !== "undefined") {
    let accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        accumulatedInput += chunk;
    });
    process.stdin.on('end', function() {
        const inputDataLines = accumulatedInput.split("\n");
        processInputLines(inputDataLines);
    });
}

function processInputLines(inputDataLines) {
    for (const currentLineStr of inputDataLines) {
        if (currentLineStr !== "#") {
            handleSingleExpression(currentLineStr);
        }
    }
}

function computeModularProduct(baseVal, multiplierVal) {
    const modulusConstant = 1000000007;

    if (baseVal === 0 || multiplierVal === 0) return 0;
    if (multiplierVal === 1) return baseVal % modulusConstant;

    if (baseVal > 90000000 && multiplierVal > 1) {
        let currentResult = 0;
        let currentBase = baseVal % modulusConstant;
        let currentMultiplier = multiplierVal;

        while (currentMultiplier > 0) {
            if (currentMultiplier % 2 === 1) {
                currentResult = (currentResult + currentBase) % modulusConstant;
            }
            currentBase = (currentBase * 2) % modulusConstant;
            currentMultiplier = Math.floor(currentMultiplier / 2);
        }
        return currentResult;
    } else {
        return (baseVal * multiplierVal) % modulusConstant;
    }
}

function calculateS(value) {
    return computeModularProduct(value, value);
}

function calculateT(dividend, exponent) {
    const divisor = Math.pow(2, exponent);
    return Math.floor(dividend / divisor);
}

function cleanInputString(inputStr) {
    return inputStr.replace(/\s|S/g, '');
}

const isDigitChar = (char) => char >= '0' && char <= '9';

function parseTokensAndNumbers(inputStr) {
    const charList = inputStr.split('');
    const totalLength = charList.length;
    const resultTokens = [];
    let currentIndex = 0;

    while (currentIndex < totalLength) {
        const currentChar = charList[currentIndex];

        if (isDigitChar(currentChar)) {
            let numStart = currentIndex;
            while (currentIndex < totalLength && isDigitChar(charList[currentIndex])) {
                currentIndex++;
            }
            const numberStr = charList.slice(numStart, currentIndex).join('');
            resultTokens.push(Number(numberStr));
        } else {
            resultTokens.push(currentChar);
            currentIndex++;
        }
    }
    return resultTokens;
}

function tokenizeExpression(parsedList) {
    const tokenizedResult = [];
    const listLength = parsedList.length;
    let currentIdx = 0;

    while (currentIdx < listLength) {
        const element = parsedList[currentIdx];

        if (typeof element === 'number') {
            tokenizedResult.push(element);
        } else if (element === '<') {
            tokenizedResult.push('p');
        } else if (element === '>') {
            const isDoubleGreaterThan = (
                currentIdx + 1 < listLength && parsedList[currentIdx + 1] === '>' &&
                currentIdx + 2 < listLength && (typeof parsedList[currentIdx + 2] === 'number' || parsedList[currentIdx + 2] === '<')
            );

            if (isDoubleGreaterThan) {
                tokenizedResult.push('t');
                currentIdx += 1;
            } else {
                tokenizedResult.push('q');
            }
        }
        currentIdx++;
    }
    return tokenizedResult;
}

function evaluateExpressionTree(tokenSequence) {
    const workingSequence = [...tokenSequence];
    let currentPosition = 0;

    while (workingSequence.length > 1 && currentPosition < workingSequence.length) {
        const currentElement = workingSequence[currentPosition];

        if (typeof currentElement === 'number') {
            if (currentPosition >= 2 && workingSequence[currentPosition - 1] === 't' && typeof workingSequence[currentPosition - 2] === 'number') {
                const valB = currentElement;
                const valA = workingSequence[currentPosition - 2];
                const result = calculateT(valA, valB);
                workingSequence.splice(currentPosition - 2, 3, result);
                currentPosition -= 2;
            }
        } else if (currentElement === 'q') {
            if (currentPosition >= 2 && typeof workingSequence[currentPosition - 1] === 'number' && workingSequence[currentPosition - 2] === 'p') {
                const valX = workingSequence[currentPosition - 1];
                const result = calculateS(valX);
                workingSequence.splice(currentPosition - 2, 3, result);
                currentPosition -= 2;
            }
        }
        currentPosition++;
    }
    return workingSequence;
}

function handleSingleExpression(rawLine) {
    const outputEmptyAndReturn = () => { outputLog(''); return; };

    let processedData = cleanInputString(rawLine);
    if (!processedData) { outputEmptyAndReturn(); return; }

    processedData = parseTokensAndNumbers(processedData);

    processedData = tokenizeExpression(processedData);

    processedData = evaluateExpressionTree(processedData);

    const finalResult = processedData[0];

    if (finalResult === undefined) {
        outputEmptyAndReturn();
    } else {
        outputLog(finalResult);
    }
}
