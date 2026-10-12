function performBigAddition(firstNumStr, secondNumStr) {
    let longerDigitsArr;
    let shorterDigitsArr;
    let lenLonger;
    let lenShorter;

    if (firstNumStr.length >= secondNumStr.length) {
        lenLonger = firstNumStr.length;
        lenShorter = secondNumStr.length;
        longerDigitsArr = firstNumStr.split("");
        shorterDigitsArr = secondNumStr.split("");
    } else {
        lenLonger = secondNumStr.length;
        lenShorter = firstNumStr.length;
        longerDigitsArr = secondNumStr.split("");
        shorterDigitsArr = firstNumStr.split("");
    }
    
    const MAX_DIGIT_LENGTH = 80;
    if (lenLonger > MAX_DIGIT_LENGTH) {
        console.log("overflow");
        return;
    }
    
    const getDigitValue = (char) => parseInt(char, 10);

    let resultDigits = [];
    let currentCarry = 0;
    let idxLonger = lenLonger - 1;
    let idxShorter = lenShorter - 1;

    while (idxShorter >= 0) {
        const digit1 = getDigitValue(longerDigitsArr[idxLonger]);
        const digit2 = getDigitValue(shorterDigitsArr[idxShorter]);
        const sumOfDigits = digit1 + digit2 + currentCarry;

        resultDigits.unshift(sumOfDigits % 10);
        currentCarry = Math.floor(sumOfDigits / 10);

        idxLonger--;
        idxShorter--;
    }
    
    while (idxLonger >= 0) {
        const digit1 = getDigitValue(longerDigitsArr[idxLonger]);
        const sumOfDigits = digit1 + currentCarry;

        resultDigits.unshift(sumOfDigits % 10);
        currentCarry = Math.floor(sumOfDigits / 10);

        idxLonger--;
    }

    if (currentCarry > 0) {
        resultDigits.unshift(currentCarry);
    }
    
    if (lenLonger === MAX_DIGIT_LENGTH && resultDigits.length > MAX_DIGIT_LENGTH) {
        console.log("overflow");
    } else {
        console.log(resultDigits.join(""));
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    const inputLines = inputData.trim().split("\n");
    let currentLineIndex = 0;
    
    const numTestCasesStr = inputLines[currentLineIndex++].trim();
    const numTestCases = parseInt(numTestCasesStr, 10);

    let remainingCases = numTestCases;
    while (remainingCases > 0) {
        const num1 = inputLines[currentLineIndex];
        const num2 = inputLines[currentLineIndex + 1];
        
        performBigAddition(num1, num2);
        
        currentLineIndex += 2;
        remainingCases--;
    }
});
