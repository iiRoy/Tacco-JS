const fileSystem = require('fs');

const standardInputPath = '/dev/stdin';

const rawTextContent = fileSystem.readFileSync(standardInputPath).toString('utf8').trim();

let sourceLines = rawTextContent.split('\n');

let lineIndexTracker = 0;

const fetchNextLine = () => {
    if (lineIndexTracker >= sourceLines.length) {
        return null;
    }
    return sourceLines[lineIndexTracker++];
};

const displayRectanglePattern = (rectHeight, rectWidth) => {
    const borderCharacter = '#';
    const interiorCharacter = '.';

    const lastRowIndex = rectHeight - 1;
    const lastColIndex = rectWidth - 1;

    const currentRectangleBuffer = [];

    for (let currentYCoordinate = 0; currentYCoordinate < rectHeight; currentYCoordinate++) {
        let currentRowString = '';
        for (let currentXCoordinate = 0; currentXCoordinate < rectWidth; currentXCoordinate++) {
            const isTopOrBottomEdge = (currentYCoordinate === 0 || currentYCoordinate === lastRowIndex);
            const isLeftOrRightEdge = (currentXCoordinate === 0 || currentXCoordinate === lastColIndex);

            if (isTopOrBottomEdge || isLeftOrRightEdge) {
                currentRowString += borderCharacter;
            } else {
                currentRowString += interiorCharacter;
            }
        }
        currentRectangleBuffer.push(currentRowString);
    }

    currentRectangleBuffer.forEach(lineOutput => console.log(lineOutput));

    console.log();
};

let continueProcessingInput = true;
while (continueProcessingInput) {
    const activeLine = fetchNextLine();

    if (activeLine === null) {
        break;
    }

    const dimensionTokens = activeLine.split(' ');

    if (dimensionTokens.length < 2) {
        console.error("Warning: Malformed dimension line encountered, skipping:", activeLine);
        continue;
    }

    const heightValue = parseInt(dimensionTokens[0], 10);
    const widthValue = parseInt(dimensionTokens[1], 10);

    if (isNaN(heightValue) || isNaN(widthValue)) {
        console.error("Warning: Non-numeric dimensions found, skipping:", activeLine);
        continue;
    }

    if (heightValue === 0 && widthValue === 0) {
        continueProcessingInput = false;
        break;
    }

    displayRectanglePattern(heightValue, widthValue);
}