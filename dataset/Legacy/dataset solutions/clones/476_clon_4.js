function calculateManhattanDistance(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

class InputLineProcessor {
    constructor(fullInputText) {
        this.lines = fullInputText.split('\n');
        this.currentLineIndex = 0;
    }

    fetchNextLine() {
        if (this.currentLineIndex >= this.lines.length) {
            return null;
        }
        return this.lines[this.currentLineIndex++];
    }
}

function processGameRounds() {
    const MAX_PATH_VALUE = 1 << 30;

    const inputProcessor = new InputLineProcessor(rawInputText);

    while (true) {
        const dimensionsLine = inputProcessor.fetchNextLine();
        if (dimensionsLine === null) {
            break;
        }

        const dimensionsParts = dimensionsLine.split(' ');
        const gridWidth = parseInt(dimensionsParts[0], 10);
        const gridHeight = parseInt(dimensionsParts[1], 10);

        if (gridWidth === 0 && gridHeight === 0) {
            break;
        }

        let startPoint = null;
        let endPoint = null;
        const elementLocations = Array.from({ length: 5 }, () => []); // elementLocations[0] for '1', [1] for '2', etc.

        for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
            const currentRowContent = inputProcessor.fetchNextLine();
            if (currentRowContent === null) {
                break;
            }
            for (let colIdx = 0; colIdx < gridWidth; ++colIdx) {
                const cellCharacter = currentRowContent[colIdx];
                const currentPoint = { x: colIdx, y: rowIdx };

                switch (cellCharacter) {
                    case 'S':
                        startPoint = currentPoint;
                        break;
                    case 'G':
                        endPoint = currentPoint;
                        break;
                    case '.':
                        break;
                    default:
                        const elementTypeIndex = parseInt(cellCharacter, 10) - 1;
                        elementLocations[elementTypeIndex].push(currentPoint);
                        break;
                }
            }
        }

        let minTotalDistance = MAX_PATH_VALUE;
        let bestSkippedType = -1;

        const allPossibleElementTypes = [1, 2, 3, 4, 5];

        for (let skippedTypeCandidate = 1; skippedTypeCandidate <= 5; ++skippedTypeCandidate) {
            const currentSequenceOfTypes = allPossibleElementTypes.filter(type => type !== skippedTypeCandidate);
            // minDistancesToTypeInstance[sequenceStep][instanceIndex]
            // sequenceStep 0 for first type in sequence, 1 for second, ..., 3 for fourth
            const minDistancesToTypeInstance = Array.from({ length: 4 }, () => []);

            const firstTypeInSeq = currentSequenceOfTypes[0];
            const firstTypeInstances = elementLocations[firstTypeInSeq - 1];
            
            if (firstTypeInstances.length > 0) {
                for (let instanceIdx = 0; instanceIdx < firstTypeInstances.length; ++instanceIdx) {
                    minDistancesToTypeInstance[0][instanceIdx] = calculateManhattanDistance(startPoint, firstTypeInstances[instanceIdx]);
                }
            }

            for (let seqStep = 0; seqStep < 3; ++seqStep) {
                const currentTypeInSeq = currentSequenceOfTypes[seqStep];
                const nextTypeInSeq = currentSequenceOfTypes[seqStep + 1];

                const currentTypeInstances = elementLocations[currentTypeInSeq - 1];
                const nextTypeInstances = elementLocations[nextTypeInSeq - 1];

                if (currentTypeInstances.length === 0 || nextTypeInstances.length === 0) {
                    continue;
                }

                for (let currentInstIdx = 0; currentInstIdx < currentTypeInstances.length; ++currentInstIdx) {
                    const distToCurrentInstance = minDistancesToTypeInstance[seqStep][currentInstIdx];
                    if (distToCurrentInstance === undefined) {
                        continue;
                    }

                    for (let nextInstIdx = 0; nextInstIdx < nextTypeInstances.length; ++nextInstIdx) {
                        const segmentDistance = calculateManhattanDistance(currentTypeInstances[currentInstIdx], nextTypeInstances[nextInstIdx]);
                        const totalDistanceThroughNext = distToCurrentInstance + segmentDistance;

                        if (minDistancesToTypeInstance[seqStep + 1][nextInstIdx] === undefined || totalDistanceThroughNext < minDistancesToTypeInstance[seqStep + 1][nextInstIdx]) {
                            minDistancesToTypeInstance[seqStep + 1][nextInstIdx] = totalDistanceThroughNext;
                        }
                    }
                }
            }

            const lastTypeInSeq = currentSequenceOfTypes[3];
            const lastTypeInstances = elementLocations[lastTypeInSeq - 1];

            if (lastTypeInstances.length > 0) {
                for (let instanceIdx = 0; instanceIdx < lastTypeInstances.length; ++instanceIdx) {
                    const distToLastInstance = minDistancesToTypeInstance[3][instanceIdx];
                    if (distToLastInstance === undefined) {
                        continue;
                    }
                    const finalPathCandidate = distToLastInstance + calculateManhattanDistance(lastTypeInstances[instanceIdx], endPoint);

                    if (finalPathCandidate < minTotalDistance) {
                        minTotalDistance = finalPathCandidate;
                        bestSkippedType = skippedTypeCandidate;
                    }
                }
            }
        }

        if (minTotalDistance === MAX_PATH_VALUE) {
            console.log("NA");
        } else {
            console.log(`${bestSkippedType} ${minTotalDistance}`);
        }
    }
}

let rawInputText = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInputText += chunk;
});
process.stdin.on('end', function() {
    processGameRounds();
});
