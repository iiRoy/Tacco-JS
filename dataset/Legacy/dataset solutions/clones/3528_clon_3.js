const parseNumericLine = (lineContent, baseRadix) => {
    return lineContent.split(' ').map(strNum => parseInt(strNum, baseRadix));
};

function ProcessGameInput(rawInputString) {
    const DECIMAL_RADIX = 10;

    const inputLines = rawInputString.split('\n');

    const globalParams = parseNumericLine(inputLines[0], DECIMAL_RADIX);
    const globalX = globalParams[2];
    const globalY = globalParams[3];

    const playerXCoordinates = parseNumericLine(inputLines[1], DECIMAL_RADIX);
    const playerYCoordinates = parseNumericLine(inputLines[2], DECIMAL_RADIX);

    const allXCoordinates = [...playerXCoordinates, globalX];
    const allYCoordinates = [...playerYCoordinates, globalY];

    const highestXValue = Math.max(...allXCoordinates);
    const lowestYValue = Math.min(...allYCoordinates);

    if (highestXValue < lowestYValue) {
        console.log('No War');
    } else {
        console.log('War');
    }
}

ProcessGameInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
