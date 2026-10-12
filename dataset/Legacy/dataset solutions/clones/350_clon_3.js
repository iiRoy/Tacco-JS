function checkLeadingZeroConstraint(numberString, digitToSubstitute) {
    return digitToSubstitute === 0 && numberString.length > 1 && numberString.charAt(0) === 'X';
}

function testDigitSubstitution(strNum1, strNum2, strResult, digit) {
    const substitutedNum1 = strNum1.replace(/X/g, digit);
    const substitutedNum2 = strNum2.replace(/X/g, digit);
    const substitutedNum3 = strResult.replace(/X/g, digit);

    const valNum1 = parseInt(substitutedNum1, 10);
    const valNum2 = parseInt(substitutedNum2, 10);
    const valNum3 = parseInt(substitutedNum3, 10);

    return valNum1 + valNum2 === valNum3;
}

function solveEquations() {
    rawInputBuffer.forEach(function(currentEquationLine) {
        const trimmedLine = currentEquationLine.trim();
        if (trimmedLine === '') {
            return;
        }

        const equationMatch = trimmedLine.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);

        const strNum1 = equationMatch[1];
        const strNum2 = equationMatch[2];
        const strResult = equationMatch[3];

        let replacementDigit;
        for (replacementDigit = 0; replacementDigit <= 9; replacementDigit++) {
            const isLeadingZeroViolation =
                checkLeadingZeroConstraint(strNum1, replacementDigit) ||
                checkLeadingZeroConstraint(strNum2, replacementDigit) ||
                checkLeadingZeroConstraint(strResult, replacementDigit);

            if (isLeadingZeroViolation) {
                continue;
            }

            if (testDigitSubstitution(strNum1, strNum2, strResult, replacementDigit)) {
                break;
            }
        }

        console.log(replacementDigit === 10 ? 'NA' : replacementDigit);
    });
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    rawInputBuffer += dataChunk;
});
process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split('\n');
    solveEquations();
});
