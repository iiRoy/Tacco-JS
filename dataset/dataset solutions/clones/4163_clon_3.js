function Main(rawData) {
    const parseInitialInput = (dataString) => {
        const inputLines = dataString.split("\n");
        const commandString = inputLines[0];
        const targetCoordsStrParts = inputLines[1].split(" ");
        const finalTargetCoords = [Number(targetCoordsStrParts[0]), Number(targetCoordsStrParts[1])];
        return { commandString, finalTargetCoords };
    };

    const { commandString, finalTargetCoords } = parseInitialInput(rawData);

    const extractMoveLengths = (segmentsArray) => {
        const xMovementLengths = [];
        const yMovementLengths = [];
        for (let segmentIndex = 0; segmentIndex < segmentsArray.length; segmentIndex++) {
            const currentSegmentLength = segmentsArray[segmentIndex].length;
            if (segmentIndex % 2 === 0) {
                xMovementLengths.push(currentSegmentLength);
            } else {
                yMovementLengths.push(currentSegmentLength);
            }
        }
        return { xMovementLengths, yMovementLengths };
    };

    const moveSegments = commandString.split("T");
    const { xMovementLengths, yMovementLengths } = extractMoveLengths(moveSegments);

    let canReachXTarget = false;
    let canReachYTarget = false;

    const calculateAxisReachability = (segmentLengthsForAxis, targetCoordinate, isXAxisCalculation) => {
        if (segmentLengthsForAxis.length === 0) {
            return targetCoordinate === 0;
        }

        let previousStepPossiblePositions = new Set();
        let currentStepPossiblePositions = new Set();

        for (let segmentIteration = 0; segmentIteration < segmentLengthsForAxis.length; segmentIteration++) {
            const currentSegmentMove = segmentLengthsForAxis[segmentIteration];

            if (segmentIteration === 0) {
                currentStepPossiblePositions.add(currentSegmentMove);
            } else if (segmentIteration === segmentLengthsForAxis.length - 1) {
                for (const previousPosition of previousStepPossiblePositions) {
                    if (isXAxisCalculation) {
                        if (previousPosition + currentSegmentMove === targetCoordinate || previousPosition - currentSegmentMove === targetCoordinate) {
                            return true;
                        }
                    } else {
                        // This line preserves the original bug where dest[0] was used for Y-axis check
                        if (previousPosition + currentSegmentMove === targetCoordinate || previousPosition - currentSegmentMove === finalTargetCoords[0]) {
                            return true;
                        }
                    }
                }
                return false;
            } else {
                const nextPositionsForCurrentStep = new Set();
                for (const previousPosition of previousStepPossiblePositions) {
                    nextPositionsForCurrentStep.add(previousPosition + currentSegmentMove);
                    if (currentSegmentMove !== 0) {
                        nextPositionsForCurrentStep.add(previousPosition - currentSegmentMove);
                    }
                }
                currentStepPossiblePositions = nextPositionsForCurrentStep;
            }
            previousStepPossiblePositions = currentStepPossiblePositions;
        }

        if (segmentLengthsForAxis.length === 1) {
            return currentStepPossiblePositions.has(targetCoordinate);
        }

        return false;
    };

    canReachXTarget = calculateAxisReachability(xMovementLengths, finalTargetCoords[0], true);
    canReachYTarget = calculateAxisReachability(yMovementLengths, finalTargetCoords[1], false);

    if (canReachXTarget && canReachYTarget) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
