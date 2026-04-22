const processInputMatrix = (payload) => {
    const allLines = payload.trim().split('\n');

    const dimensionsLine = allLines[0].split(' ');
    const matrixHeight = Number(dimensionsLine[0]);
    const matrixWidth = Number(dimensionsLine[1]);

    const contentSection = allLines.slice(1, matrixHeight + 1);

    // This sequence replicates the original's column labeling (A-J) and its behavior
    // for indices beyond 'J' (which would result in 'undefined' concatenated with row number).
    const characterMappings = Array.from({ length: 10 }, (_, idx) => String.fromCharCode('A'.charCodeAt(0) + idx));

    const foundCoordinates = contentSection.flatMap((textRow, currentLineIndex) => {
        const rowElements = textRow.split(' ');

        return rowElements
            .map((elementValue, elementIndex) => ({ value: elementValue, colIdx: elementIndex }))
            .filter(item => item.value === "snuke")
            .map(locatedItem => {
                const colChar = characterMappings[locatedItem.colIdx];
                const rowNum = currentLineIndex + 1;
                return colChar + rowNum;
            });
    });

    foundCoordinates.forEach(coordinateString => console.log(coordinateString));
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputMatrix(rawData);