function obtainSmallest(...values) {
    return Math.min(...values);
}

function calculateEditDistance(firstInput, secondInput) {
    const memoryCache = new Map();

    function computeSubproblem(currentLengthA, currentLengthB) {
        const stateIdentifier = `${currentLengthA},${currentLengthB}`;

        if (memoryCache.has(stateIdentifier)) {
            return memoryCache.get(stateIdentifier);
        }

        if (currentLengthA === 0) {
            memoryCache.set(stateIdentifier, currentLengthB);
            return currentLengthB;
        }
        if (currentLengthB === 0) {
            memoryCache.set(stateIdentifier, currentLengthA);
            return currentLengthA;
        }

        let operationCost;
        if (firstInput.charAt(currentLengthA - 1) === secondInput.charAt(currentLengthB - 1)) {
            operationCost = computeSubproblem(currentLengthA - 1, currentLengthB - 1);
        } else {
            const costOfDeletion = 1 + computeSubproblem(currentLengthA - 1, currentLengthB);
            const costOfInsertion = 1 + computeSubproblem(currentLengthA, currentLengthB - 1);
            const costOfSubstitution = 1 + computeSubproblem(currentLengthA - 1, currentLengthB - 1);
            
            operationCost = obtainSmallest(costOfDeletion, costOfInsertion, costOfSubstitution);
        }

        memoryCache.set(stateIdentifier, operationCost);
        return operationCost;
    }

    return computeSubproblem(firstInput.length, secondInput.length);
}

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineContents = sourceData.split('\n');

console.log(calculateEditDistance(lineContents[0], lineContents[1]));