function sumLargeStrings(firstNumStr, secondNumStr) {
    const len1 = firstNumStr.length;
    const len2 = secondNumStr.length;
    const maxInputLen = Math.max(len1, len2);

    if (maxInputLen > 80) {
        console.log("overflow");
        return;
    }

    const paddedNum1 = firstNumStr.padStart(maxInputLen, '0');
    const paddedNum2 = secondNumStr.padStart(maxInputLen, '0');

    const digits1 = paddedNum1.split('').map(Number);
    const digits2 = paddedNum2.split('').map(Number);

    let currentCarry = 0;
    const resultDigits = [];

    for (let i = maxInputLen - 1; i >= 0; i--) {
        const sumOfDigits = digits1[i] + digits2[i] + currentCarry;
        resultDigits.unshift(sumOfDigits % 10);
        currentCarry = Math.floor(sumOfDigits / 10);
    }

    if (currentCarry > 0) {
        resultDigits.unshift(currentCarry);
    }

    if (resultDigits.length > 80) {
        console.log("overflow");
    } else {
        console.log(resultDigits.join(""));
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(rawInput) {
    const allInputLines = rawInput.trim().split('\n').map(s => s.trim()).filter(Boolean);
    let currentLinePointer = 0;

    const numberOfTestPairs = parseInt(allInputLines[currentLinePointer++]);

    Array.from({ length: numberOfTestPairs }).forEach(() => {
        const firstOperandString = allInputLines[currentLinePointer++];
        const secondOperandString = allInputLines[currentLinePointer++];
        sumLargeStrings(firstOperandString, secondOperandString);
    });
});
