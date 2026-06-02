const performMatrixTranspose = matrix => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

const checkIfAllDots = segment => {
    const DOT_CHARACTER = '.';
    return segment.every(element => element === DOT_CHARACTER);
};

function executeProcessingPipeline(rawDataString) {
    const initialLines = rawDataString.split("\n");

    const validRows = initialLines.slice(1)
                                 .map(lineContent => lineContent.split(""))
                                 .filter(rowCharacters => !checkIfAllDots(rowCharacters));

    let transposedColumns = performMatrixTranspose(validRows);

    const finalTransposedColumns = transposedColumns.filter(columnData => !checkIfAllDots(columnData));

    const finalProcessedGrid = performMatrixTranspose(finalTransposedColumns);

    for (let outputRowIndex = 0; outputRowIndex < finalProcessedGrid.length; outputRowIndex++) {
        console.log(finalProcessedGrid[outputRowIndex].join(''));
    }
}

executeProcessingPipeline(require("fs").readFileSync("/dev/stdin", "utf8"));
