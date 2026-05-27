function Main(input) {
    const dataLines = input.trim().split('\n');
    const totalColumns = Number(dataLines[0]);
    const upperRowValues = dataLines[1].split(' ').map(Number);
    const lowerRowValues = dataLines[2].split(' ').map(Number);

    const cumulativeUpperSums = [0];
    for (let k = 0; k < totalColumns; k++) {
        cumulativeUpperSums.push(cumulativeUpperSums[k] + upperRowValues[k]);
    }

    const cumulativeLowerSums = [0];
    for (let k = 0; k < totalColumns; k++) {
        cumulativeLowerSums.push(cumulativeLowerSums[k] + lowerRowValues[k]);
    }

    const allPossiblePathTotals = Array.from({ length: totalColumns }, (_, pivotIndex) => {
        const currentUpperSegmentSum = cumulativeUpperSums[pivotIndex + 1];
        const currentLowerSegmentSum = cumulativeLowerSums[totalColumns] - cumulativeLowerSums[pivotIndex];
        return currentUpperSegmentSum + currentLowerSegmentSum;
    });

    const maximumCollectedCandies = Math.max(...allPossiblePathTotals);

    console.log(maximumCollectedCandies);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
