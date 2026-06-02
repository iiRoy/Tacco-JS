process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputBuffer) {
    const LINE_SEPARATOR = '\n';
    const OUTPUT_CASE_LABEL = 'Case ';
    const VALUE_SEPARATOR = ': ';

    const rawInputLines = String(inputBuffer).split(LINE_SEPARATOR);

    const parseLineToInt = (lineContent) => {
        return parseInt(lineContent, 10);
    };

    const parsedNumbers = rawInputLines.map(parseLineToInt);

    const formatOutputString = (indexValue, numberValue) => {
        return OUTPUT_CASE_LABEL + indexValue + VALUE_SEPARATOR + numberValue;
    };

    for (let lineIndex = 0; lineIndex < parsedNumbers.length; lineIndex++) {
        const currentNumber = parsedNumbers[lineIndex];

        if (currentNumber !== 0) {
            console.log(formatOutputString(lineIndex, currentNumber));
        }
    }
});
