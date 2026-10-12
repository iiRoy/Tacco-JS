const outputLog = console.log;
if (typeof process !== "undefined") {
    let rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', function() {
        const processedInputLines = rawInputBuffer.split("\n");
        processAllInput(processedInputLines);
    });
}


function processAllInput(processedInputLines) {
    for (const currentLine of processedInputLines) {
        if (currentLine !== "#") {
            processExpressionLine(currentLine);
        }
    }
    outputLog('');
}

function computeModularPower(baseValue, powerExponent) {
    const modulusConstant = 1000000007;
    const LARGE_BASE_THRESHOLD = 90000000;

    if (baseValue > LARGE_BASE_THRESHOLD && powerExponent > 1) {
        const exponentRemainder = powerExponent % 2;
        const halfExponent = Math.floor(powerExponent / 2);
        const subProblemResult = computeModularPower(baseValue, halfExponent);

        let currentSum;
        if (exponentRemainder) {
            currentSum = (2 * subProblemResult + baseValue) % modulusConstant;
        } else {
            currentSum = (2 * subProblemResult) % modulusConstant;
        }
        return currentSum % modulusConstant;
    }
    return (baseValue * powerExponent) % modulusConstant;
}


//S<x>?????????
function calculateSFunction(xValue) {
    return computeModularPower(xValue, xValue);
}
//x>>y?????????
function calculateTFunction(xVal, yVal) {
    return Math.floor(xVal / Math.pow(2, yVal));
}

//remove s and spaces
function stripSpecialChars(inputString) {
    const cleanupRegex = /\s|S/g;
    return inputString.replace(cleanupRegex, '');
}

//x ??? string
function isNumericCharacter(charCandidate) {
    const parsedNumberValue = Number(charCandidate);
    return !isNaN(parsedNumberValue);
}

//<,>,??°????????????
function segmentInputTokens(charArray) {
    const inputChars = Array.isArray(charArray) ? charArray : Array.from(charArray);
    const arrayLength = inputChars.length;
    let segmentStart = 0;
    let segmentEnd = 0;
    const outputTokens = [];
    let isParsingNumber = false;

    for (let i = 0; i < arrayLength; i++) {
        const currentElement = inputChars[i];
        const elementIsNumeric = isNumericCharacter(currentElement);

        if (!isParsingNumber && elementIsNumeric) {
            segmentStart = i;
            isParsingNumber = true;
        } else if (isParsingNumber && !elementIsNumeric) {
            segmentEnd = i;
            isParsingNumber = false;
            const numberSegment = inputChars.slice(segmentStart, segmentEnd).join('');
            const finalNumber = Number(numberSegment);
            outputTokens.push(finalNumber);
        }

        if (!elementIsNumeric) {
            outputTokens.push(currentElement);
        }
    }

    if (isParsingNumber) {
        segmentEnd = arrayLength;
        const numberSegment = inputChars.slice(segmentStart, segmentEnd).join('');
        const finalNumber = Number(numberSegment);
        outputTokens.push(finalNumber);
    }
    return outputTokens;
}

//>??????S<>????????¨?????????>>????????¨?????????????????????
/*
??????????????????????¨???????
p...S<x>???<
q...S<x>???>
L...19,331???????????°???(literal)
t...>>????????¨
??????t????¬???????????????????p???L????????\????????¨????????§???????????¨?????????????????????
??????????????????>????¬??????????>???L??????????????????????????????????????????§????????°??????>????????????..??????
 */
function isSingleGreaterThanToken(checkIndex, tokenList) {
    let isSingleToken = true;
    const nextChar = tokenList[checkIndex + 1];
    if (nextChar === '>') {
        const charAfterNext = tokenList[checkIndex + 2];
        if (isNumericCharacter(charAfterNext) || charAfterNext === '<') {
            isSingleToken = false;
        }
    }
    return isSingleToken;
}

//token????????????<???p??????>???q??????>>???t?????????
//[p,p,p,10,q,t,10,q,t,10,q]?????????????????????
function mapSymbolicTokens(tokenList) {
    const symbolicTokens = [];
    const listLength = tokenList.length;

    for (let i = 0; i < listLength; i++) {
        const tokenChar = tokenList[i];

        if (isNumericCharacter(tokenChar)) {
            symbolicTokens.push(tokenChar);
        } else {
            switch (tokenChar) {
                case '<':
                    symbolicTokens.push('p');
                    break;
                case '>':
                    if (isSingleGreaterThanToken(i, tokenList)) {
                        symbolicTokens.push('q');
                    } else {
                        symbolicTokens.push('t');
                        i += 1;
                    }
                    break;
                default:
                    break;
            }
        }
    }
    return symbolicTokens;
}

//?¨?????????¨?????¢?????????
function evaluateTokenTree(expressionTree) {
    let currentIndex = 0;

    const applyOperationAndReduce = (opResult, startIndex, countToRemove) => {
        expressionTree.splice(startIndex, countToRemove);
        expressionTree.splice(startIndex, 0, opResult); // Insert at startIndex
        currentIndex = startIndex - 1;
    };

    while (expressionTree.length > 1 && currentIndex < expressionTree.length) {
        const currentOp = expressionTree[currentIndex];

        if (isNumericCharacter(currentOp)) {
            if (currentIndex > 0 && expressionTree[currentIndex - 1] === 't') {
                const leftOperand = expressionTree[currentIndex - 2];
                const rightOperand = expressionTree[currentIndex];
                if (isNumericCharacter(leftOperand) && isNumericCharacter(rightOperand)) {
                    const result = calculateTFunction(leftOperand, rightOperand);
                    applyOperationAndReduce(result, currentIndex - 2, 3);
                } else {
                    currentIndex++;
                }
            } else {
                currentIndex++;
            }
        } else if (currentOp === 'p') {
            currentIndex++;
        } else if (currentOp === 'q') {
            const operand = expressionTree[currentIndex - 1];
            if (currentIndex > 0 && expressionTree[currentIndex - 2] === 'p' && isNumericCharacter(operand)) {
                const result = calculateSFunction(operand);
                applyOperationAndReduce(result, currentIndex - 2, 3);
            } else {
                currentIndex++;
            }
        } else if (currentOp === 't') {
            currentIndex++;
        } else {
            currentIndex++;
        }
    }
    return expressionTree;
}

function processExpressionLine(inputLine) {
    let processedResult = stripSpecialChars(inputLine);
    if (!processedResult) {
        outputLog('');
        return;
    }

    processedResult = segmentInputTokens(processedResult);
    if (!processedResult) {
        outputLog('');
        return;
    }

    processedResult = mapSymbolicTokens(processedResult);
    if (!processedResult) {
        outputLog('');
        return;
    }

    processedResult = evaluateTokenTree(processedResult);
    if (!processedResult) {
        outputLog('');
        return;
    }

    outputLog(processedResult[0]);
}
