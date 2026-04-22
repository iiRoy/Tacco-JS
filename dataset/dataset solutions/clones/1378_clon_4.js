const filesystem = require('node:fs');

const rawInputContent = filesystem.readFileSync('/dev/stdin', 'utf8');

const processedDimensions = rawInputContent
    .split('\n')
    .map(val => val.trim())
    .filter(val => val.length > 0)
    .map(val => val.split(' ').map(Number));

const constructGraphicalDisplay = (verticalExtent, horizontalExtent) => {
    const perimeterCharacter = '#';
    const fillCharacter = '.';

    const topBottomLine = perimeterCharacter.repeat(horizontalExtent);

    // Determines the pattern for inner lines. If width is 1 or 2,
    // inner lines are also entirely perimeter characters.
    const innerLinePattern = horizontalExtent > 2
        ? perimeterCharacter + fillCharacter.repeat(horizontalExtent - 2) + perimeterCharacter
        : perimeterCharacter.repeat(horizontalExtent);

    const generatedLines = Array.from({ length: verticalExtent }, (_, currentLineIndex) => {
        if (currentLineIndex === 0 || currentLineIndex === verticalExtent - 1) {
            return topBottomLine;
        } else {
            return innerLinePattern;
        }
    });

    // Join the lines and append the required two newlines as per original output structure
    return generatedLines.join('\n') + '\n\n';
};

const collectedVisualOutputs = [];

for (let currentPairIndex = 0; currentPairIndex < processedDimensions.length; currentPairIndex++) {
    const currentPair = processedDimensions[currentPairIndex];
    const firstComponent = currentPair[0];
    const secondComponent = currentPair[1];

    if (firstComponent === 0 && secondComponent === 0) {
        break;
    }

    const textualRepresentation = constructGraphicalDisplay(firstComponent, secondComponent);
    collectedVisualOutputs.push(textualRepresentation);
}

process.stdout.write(collectedVisualOutputs.join(''));