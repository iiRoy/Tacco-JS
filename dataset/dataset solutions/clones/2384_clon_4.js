const processInputValues = (sourceMaterial) => {
    const allNumericValues = sourceMaterial.match(/-?\d+/g).map(Number);

    const factorOneMagnitude = allNumericValues[0];
    const factorTwoMagnitude = allNumericValues[1];
    const initialPositionReferenceA = allNumericValues[2];
    const initialPositionReferenceB = allNumericValues[3];
    const finalPositionReferenceA = allNumericValues[4];
    const finalPositionReferenceB = allNumericValues[5];

    const contributionFromFirstPhase = factorOneMagnitude * (initialPositionReferenceA - finalPositionReferenceA);
    const contributionFromSecondPhase = factorTwoMagnitude * (initialPositionReferenceB - finalPositionReferenceB);

    const cumulativeValueAfterFirst = contributionFromFirstPhase;
    const cumulativeValueTotal = contributionFromFirstPhase + contributionFromSecondPhase;

    return Object.is(cumulativeValueTotal, 0)
        ? 'infinity'
        : (cumulativeValueAfterFirst * cumulativeValueTotal > 0)
            ? 0
            : (Number.isInteger(cumulativeValueAfterFirst / cumulativeValueTotal))
                ? (cumulativeValueAfterFirst / cumulativeValueTotal) * 2
                : (Math.floor(-(cumulativeValueAfterFirst / cumulativeValueTotal)) * 2 + 1);
};

console.log(processInputValues(require("fs").readFileSync("/dev/stdin", "utf8")));