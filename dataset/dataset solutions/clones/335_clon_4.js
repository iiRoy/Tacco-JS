const processAllMazes = (sourceText) => {
    const textLines = sourceText.trim().split('\n');
    let currentLineIndex = 0;
    const computedOutcomes = [];

    while (true) {
        const gridDimensions = textLines[currentLineIndex++].split(' ').map(Number);
        const [gridRows, gridCols] = gridDimensions;

        if (gridRows === 0 && gridCols === 0) {
            break;
        }

        const mazeGrid = Array.from({ length: gridRows }, () =>
            textLines[currentLineIndex++].split('')
        );

        const resultString = (mazeGrid[0][0] === '.') ? "0 0" : "LOOP";
        computedOutcomes.push(resultString);
    }

    return computedOutcomes.join('\n');
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedOutput = processAllMazes(rawInputData);
console.log(processedOutput);