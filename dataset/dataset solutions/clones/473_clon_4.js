var fs = require('fs');
var inputBuffer = fs.readFileSync(process.stdin.fd);
var inputLines = inputBuffer.toString('utf8').split('\n');

function* createLineStream(lines) {
    let currentIdx = 0;
    while (currentIdx < lines.length) {
        yield lines[currentIdx++];
    }
}

function manhattanDistance(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

function processField(fieldWidth, fieldHeight, fieldContent) {
    let entryPoint = null;
    let exitPoint = null;
    const elementPositions = Array.from({ length: 5 }, () => []);

    fieldContent.forEach((rowText, yCoordinate) => {
        Array.from(rowText).forEach((symbol, xCoordinate) => {
            const currentCoordinate = { x: xCoordinate, y: yCoordinate };
            switch (symbol) {
                case 'S':
                    entryPoint = currentCoordinate;
                    break;
                case 'G':
                    exitPoint = currentCoordinate;
                    break;
                case '.':
                    break;
                default:
                    const typeIdentifier = Number(symbol) - 1;
                    elementPositions[typeIdentifier].push(currentCoordinate);
                    break;
            }
        });
    });

    const unreachableDistance = Infinity;

    const pathEvaluation = Array.from({ length: 5 }, (_, initialElementType) => initialElementType)
        .reduce((shortestPathRecord, initialElementType) => {
            const pathSegmentTypes = Array.from({ length: 4 }, (_, i) => (initialElementType + i) % 5);

            let currentSegmentDistances = elementPositions[pathSegmentTypes[0]].map(element =>
                manhattanDistance(entryPoint, element)
            );

            const distancesToFinalSegment = pathSegmentTypes.slice(0, 3).reduce((previousSegmentDistances, currentSegmentType, segmentIndex) => {
                const nextSegmentType = pathSegmentTypes[segmentIndex + 1];
                const newSegmentDistances = elementPositions[nextSegmentType].map(nextElement => {
                    return elementPositions[currentSegmentType].reduce((minimumDistance, previousElement, previousElementIndex) => {
                        const distanceToPrevious = previousSegmentDistances[previousElementIndex];
                        if (distanceToPrevious === unreachableDistance) return minimumDistance;
                        return Math.min(minimumDistance, distanceToPrevious + manhattanDistance(previousElement, nextElement));
                    }, unreachableDistance);
                });
                return newSegmentDistances;
            }, currentSegmentDistances);

            const minimumDistanceToExit = distancesToFinalSegment.reduce((minimumDistance, distanceToLastElement, elementIndex) => {
                if (distanceToLastElement === unreachableDistance) return minimumDistance;
                const lastElement = elementPositions[pathSegmentTypes[3]][elementIndex];
                return Math.min(minimumDistance, distanceToLastElement + manhattanDistance(lastElement, exitPoint));
            }, unreachableDistance);

            if (minimumDistanceToExit < shortestPathRecord.distance) {
                return { distance: minimumDistanceToExit, type: initialElementType };
            }
            return shortestPathRecord;
        }, { distance: unreachableDistance, type: -1 });

    if (pathEvaluation.distance === unreachableDistance) {
        return "NA";
    } else {
        return `${pathEvaluation.type + 1} ${pathEvaluation.distance}`;
    }
}

function executeMain() {
    const lineIterator = createLineStream(inputLines);

    for (const currentLine of lineIterator) {
        const [widthString, heightString] = currentLine.split(' ');
        const currentWidth = Number(widthString);
        const currentHeight = Number(heightString);

        if (currentWidth === 0 && currentHeight === 0) {
            break;
        }

        const fieldRows = Array.from({ length: currentHeight }, () => lineIterator.next().value);
        const outcome = processField(currentWidth, currentHeight, fieldRows);
        console.log(outcome);
    }
}

executeMain();
