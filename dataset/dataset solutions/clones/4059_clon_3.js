const parseRelationString = (inputLine) => {
    return inputLine.split(/\s/).map(Number);
};

const getNextAvailablePositionKey = (positionMap) => {
    let currentKeyCandidate = 0;
    while (positionMap.hasOwnProperty(currentKeyCandidate)) {
        currentKeyCandidate++;
    }
    return currentKeyCandidate;
};

function processRelativePositions(rawInputData) {
    let entityPositions = {};
    let consistencyStatus = true;

    const allInputLines = rawInputData.split('\n');
    let pendingRelationLines = allInputLines.slice(1);

    let currentIterationLines = [];
    let deferredRelationLines = [];

    while (pendingRelationLines.length > 0 && consistencyStatus) {
        currentIterationLines = pendingRelationLines;
        deferredRelationLines = [];

        for (let i = 0; i < currentIterationLines.length; i++) {
            const currentRelationLine = currentIterationLines[i];
            const [memberIdentifierA, memberIdentifierB, positionDifference] = parseRelationString(currentRelationLine);

            const positionOfA = entityPositions[memberIdentifierA];
            const positionOfB = entityPositions[memberIdentifierB];

            if (positionOfA !== undefined && positionOfB !== undefined) {
                if ((positionOfB - positionOfA) !== positionDifference) {
                    consistencyStatus = false;
                    break;
                }
            }
            else if (positionOfA !== undefined) {
                entityPositions[memberIdentifierB] = positionOfA + positionDifference;
            }
            else if (positionOfB !== undefined) {
                entityPositions[memberIdentifierA] = positionOfB - positionDifference;
            }
            else {
                if (i === 0) {
                    const newBaselineKey = getNextAvailablePositionKey(entityPositions);
                    entityPositions[memberIdentifierA] = newBaselineKey;
                    entityPositions[memberIdentifierB] = entityPositions[memberIdentifierA] + positionDifference;
                } else {
                    deferredRelationLines.push(currentRelationLine);
                }
            }
        }

        if (!consistencyStatus) {
            break;
        }

        pendingRelationLines = deferredRelationLines;
    }

    console.log(consistencyStatus ? 'Yes' : 'No');
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const inputDataEncoding = 'utf8';

processRelativePositions(fileSystemModule.readFileSync(standardInputFilePath, inputDataEncoding));
