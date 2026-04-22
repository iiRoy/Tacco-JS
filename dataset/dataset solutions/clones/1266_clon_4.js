const GenerateGridVisual = (heightDimension, widthDimension) => {
    const obtainCharacter = (rowIndex, colIndex) => {
        const isRowPositionEven = rowIndex % 2 === 0;
        const isColumnPositionEven = colIndex % 2 === 0;

        if (isRowPositionEven) {
            return isColumnPositionEven ? '#' : '.';
        } else {
            return isColumnPositionEven ? '.' : '#';
        }
    };

    const formSingleRow = (currentHeightIdx, totalWidth) => {
        return Array.from({ length: totalWidth }, (_, currentWidthIdx) =>
            obtainCharacter(currentHeightIdx, currentWidthIdx)
        ).join('');
    };

    return Array.from({ length: heightDimension }, (_, currentHeightIdx) =>
        formSingleRow(currentHeightIdx, widthDimension)
    ).join('\n');
};

const ProcessInputData = (rawTextContent) => {
    const inputLines = rawTextContent.trim().split('\n');

    const dimensionTuples = inputLines.map(lineItem => {
        const partsOfLine = lineItem.split(' ');
        return [parseInt(partsOfLine[0], 10), parseInt(partsOfLine[1], 10)];
    });

    const terminationPoint = dimensionTuples.findIndex(tuple => tuple[0] === 0 && tuple[1] === 0);

    const relevantTuples = terminationPoint === -1 ? dimensionTuples : dimensionTuples.slice(0, terminationPoint);

    const fullOutputBlocks = relevantTuples.map(tuple => {
        const gridHeight = tuple[0];
        const gridWidth = tuple[1];
        return GenerateGridVisual(gridHeight, gridWidth);
    });

    console.log(fullOutputBlocks.map(block => block + '\n').join(''));
};

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));