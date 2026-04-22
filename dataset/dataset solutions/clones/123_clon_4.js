const tallyOfCombinations = Array(11).fill(null).map(() => Array(46).fill(0));
tallyOfCombinations[0][0] = 1;

for (let digitValueToConsider = 0; digitValueToConsider <= 9; digitValueToConsider++) {
    for (let countOfItems = 10; countOfItems >= 1; countOfItems--) {
        for (let currentTotalSum = 45; currentTotalSum >= digitValueToConsider; currentTotalSum--) {
            tallyOfCombinations[countOfItems][currentTotalSum] += tallyOfCombinations[countOfItems - 1][currentTotalSum - digitValueToConsider];
        }
    }
}

function handleInputAndProduceResults(entireInputString) {
    entireInputString.trim().split('\n').forEach(function(singleLineInput) {
        const numericalParts = singleLineInput.split(' ');
        const desiredItemCount = parseInt(numericalParts[0], 10);
        const requiredTotal = parseInt(numericalParts[1], 10);

        if (desiredItemCount === 0 && requiredTotal === 0) {
            return;
        }

        console.log(tallyOfCombinations[desiredItemCount][requiredTotal]);
    });
}

let collectedRawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (incomingChunk) => {
    collectedRawData += incomingChunk;
});
process.stdin.on('end', () => {
    handleInputAndProduceResults(collectedRawData);
});