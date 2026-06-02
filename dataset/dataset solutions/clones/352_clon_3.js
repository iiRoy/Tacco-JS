function evaluateExpression(expressionString, replacementDigit) {
    return parseInt(expressionString.replace(/X/g, replacementDigit));
}

function startsWithX(str) {
    return str.charAt(0) === 'X';
}

function solveEquations() {
    const UNKNOWN_VAR_CHAR = 'X';
    const NO_SOLUTION_INDICATOR = 'NA';

    rawInputData.forEach(function (currentEquationStr) {
        const equationSegments = currentEquationStr.split("=");
        const leftOperandsStrs = equationSegments[0].split("+");
        const rightResultStr = equationSegments[1];

        let foundDigit = -1;

        for (let testDigit = 0; testDigit < 10; testDigit++) {
            const isLeadingZeroCase = (testDigit === 0 &&
                (startsWithX(leftOperandsStrs[0]) ||
                 startsWithX(leftOperandsStrs[1]) ||
                 startsWithX(rightResultStr)));

            if (isLeadingZeroCase) {
                continue;
            }

            const valA = evaluateExpression(leftOperandsStrs[0], testDigit);
            const valB = evaluateExpression(leftOperandsStrs[1], testDigit);
            const valX = evaluateExpression(rightResultStr, testDigit);

            if (valA + valB === valX) {
                foundDigit = testDigit;
                break;
            }
        }

        console.log((foundDigit < 0) ? NO_SOLUTION_INDICATOR : foundDigit);
    });
}

let rawInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (incomingChunk) {
    rawInputData += incomingChunk;
});

process.stdin.on('end', function () {
    rawInputData = rawInputData.trim().split('\n');
    solveEquations();
});
