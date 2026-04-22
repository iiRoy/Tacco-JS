const { readFileSync: retrieveFileContent } = require('fs');
const entireInputContent = retrieveFileContent('/dev/stdin', 'utf8');
const processedInputLines = entireInputContent.trim().split('\n');

function manageSingleScenario(scenarioSpecificLines) {
    let [totalSpaces, operationCount] = scenarioSpecificLines.shift().split(' ').map(Number);

    if (totalSpaces === 0 && operationCount === 0) {
        return null;
    }

    let currentSpaceOccupancy = Array(totalSpaces).fill(null);

    const performPlacementA = (spaceStatus) => {
        const firstEmptySlot = spaceStatus.findIndex(s => s === null);
        if (firstEmptySlot !== -1) {
            spaceStatus[firstEmptySlot] = 'A';
        }
        return spaceStatus;
    };

    const performPlacementB = (spaceStatus) => {
        let successfullyPlaced = false;
        for (let position = spaceStatus.length - 1; position >= 0; position--) {
            if (spaceStatus[position] === null) {
                const leftAdjacent = position > 0 ? spaceStatus[position - 1] : 'BOUNDARY';
                const rightAdjacent = position < spaceStatus.length - 1 ? spaceStatus[position + 1] : 'BOUNDARY';
                if (leftAdjacent !== 'A' && rightAdjacent !== 'A') {
                    spaceStatus[position] = 'B';
                    successfullyPlaced = true;
                    break;
                }
            }
        }
        if (!successfullyPlaced) {
            const firstEmptySlot = spaceStatus.findIndex(s => s === null);
            if (firstEmptySlot !== -1) {
                spaceStatus[firstEmptySlot] = 'B';
            }
        }
        return spaceStatus;
    };

    const performPlacementC = (spaceStatus) => {
        let successfullyPlaced = false;
        for (let position = 0; position < spaceStatus.length; position++) {
            if (spaceStatus[position] !== null) {
                if (position + 1 < spaceStatus.length && spaceStatus[position + 1] === null) {
                    spaceStatus[position + 1] = 'C';
                    successfullyPlaced = true;
                    break;
                } else if (position - 1 >= 0 && spaceStatus[position - 1] === null) {
                    spaceStatus[position - 1] = 'C';
                    successfullyPlaced = true;
                    break;
                }
            }
        }
        if (!successfullyPlaced) {
            if (spaceStatus.length > 0) {
                const centralIndex = Math.floor(spaceStatus.length / 2);
                spaceStatus[centralIndex] = 'C';
            }
        }
        return spaceStatus;
    };

    const performPlacementD = (spaceStatus) => {
        let optimalPosition = -1;
        let greatestSpreadValue = -1;

        for (let position = 0; position < spaceStatus.length; position++) {
            if (spaceStatus[position] === null) {
                let leftObstacleLocation = -1;
                for (let scanLeft = position - 1; scanLeft >= -1; scanLeft--) {
                    if (scanLeft === -1 || spaceStatus[scanLeft] !== null) {
                        leftObstacleLocation = scanLeft;
                        break;
                    }
                }

                let rightObstacleLocation = spaceStatus.length;
                for (let scanRight = position + 1; scanRight <= spaceStatus.length; scanRight++) {
                    if (scanRight === spaceStatus.length || spaceStatus[scanRight] !== null) {
                        rightObstacleLocation = scanRight;
                        break;
                    }
                }

                const distanceToLeft = position - leftObstacleLocation;
                const distanceToRight = rightObstacleLocation - position;
                
                const currentCalculatedSpread = Math.max(distanceToLeft, distanceToRight) - 1;

                if (currentCalculatedSpread > greatestSpreadValue) {
                    greatestSpreadValue = currentCalculatedSpread;
                    optimalPosition = position;
                }
            }
        }

        if (optimalPosition !== -1) {
            spaceStatus[optimalPosition] = 'D';
        } else {
            const firstEmptySlot = spaceStatus.findIndex(s => s === null);
            if (firstEmptySlot !== -1) {
                spaceStatus[firstEmptySlot] = 'D';
            }
        }
        return spaceStatus;
    };

    const actionDispatch = new Map([
        ['A', performPlacementA],
        ['B', performPlacementB],
        ['C', performPlacementC],
        ['D', performPlacementD]
    ]);

    for (let opIndex = 0; opIndex < operationCount; opIndex++) {
        const operationKey = scenarioSpecificLines.shift();
        const operationHandler = actionDispatch.get(operationKey);
        if (operationHandler) {
            currentSpaceOccupancy = operationHandler(currentSpaceOccupancy);
        }
    }

    return currentSpaceOccupancy.map(s => s === null ? '#' : s).join('');
}

const collectedOutputs = [];
let lineReadCursor = 0;

function processAllInput(allLines) {
    while (lineReadCursor < allLines.length) {
        const currentScenarioData = [];
        const headerLine = allLines[lineReadCursor];
        const [nValue, mValue] = headerLine.split(' ').map(Number);
        currentScenarioData.push(headerLine);
        lineReadCursor++;

        if (nValue === 0 && mValue === 0) {
            break;
        }

        for (let i = 0; i < mValue; i++) {
            currentScenarioData.push(allLines[lineReadCursor]);
            lineReadCursor++;
        }

        const caseResult = manageSingleScenario(currentScenarioData);
        if (caseResult !== null) {
            collectedOutputs.push(caseResult);
        }
    }
    return collectedOutputs;
}

const finalResults = processAllInput(processedInputLines);
finalResults.forEach(res => console.log(res));