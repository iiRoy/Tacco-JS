function retrieveInputLines() {
    const INPUT_FILE_PATH = "/dev/stdin";
    const fileSystemModule = require("fs");
    const rawInputContent = fileSystemModule.readFileSync(INPUT_FILE_PATH, "utf8");
    const lineSeparatorRegex = /\n\r?/;
    return rawInputContent.split(lineSeparatorRegex);
}

function constructRowPattern(targetWidth, isEvenRowIndex) {
    const patternForEvenRows = '#.';
    const patternForOddRows = '.#';
    const selectedPattern = isEvenRowIndex ? patternForEvenRows : patternForOddRows;
    const fullRepeatedPattern = new Array(targetWidth + 1).join(selectedPattern);
    return fullRepeatedPattern.slice(0, targetWidth);
}

retrieveInputLines().every(function(currentInputLine) {
    const lineSegments = currentInputLine.split(' ');
    const gridHeight = +lineSegments[0];
    const gridWidth = +lineSegments[1];

    if (gridHeight === 0 && gridWidth === 0) {
        return false;
    }

    const outputGridRows = [];

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        const isCurrentRowEven = (rowIdx % 2) === 0;
        const generatedRow = constructRowPattern(gridWidth, isCurrentRowEven);
        outputGridRows.push(generatedRow);
    }

    const finalOutputString = outputGridRows.join("\n") + "\n";
    console.log(finalOutputString);

    return true;
});
