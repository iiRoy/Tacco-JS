function performCalculation(inputString) {
    const numericParameters = inputString.trim().split(/\s+/).map(Number);
    const initialCoordinate = numericParameters[0];
    const totalDisplacements = numericParameters[1];
    const displacementMagnitude = numericParameters[2];

    const absoluteCoordinate = Math.abs(initialCoordinate);
    const displacementsTowardOrigin = Math.floor(absoluteCoordinate / displacementMagnitude);
    const distanceAfterOptimalDisplacements = absoluteCoordinate % displacementMagnitude;

    const isWithinOptimalRangeFlag = (totalDisplacements <= displacementsTowardOrigin) ? 1 : 0;
    const isBeyondOptimalRangeFlag = 1 - isWithinOptimalRangeFlag;

    const resultIfWithinOptimalRange = absoluteCoordinate - totalDisplacements * displacementMagnitude;

    const remainingDisplacements = totalDisplacements - displacementsTowardOrigin;
    const parityIndicator = remainingDisplacements % 2;

    const resultIfBeyondOptimalRange = distanceAfterOptimalDisplacements + (displacementMagnitude - 2 * distanceAfterOptimalDisplacements) * parityIndicator;

    const finalOutcome = resultIfWithinOptimalRange * isWithinOptimalRangeFlag + resultIfBeyondOptimalRange * isBeyondOptimalRangeFlag;

    console.log(finalOutcome);
}

function processInputAndExecute(rawInput) {
    performCalculation(rawInput);
}

processInputAndExecute(require("fs").readFileSync("/dev/stdin", "utf8"));
