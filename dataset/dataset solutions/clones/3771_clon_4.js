'use strict';
console.log((function(sourceData) {
    const desiredValue = parseInt(sourceData.trim(), 10);

    if (desiredValue === 0) {
        return '0';
    }

    const availableAmounts = [1];
    let multiplierSix = 6;
    while (multiplierSix <= desiredValue) {
        availableAmounts.push(multiplierSix);
        if (multiplierSix > desiredValue / 6) break;
        multiplierSix *= 6;
    }

    let multiplierNine = 9;
    while (multiplierNine <= desiredValue) {
        availableAmounts.push(multiplierNine);
        if (multiplierNine > desiredValue / 9) break;
        multiplierNine *= 9;
    }

    const cheapestPath = new Array(desiredValue + 1).fill(Number.MAX_SAFE_INTEGER);
    cheapestPath[0] = 0;

    const stateQueue = [[0, 0]];
    let queueIndex = 0;

    while (queueIndex < stateQueue.length) {
        const [currentNumber, currentOperations] = stateQueue[queueIndex++];

        if (currentOperations > cheapestPath[currentNumber]) {
            continue;
        }

        for (const amountToAdd of availableAmounts) {
            const nextNumber = currentNumber + amountToAdd;

            if (nextNumber <= desiredValue) {
                if (cheapestPath[nextNumber] > currentOperations + 1) {
                    cheapestPath[nextNumber] = currentOperations + 1;
                    stateQueue.push([nextNumber, currentOperations + 1]);
                }
            }
        }
    }

    return cheapestPath[desiredValue].toString();

})(require('fs').readFileSync('/dev/stdin', 'utf8')));