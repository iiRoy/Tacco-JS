"use strict";
function calculatePattyCount(burgerDepth, targetPosition) {
    let currentPattyAccumulator = 0;
    let currentDepth = burgerDepth;
    let remainingPosition = targetPosition;

    while (currentDepth >= 0) {
        if (currentDepth === 0) {
            if (remainingPosition >= 1) {
                currentPattyAccumulator += 1;
            }
            break;
        }

        const lowerLevelTotalLength = (1 << (currentDepth + 1)) - 3;
        const lowerLevelPattyTotal = (1 << currentDepth) - 1;

        if (remainingPosition <= 1) {
            break;
        }

        if (remainingPosition <= 1 + lowerLevelTotalLength) {
            remainingPosition -= 1;
            currentDepth -= 1;
            continue;
        }

        currentPattyAccumulator += lowerLevelPattyTotal;
        currentPattyAccumulator += 1;

        if (remainingPosition <= 1 + lowerLevelTotalLength + 1) {
            break;
        }

        remainingPosition -= (1 + lowerLevelTotalLength + 1);
        currentDepth -= 1;
    }

    return currentPattyAccumulator;
}

function initiateProcess(inputDataSource) {
    const lines = inputDataSource.split("\n");
    const firstLineParts = lines[0].split(" ");

    const burgerStructureDepth = parseInt(firstLineParts[0], 10);
    const consumptionPoint = parseInt(firstLineParts[1], 10);

    const finalPattyTally = calculatePattyCount(burgerStructureDepth, consumptionPoint);

    console.log(finalPattyTally);
}

initiateProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));