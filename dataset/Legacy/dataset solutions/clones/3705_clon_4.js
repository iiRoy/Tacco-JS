function Main(input) {
    const lines = input.split('\n');
    const elementCount = parseInt(lines[0]);
    const sourceValues = lines[1].split(' ').map(Number);

    let currentSum = 0;
    const cumulativeSums = sourceValues.map(val => {
        currentSum += val;
        return currentSum;
    });

    let minOverallDifference = Infinity;

    let leftSplitPoint = 1;
    let rightSplitPoint = elementCount - 1;

    for (let middleSplitPoint = 2; middleSplitPoint <= elementCount - 2; middleSplitPoint++) {
        while (leftSplitPoint + 1 < middleSplitPoint) {
            const currentLeftPart1 = cumulativeSums[leftSplitPoint - 1];
            const currentLeftPart2 = cumulativeSums[middleSplitPoint - 1] - cumulativeSums[leftSplitPoint - 1];
            const currentLeftDiff = Math.abs(currentLeftPart1 - currentLeftPart2);

            const nextLeftPart1 = cumulativeSums[leftSplitPoint];
            const nextLeftPart2 = cumulativeSums[middleSplitPoint - 1] - cumulativeSums[leftSplitPoint];
            const nextLeftDiff = Math.abs(nextLeftPart1 - nextLeftPart2);

            if (nextLeftDiff <= currentLeftDiff) {
                leftSplitPoint++;
            } else {
                break;
            }
        }

        while (rightSplitPoint - 1 > middleSplitPoint) {
            const currentRightPart1 = cumulativeSums[rightSplitPoint - 1] - cumulativeSums[middleSplitPoint - 1];
            const currentRightPart2 = cumulativeSums[elementCount - 1] - cumulativeSums[rightSplitPoint - 1];
            const currentRightDiff = Math.abs(currentRightPart1 - currentRightPart2);

            const prevRightPart1 = cumulativeSums[rightSplitPoint - 2] - cumulativeSums[middleSplitPoint - 1];
            const prevRightPart2 = cumulativeSums[elementCount - 1] - cumulativeSums[rightSplitPoint - 2];
            const prevRightDiff = Math.abs(prevRightPart1 - prevRightPart2);

            if (prevRightDiff <= currentRightDiff) {
                rightSplitPoint--;
            } else {
                break;
            }
        }

        const sumP = cumulativeSums[leftSplitPoint - 1];
        const sumQ = cumulativeSums[middleSplitPoint - 1] - cumulativeSums[leftSplitPoint - 1];
        const sumR = cumulativeSums[rightSplitPoint - 1] - cumulativeSums[middleSplitPoint - 1];
        const sumS = cumulativeSums[elementCount - 1] - cumulativeSums[rightSplitPoint - 1];

        const currentMax = Math.max(sumP, sumQ, sumR, sumS);
        const currentMin = Math.min(sumP, sumQ, sumR, sumS);
        const currentDifference = currentMax - currentMin;

        if (currentDifference < minOverallDifference) {
            minOverallDifference = currentDifference;
        }
    }

    console.log(minOverallDifference);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
