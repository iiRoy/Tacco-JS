function processInputData(rawContent) {
    const contentLines = rawContent.split('\n');

    const dimensionsLine = contentLines[0];
    const dimensionParts = dimensionsLine.split(' ');
    const gridHeight = parseInt(dimensionParts[0], 10);
    const gridWidth = dimensionParts[1];

    const dataStartOffset = 1;

    const gridRows = Array.from({ length: gridHeight });

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        gridRows[rowIdx] = contentLines[rowIdx + dataStartOffset];
    }

    for (let outputIdx = 0; outputIdx < gridHeight; outputIdx++) {
        const currentRowString = gridRows[outputIdx];
        console.log(currentRowString);
        console.log(currentRowString);
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
