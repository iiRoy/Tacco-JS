const processSweetAllocation = (rawInputContent) => {
    const inputLines = rawInputContent.split('\n');

    const [personCountString, candyLimitString] = inputLines[0].split(' ');
    const availableSweets = Number(candyLimitString);

    const demandStrings = inputLines[1].split(' ');
    const parsedDemands = demandStrings.map(Number);

    const sortedDemands = parsedDemands.slice().sort((a, b) => a - b);

    const distributionResult = sortedDemands.reduce((accumulatedState, currentDemand) => {
        if (accumulatedState.remainingSweets >= currentDemand) {
            return {
                satisfiedFolks: accumulatedState.satisfiedFolks + 1,
                remainingSweets: accumulatedState.remainingSweets - currentDemand
            };
        } else {
            return accumulatedState;
        }
    }, { satisfiedFolks: 0, remainingSweets: availableSweets });

    return distributionResult.satisfiedFolks;
};

const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalTally = processSweetAllocation(inputContent);
console.log(finalTally);
