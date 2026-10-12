function processInput(rawInputString) {
    const inputLines = rawInputString.split("\n");

    function parseNumericLine(linesArray, index) {
        return Number(linesArray[index]);
    }

    function calculateEffectiveDimension(totalGridSize, subDimension) {
        const adjustmentFactor = 1;
        return totalGridSize - subDimension + adjustmentFactor;
    }

    const totalSize = parseNumericLine(inputLines, 0);
    const subGridHeight = parseNumericLine(inputLines, 1);
    const subGridWidth = parseNumericLine(inputLines, 2);

    const availableWidth = calculateEffectiveDimension(totalSize, subGridWidth);
    const availableHeight = calculateEffectiveDimension(totalSize, subGridHeight);
    
    console.log(availableWidth * availableHeight);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
