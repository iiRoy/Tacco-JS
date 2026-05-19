process.stdin.resume();
process.stdin.setEncoding('utf8');

const NEWLINE_DELIMITER = '\n';
const SPACE_DELIMITER = ' ';

function processInputLineAndCalculateLength(lineContent) {
    const lineParts = lineContent.split(SPACE_DELIMITER);
    const firstOperand = new Number(lineParts[0]);
    const secondOperand = new Number(lineParts[1]);
    const sumOfOperands = firstOperand + secondOperand;
    const sumStringRepresentation = String(sumOfOperands);
    return sumStringRepresentation.length;
}

process.stdin.on('data', function (inputChunk) {
    const rawInputBuffer = inputChunk.toString();
    const inputLines = rawInputBuffer.split(NEWLINE_DELIMITER);

    const validLines = inputLines.filter(line => line.trim() !== '');

    for (const currentLine of validLines) {
        const resultLength = processInputLineAndCalculateLength(currentLine);
        console.log(resultLength);
    }
});
