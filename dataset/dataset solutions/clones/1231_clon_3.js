process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputAccumulator = '';

process.stdin.on('data', function (chunkOfData) {
    inputAccumulator += chunkOfData;
});

process.stdin.on('end', function () {
    var inputLines = inputAccumulator.split('\n');

    const parseLineToInt = (lineString) => {
        return parseInt(lineString, 10);
    };

    var numericValues = inputLines.map(parseLineToInt);

    const CASE_IDENTIFIER_PREFIX = 'Case ';

    for (var caseIndex = 0; caseIndex < numericValues.length; caseIndex++) {
        var currentNumber = numericValues[caseIndex];

        var caseLabel = CASE_IDENTIFIER_PREFIX + (caseIndex + 1) + ': ';
        console.log(caseLabel + currentNumber);

        if (currentNumber === 0) {
            return;
        }
    }
});
