const sourceMaterial = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceMaterial.trim().split('\n');

const createCharacterSequence = (quantity, symbol) => {
    let outputSegment = '';
    for (let counter = 0; counter < quantity; counter++) {
        outputSegment += symbol;
    }
    return outputSegment;
};

const constructVisualGrid = (verticalExtent, horizontalExtent) => {
    const singleRowPattern = createCharacterSequence(horizontalExtent, '#');
    let fullGridRepresentation = '';
    for (let rowIterator = 0; rowIterator < verticalExtent; rowIterator++) {
        fullGridRepresentation += singleRowPattern + '\n';
    }
    return fullGridRepresentation;
};

for (const currentEntry of processedLines) {
    if (currentEntry === "0 0") {
        break;
    }

    const dimensionTokens = currentEntry.split(' ').map(token => parseInt(token, 10));
    const gridHeight = dimensionTokens[0];
    const gridWidth = dimensionTokens[1];

    const finalRender = constructVisualGrid(gridHeight, gridWidth);
    console.log(finalRender + '\n');
}