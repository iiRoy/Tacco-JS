function Main(input) {
    const inputLines = input.split("\n");
    const elementCount = parseInt(inputLines[0], 10);
    const primaryValues = inputLines[1].split(" ").map(Number);
    const secondaryValues = inputLines[2].split(" ").map(Number);

    const {
        positiveDifferences,
        negativeSumTotal,
        initialNegativeItemCount
    } = Array.from({ length: elementCount }).reduce((collector, _, idx) => {
        const currentDelta = primaryValues[idx] - secondaryValues[idx];
        if (currentDelta > 0) {
            collector.positiveDifferences.push(currentDelta);
        } else {
            collector.negativeSumTotal += currentDelta;
            collector.initialNegativeItemCount++;
        }
        return collector;
    }, { positiveDifferences: [], negativeSumTotal: 0, initialNegativeItemCount: 0 });

    const deficitMagnitude = -negativeSumTotal;

    positiveDifferences.sort((valA, valB) => valB - valA);

    let finalResult = initialNegativeItemCount;

    if (deficitMagnitude === 0) {
        if (positiveDifferences.length > 0) {
            finalResult += 1;
        }
    } else {
        let currentCumulativeSum = 0;
        const cumulativeSurplusSeries = positiveDifferences.map((value) => {
            currentCumulativeSum += value;
            return currentCumulativeSum;
        });

        const coverageIndex = cumulativeSurplusSeries.findIndex(sumValue => sumValue >= deficitMagnitude);

        if (coverageIndex !== -1) {
            finalResult += (coverageIndex + 1);
        } else {
            finalResult = -1;
        }
    }

    console.log('%s', finalResult);
}

function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
