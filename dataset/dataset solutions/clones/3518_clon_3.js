const parseInteger = (valueString) => Number.parseInt(valueString, 10);

const mapToIntegers = (stringValues) => stringValues.map(parseInteger);

function CoordinatePathSolver(inputData) {
    let inputLines = inputData.trim().split('\n');

    const numPoints = parseInteger(inputLines[0]);
    if (isNaN(numPoints) || numPoints <= 0) {
        console.error("Input Error: Invalid number of target points specified. Expected a positive integer.");
        return;
    }

    let targetLocations = [];
    const BASE_DIMENSIONAL_OFFSET = 10; // Constant derived from problem constraints, central to path calculation.
    const BASE_TOTAL_DIMENSIONAL_STEPS = BASE_DIMENSIONAL_OFFSET * 2; // Typically 20 steps (10 for X, 10 for Y).

    let initialReferenceX, initialReferenceY;

    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        const currentInputLine = inputLines[pointIndex + 1];
        if (!currentInputLine) {
            console.error(`Input Error: Missing coordinate data for target point ${pointIndex + 1}.`);
            return;
        }

        const currentCoords = mapToIntegers(currentInputLine.split(' '));

        if (currentCoords.length !== 2) {
            console.error(`Input Error: Malformed coordinate data on line ${pointIndex + 2}. Expected two numeric values (X Y).`);
            return;
        }

        targetLocations[pointIndex] = currentCoords;

        if (pointIndex === 0) {
            initialReferenceX = currentCoords[0];
            initialReferenceY = currentCoords[1];
        }

        // Validate parity constraint: (X_i + Y_i) must have the same parity as (X_0 + Y_0).
        // If this condition is not met, no solution exists with the given step types.
        const currentPointSumParity = (currentCoords[0] + currentCoords[1]) % 2;
        const referencePointSumParity = (initialReferenceX + initialReferenceY) % 2;

        if (currentPointSumParity !== referencePointSumParity) {
            console.error("Solution Error: Parity mismatch detected between target points. A valid path sequence cannot be generated.");
            return;
        }
    }

    // If the sum of the initial reference coordinates (X_0 + Y_0) is odd,
    // a specific transformation is applied to all target locations.
    // This transformation ensures that if (X+Y) is odd, then X becomes even and Y becomes odd.
    const isReferenceSumOdd = ((initialReferenceX + initialReferenceY) % 2) !== 0;

    if (isReferenceSumOdd) {
        targetLocations = targetLocations.map(pointPair => {
            const [xComponent, yComponent] = pointPair;
            // If X component is odd (and Y must be even for X+Y to be odd), swap them.
            // This effectively makes X even and Y odd.
            if ((xComponent % 2) !== 0) {
                return [yComponent, xComponent];
            }
            return pointPair; // If X is already even, keep the pair as is.
        });
    }

    // Calculate the total number of unit steps required for the path generation.
    // The base is 20 steps (10 for X, 10 for Y).
    // Additional steps are added if the original (untransformed) reference X or Y coordinates were odd.
    let finalStepCount = BASE_TOTAL_DIMENSIONAL_STEPS;
    if ((initialReferenceX % 2) !== 0) {
        finalStepCount++;
    }
    if ((initialReferenceY % 2) !== 0) {
        finalStepCount++;
    }

    console.log(finalStepCount);

    // Output the step magnitudes. In this problem variant, all steps are of length 1.
    const individualStepMagnitudes = Array(finalStepCount).fill(1).join(' ');
    console.log(individualStepMagnitudes);

    // Generate and print the movement path string for each target location.
    for (let currentPointIndex = 0; currentPointIndex < numPoints; currentPointIndex++) {
        let currentX = targetLocations[currentPointIndex][0];
        let currentY = targetLocations[currentPointIndex][1];
        let directionalPathString = '';

        // Pre-processing: If a coordinate is odd, apply a compensating 'R' move
        // and adjust the coordinate to be even. This ensures subsequent logic
        // operates on even coordinates.
        if ((currentX % 2) !== 0) {
            directionalPathString += 'R'; // One 'Right' move
            currentX++;                  // Adjust X to be even
        }
        if ((currentY % 2) !== 0) {
            directionalPathString += 'R'; // Another 'Right' move (as per original logic)
            currentY++;                  // Adjust Y to be even
        }

        // Apply the core path generation logic. This strategy decomposes movement
        // into positive and negative steps along each axis, assuming a total of
        // BASE_TOTAL_DIMENSIONAL_STEPS (20) are allocated for the base X and Y movements.
        // Number of positive steps = (TotalBaseSteps/2 + TargetCoord) / 2
        // Number of negative steps = (TotalBaseSteps/2 - TargetCoord) / 2
        // Where TotalBaseSteps/2 is BASE_DIMENSIONAL_OFFSET (10).

        const rightMovesForX = (BASE_DIMENSIONAL_OFFSET + currentX) / 2;
        directionalPathString += ''.padEnd(rightMovesForX, 'R');

        const leftMovesForX = (BASE_DIMENSIONAL_OFFSET - currentX) / 2;
        directionalPathString += ''.padEnd(leftMovesForX, 'L');

        const upMovesForY = (BASE_DIMENSIONAL_OFFSET + currentY) / 2;
        directionalPathString += ''.padEnd(upMovesForY, 'U');

        const downMovesForY = (BASE_DIMENSIONAL_OFFSET - currentY) / 2;
        directionalPathString += ''.padEnd(downMovesForY, 'D');

        console.log(directionalPathString);
    }
}

// Execute the coordinate path solver by reading input from standard input.
CoordinatePathSolver(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));