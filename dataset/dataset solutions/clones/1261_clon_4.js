const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const dimensionsList = inputLines.reduce((accumulator, currentLine) => {
    const parts = currentLine.split(' ').map(Number);
    if (parts.length === 2 && (parts[0] !== 0 || parts[1] !== 0)) {
        accumulator.push(parts);
    }
    return accumulator;
}, []);

const finalRenderedOutput = dimensionsList.reduce((outputAccumulator, currentDimensions, index, array) => {
    const [heightValue, widthValue] = currentDimensions;
    let currentPatternRows = [];

    for (let rowIndex = 0; rowIndex < heightValue; rowIndex++) {
        let currentRowCharacters = [];
        for (let colIndex = 0; colIndex < widthValue; colIndex++) {
            if (rowIndex === 0 || rowIndex === heightValue - 1) {
                currentRowCharacters.push('#');
            } else {
                if (colIndex === 0 || colIndex === widthValue - 1) {
                    currentRowCharacters.push('#');
                } else {
                    currentRowCharacters.push('.');
                }
            }
        }
        currentPatternRows.push(currentRowCharacters.join(''));
    }

    const patternString = currentPatternRows.join('\n');

    if (index < array.length - 1) {
        return outputAccumulator + patternString + '\n\n';
    } else {
        return outputAccumulator + patternString;
    }
}, '');

console.log(finalRenderedOutput + '\n');
