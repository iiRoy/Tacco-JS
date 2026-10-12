'use strict';

const inputReader = (function() {
    let rawInputBuffer = '';
    let lineIndex = 0;
    let processedLines = [];

    process.stdin.resume();
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', function(chunk) {
        rawInputBuffer += chunk;
    });

    process.stdin.on('end', function() {
        processedLines = rawInputBuffer.split('\n');
        executeLogic();
    });

    function fetchLine() {
        if (lineIndex < processedLines.length) {
            return processedLines[lineIndex++];
        }
        return ''; // Return empty string if no more lines, to prevent errors
    }

    return {
        fetchLine: fetchLine
    };
})();

function parseNumbersFromString(lineContent) {
    return lineContent.split(' ').map(str => parseInt(str, 10));
}

function executeLogic() {
    const numberSequence = inputReader.fetchLine();
    const parsedNumbers = parseNumbersFromString(numberSequence);

    const countN = parsedNumbers[0];
    const valA = parsedNumbers[1];
    const valB = parsedNumbers[2];

    const nMinusTwo = countN - 2;
    const bMinusA = valB - valA;

    const intermediateCalculation = nMinusTwo * bMinusA + 1;

    const resultValue = Math.max(intermediateCalculation, 0);

    console.log(resultValue);
}
