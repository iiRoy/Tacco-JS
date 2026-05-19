function calculateConsumedA(inputString) {
    const [totalUnits, segmentA, segmentB] = inputString.split(" ").map(Number);

    const cycleTotal = segmentA + segmentB;
    const fullCycles = Math.floor(totalUnits / cycleTotal);
    const remainingUnits = totalUnits % cycleTotal;

    const contributionFromFullCycles = fullCycles * segmentA;
    const contributionFromRemainder = Math.min(remainingUnits, segmentA);

    const finalCount = contributionFromFullCycles + contributionFromRemainder;

    console.log(finalCount);
}
calculateConsumedA(require("fs").readFileSync("/dev/stdin", "utf8"));
