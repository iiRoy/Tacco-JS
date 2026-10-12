// This function receives the complete raw input data as a string.
function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    var inputLines = rawData.split('\n');

    // Parse the first line to get the number of entities (N) and constraints (M).
    var firstLineParts = inputLines[0].split(' ');
    var numEntities = Number(firstLineParts[0]);
    var numConstraints = Number(firstLineParts[1]);

    // Initialize arrays to store the left points, right points, and distances for each constraint.
    var leftPoints = [];
    var rightPoints = [];
    var pointDistances = [];

    // Iterate through each constraint line, starting from the second line (index 1).
    for (var constraintIndex = 1; constraintIndex <= numConstraints; constraintIndex++) {
        var currentConstraintParts = inputLines[constraintIndex].split(' ');

        // Convert string parts to numbers and store them in their respective arrays.
        leftPoints.push(Number(currentConstraintParts[0]));
        rightPoints.push(Number(currentConstraintParts[1]));
        pointDistances.push(Number(currentConstraintParts[2]));

        // Check for an invalid constraint where left and right points are the same.
        if (Number(currentConstraintParts[0]) === Number(currentConstraintParts[1])) {
            console.log('No'); // Output 'No' if an invalid constraint is found.
            return false;       // Terminate execution.
        }
    }

    // Initialize an array to store the calculated positions of entities.
    var entityCoordinates = [];
    // Variable to store the final result ('Yes' or 'No').
    var finalResult;
    // Track the maximum coordinate value encountered to check against a limit.
    var highestCoordinate = 1;

    // Loop through each constraint to determine entity positions.
    constraintEvaluationLoop: for (var currentConstraint = 0; currentConstraint < numConstraints; currentConstraint++) {
        // For the very first constraint, set the position of its left point to 1.
        if (currentConstraint === 0) {
            entityCoordinates[leftPoints[currentConstraint] - 1] = 1;
        }

        // Calculate the expected position of the right point based on the left point's position and the distance.
        var calculatedRightCoordinate = entityCoordinates[leftPoints[currentConstraint] - 1] + pointDistances[currentConstraint];

        // Update the highest coordinate value if the current calculated position is greater.
        if (highestCoordinate <= calculatedRightCoordinate) {
            highestCoordinate = calculatedRightCoordinate;
        }

        // If the right point's position hasn't been set yet, assign the calculated position.
        if (!entityCoordinates[rightPoints[currentConstraint] - 1]) {
            entityCoordinates[rightPoints[currentConstraint] - 1] = calculatedRightCoordinate;
        } else {
            // If the right point's position has already been set, check for consistency.
            if (entityCoordinates[rightPoints[currentConstraint] - 1] !== calculatedRightCoordinate) {
                // If inconsistent, set the result to 'No' and break out of the loop.
                finalResult = 'No';
                break constraintEvaluationLoop;
            }
        }
    }

    // After processing all constraints, check if the maximum coordinate exceeds a predefined limit.
    if (highestCoordinate - 1 > 1000000001) {
        finalResult = 'No';
    }

    // If no inconsistencies were found and the max coordinate is within limits, the result is 'Yes'.
    if (!finalResult) {
        finalResult = 'Yes';
    }

    // Output the final determination.
    console.log(finalResult);
}

// The following section handles standard input/output operations and invokes the primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
