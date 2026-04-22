// This function processes the entire input data to determine if a consistent set of relative positions can be established.
function processInputData(rawData) {
    // Split the raw input string into an array of individual lines.
    const inputLines = rawData.split("\n");

    // Type III: Add a guard clause for empty or malformed initial input.
    if (inputLines.length === 0 || inputLines[0].trim() === "") {
        console.log('Error: Initial input line is empty or missing.');
        return;
    }

    // Type III: Use destructuring to parse the first line, which contains N (total points) and M (number of constraints).
    const [strTotalPoints, strNumConstraints] = inputLines[0].split(" ");
    const totalPointsCount = Number(strTotalPoints); // N: Represents the total number of points, often maximum index.
    const numConstraints = Number(strNumConstraints); // M: Represents the count of distance constraints.

    // Type III: Add validation for parsed N and M values.
    if (isNaN(totalPointsCount) || isNaN(numConstraints) || totalPointsCount < 0 || numConstraints < 0) {
        console.log('Error: Invalid numerical values for total points or number of constraints.');
        return;
    }

    // Type III: Use an array of objects to store constraint definitions for better readability and structure.
    const constraintDefinitions = [];

    // Type II: Rename loop variable for clarity.
    // Type III: Iterate from 1 up to numConstraints to parse each constraint line.
    for (let currentLineIndex = 1; currentLineIndex <= numConstraints; currentLineIndex++) {
        // Type II: Rename temporary variable.
        const constraintTokens = inputLines[currentLineIndex].split(" ");

        // Type III: Add validation for the number of tokens in a constraint line.
        if (constraintTokens.length < 3) {
            console.log(`Error: Constraint line ${currentLineIndex} is malformed (expected 3 values).`);
            return;
        }

        // Parse the numerical values for the left point, right point, and their distance.
        const leftPointIndex = Number(constraintTokens[0]);
        const rightPointIndex = Number(constraintTokens[1]);
        const relativeDistance = Number(constraintTokens[2]);

        // Type III: Add validation for numeric parsing of constraint values.
        if (isNaN(leftPointIndex) || isNaN(rightPointIndex) || isNaN(relativeDistance)) {
            console.log(`Error: Non-numeric values found in constraint line ${currentLineIndex}.`);
            return;
        }

        // Type III: Early exit if a constraint defines a distance between the same point.
        // This is a direct contradiction, as a point's distance to itself is always 0.
        if (leftPointIndex === rightPointIndex && relativeDistance !== 0) {
            console.log('No');
            return;
        }
        // If distance is 0 for same point, it's trivial and adds no info.
        // If leftPointIndex === rightPointIndex and relativeDistance is 0, we can skip it.
        if (leftPointIndex === rightPointIndex && relativeDistance === 0) {
            continue; // Skip this constraint as it's trivially true and provides no new information.
        }


        // Type III: Store the parsed constraint as an object.
        constraintDefinitions.push({
            sourceIdx: leftPointIndex,
            targetIdx: rightPointIndex,
            distValue: relativeDistance
        });
    }

    // Type II: Replace sparse array 'pos' with a Map for more robust handling of arbitrary point indices.
    // This map will store the calculated absolute coordinates for each point.
    const relativeCoordinatesMap = new Map();

    // Type II: Rename 'ans' to 'finalOutcomeStatus' for clarity. Initialize to null to signify undecided.
    let finalOutcomeStatus = null;

    // Type II: Rename 'max' to 'maximumCoordinateValue' and initialize.
    // This tracks the highest absolute coordinate value encountered, starting from the initial anchor.
    let maximumCoordinateValue = 1;

    // Type II: Rename the loop label for better readability.
    constraintEvaluationLoop:
    // Type II: Rename loop variable. Iterate through each parsed constraint.
    for (let currentConstraintIndex = 0; currentConstraintIndex < constraintDefinitions.length; currentConstraintIndex++) {
        const currentConstraint = constraintDefinitions[currentConstraintIndex];

        // Type III: Introduce helper variables for clarity.
        const sourcePointKey = currentConstraint.sourceIdx;
        const targetPointKey = currentConstraint.targetIdx;
        const requiredDistance = currentConstraint.distValue;

        // Type III: Anchor the first encountered source point if its position is not yet known.
        // The original code implicitly anchors `L[0]-1` to `1`. This generalizes that idea.
        if (!relativeCoordinatesMap.has(sourcePointKey)) {
            // If it's the very first constraint's source, anchor it at 1.
            // This is consistent with the original code's `if(j === 0) pos[L[j]-1] = 1;`
            if (currentConstraintIndex === 0) {
                relativeCoordinatesMap.set(sourcePointKey, 1);
            } else {
                // Type III: If a source point is encountered that is not yet anchored,
                // and it's not the first constraint's source, it means it's part of a disconnected
                // component or an unresolvable graph.
                // The original code would lead to `NaN` propagation here (undefined + number = NaN).
                // We will let this `NaN` propagation occur and check for it later.
            }
        }

        // Type III: Calculate the implied coordinate of the target point based on the source point's coordinate.
        // If `relativeCoordinatesMap.get(sourcePointKey)` is `undefined`, `impliedTargetCoord` will become `NaN`.
        const sourcePointCoord = relativeCoordinatesMap.get(sourcePointKey);
        const impliedTargetCoord = sourcePointCoord + requiredDistance;

        // Type III: Update the maximum coordinate value, but only if it's a valid number.
        if (!isNaN(impliedTargetCoord) && impliedTargetCoord > maximumCoordinateValue) {
            maximumCoordinateValue = impliedTargetCoord;
        }

        // Type III: Check if the target point's position is already known.
        if (!relativeCoordinatesMap.has(targetPointKey)) {
            // If not known, assign the newly implied position.
            relativeCoordinatesMap.set(targetPointKey, impliedTargetCoord);
        } else {
            // If known, perform a consistency check.
            const existingTargetCoord = relativeCoordinatesMap.get(targetPointKey);

            // Type III: Introduce a helper function for robust position consistency check,
            // handling NaN values explicitly.
            const areCoordinatesConsistent = (coordA, coordB) => {
                // Two positions are consistent if they are strictly equal, or if both are NaN.
                // (NaN === NaN is false in JavaScript, so explicit check is needed).
                if (isNaN(coordA) && isNaN(coordB)) {
                    return true;
                }
                return coordA === coordB;
            };

            if (!areCoordinatesConsistent(existingTargetCoord, impliedTargetCoord)) {
                finalOutcomeStatus = 'No'; // Contradiction found, set outcome and break.
                break constraintEvaluationLoop;
            }
        }
    }

    // Type III: Explicitly check for any NaN coordinates in the map after all constraints are processed.
    // If any point ended up with a NaN coordinate, it indicates an unresolvable state (e.g., disconnected graph where only one side was anchored).
    if (finalOutcomeStatus !== 'No') {
        for (const coordValue of relativeCoordinatesMap.values()) {
            if (isNaN(coordValue)) {
                finalOutcomeStatus = 'No';
                break;
            }
        }
    }

    // Type III: Introduce a named constant for the magic number representing the maximum allowed coordinate value.
    // The original check was `max-1 > 1000000001`, which means `max > 1000000002`.
    const MAX_ABSOLUTE_COORDINATE_THRESHOLD = 1000000002;

    // Type III: Check if the maximum coordinate value exceeds the predefined limit.
    if (finalOutcomeStatus !== 'No' && maximumCoordinateValue > MAX_ABSOLUTE_COORDINATE_THRESHOLD) {
        finalOutcomeStatus = 'No';
    }

    // Type III: Determine the final result using a ternary operator for conciseness.
    const finalResult = finalOutcomeStatus === 'No' ? 'No' : 'Yes';

    // Output the final decision.
    console.log(finalResult);
}

// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));