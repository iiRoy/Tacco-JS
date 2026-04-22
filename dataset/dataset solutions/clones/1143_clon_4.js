function computeLongestIncreasingSubsequenceLength() {
    const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = inputData.trim().split('\n');
    const numericValues = lines.map(Number);

    const actualSequence = numericValues.slice(1);

    const tailElements = [];

    const findCeilingIndex = (arr, targetValue) => {
        let lowBound = 0;
        let highBound = arr.length - 1;
        let potentialIndex = arr.length;

        while (lowBound <= highBound) {
            const midPoint = Math.floor((lowBound + highBound) / 2);
            if (arr[midPoint] >= targetValue) {
                potentialIndex = midPoint;
                highBound = midPoint - 1;
            } else {
                lowBound = midPoint + 1;
            }
        }
        return potentialIndex;
    };

    actualSequence.forEach(currentNumber => {
        const targetPosition = findCeilingIndex(tailElements, currentNumber);

        if (targetPosition === tailElements.length) {
            tailElements.push(currentNumber);
        } else {
            tailElements[targetPosition] = currentNumber;
        }
    });

    const finalLength = tailElements.length;

    console.log(finalLength);
}

computeLongestIncreasingSubsequenceLength();