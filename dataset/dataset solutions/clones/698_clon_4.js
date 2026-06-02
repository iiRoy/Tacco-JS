const createLineReader = (inputString) => {
    const lines = inputString.trim().split("\n");
    let currentLineIndex = 0;
    return {
        retrieveNext: () => {
            if (currentLineIndex < lines.length) {
                return lines[currentLineIndex++];
            }
            return undefined;
        }
    };
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataReader = createLineReader(rawInputData);

const directionTransformations = {
    'NORTH_ORIENTED': { 'n': 'N', 'e': 'E', 's': 'S', 'w': 'W' },
    'EAST_ORIENTED': { 'n': 'E', 'e': 'S', 's': 'W', 'w': 'N' },
    'SOUTH_ORIENTED': { 'n': 'S', 'e': 'W', 's': 'N', 'w': 'E' },
    'WEST_ORIENTED': { 'n': 'W', 'e': 'N', 's': 'E', 'w': 'S' }
};

const applyPathTransformation = (pathSegmentString, transformationMap) => {
    return pathSegmentString.split('').map(char => {
        return transformationMap[char] || char;
    }).join('');
};

let referencePathSignature = '';
const collectedOutput = [];

while (true) {
    const currentSequenceCount = parseInt(dataReader.retrieveNext(), 10);
    if (currentSequenceCount === 0) break;

    referencePathSignature = '';

    for (let sequenceIndex = 0; sequenceIndex < currentSequenceCount + 1; sequenceIndex++) {
        const numberOfCoordinates = parseInt(dataReader.retrieveNext(), 10);
        const coordinateSet = Array.from({ length: numberOfCoordinates }, () => {
            return dataReader.retrieveNext().split(" ").map(Number);
        });

        const pathSegments = coordinateSet.slice(1).map((currentCoord, idx) => {
            const previousCoord = coordinateSet[idx];
            const deltaX = currentCoord[0] - previousCoord[0];
            const deltaY = currentCoord[1] - previousCoord[1];

            if (deltaX === 0 && deltaY !== 0) {
                return (deltaY > 0 ? 'n' : 's') + Math.abs(deltaY);
            } else if (deltaY === 0 && deltaX !== 0) {
                return (deltaX > 0 ? 'e' : 'w') + Math.abs(deltaX);
            }
            return '';
        }).filter(Boolean);

        const forwardPathString = pathSegments.join('');
        const reversedPathString = pathSegments.slice().reverse().join('');

        if (sequenceIndex === 0) {
            referencePathSignature = applyPathTransformation(forwardPathString, directionTransformations['NORTH_ORIENTED']);
        } else {
            const currentPathVariations = [];

            Object.values(directionTransformations).forEach(transformMap => {
                currentPathVariations.push(applyPathTransformation(forwardPathString, transformMap));
                currentPathVariations.push(applyPathTransformation(reversedPathString, transformMap));
            });

            if (currentPathVariations.some(variation => variation === referencePathSignature)) {
                collectedOutput.push(sequenceIndex);
            }
        }
    }
    collectedOutput.push("+++++");
}

console.log(collectedOutput.join('\n'));
