function executeRobotTraversal(externalInputSignal) {
    // Type III: The original code parses input but immediately overwrites the 'z' variable.
    // This input parsing is effectively dead code for the core logic of the original script.
    // Therefore, we remove the input processing for the fixed rotation rate.
    // externalInputSignal = externalInputSignal.split("\n"); // Removed as it's not used
    // let parsedRotationRate = parseInt(externalInputSignal[0], 10); // Removed as it's not used

    // Type II: Rename 'z' to 'rotationRateDegrees'.
    // Type III: Declare as a constant, reflecting its immutable nature within this simulation.
    const rotationRateDegrees = 90; // The fixed angle (in degrees) by which the robot turns after each step.

    // Type II: Rename 'x' and 'y' to more descriptive variable names.
    // Type III: Use 'let' for variables whose values are intended to change during execution.
    let currentHorizontalCoordinate = 0; // Represents the robot's X-position on a 2D plane.
    let currentVerticalCoordinate = 0;   // Represents the robot's Y-position on a 2D plane.

    // Type III: The 'coordinate' object was declared but never utilized in the original code,
    // making it a candidate for deletion to streamline the code.
    // var coordinate = {x: 0, y: 0}; // Deleted

    // Type II: Rename 'direction' to 'robotHeadingDegrees'.
    // Type III: Initialize with a clear comment explaining the initial state.
    let robotHeadingDegrees = 90; // Initial heading: 90 degrees. Based on the original movement logic (90=Y+, 180=X+, etc.),
                                  // this corresponds to facing "North" where positive Y is North, positive X is East.

    // Type II: Rename 'count' to 'totalTraversalSteps'.
    let totalTraversalSteps = 0; // A counter to track the total number of steps the robot takes.

    // Type III: Add a helper function to normalize the robot's heading.
    // This ensures the angle stays within a standard 0-359 degree range,
    // which simplifies lookup logic and prevents angles from growing indefinitely.
    const normalizeAngle = (angleValue) => {
        let normalized = angleValue % 360;
        return normalized < 0 ? normalized + 360 : normalized; // Ensure positive angle
    };

    // Type III: Replace the original `switch` statement for movement with a more structured
    // lookup object. This makes the movement logic explicit and potentially more extensible.
    // Each key represents a normalized heading, and its value is an object containing
    // the change in X (dx) and Y (dy) coordinates for one step.
    const movementDeltas = {
        90:  { dx: 0, dy: 1 },  // When heading North (90 degrees), Y increases.
        180: { dx: 1, dy: 0 },  // When heading East (180 degrees), X increases.
        270: { dx: 0, dy: -1 }, // When heading South (270 degrees), Y decreases.
        0:   { dx: -1, dy: 0 }  // When heading West (0 degrees, which 360 normalizes to), X decreases.
    };

    // Type III: Change the `while(true)` loop to a `do...while` loop.
    // This structure explicitly states that the loop body will execute at least once
    // before checking the termination condition, fitting the "move then check" pattern.
    do {
        // Type II: Increment the step counter for each iteration.
        totalTraversalSteps++;

        // Type III: Retrieve the corresponding movement vector based on the robot's current heading.
        const currentStepDelta = movementDeltas[robotHeadingDegrees];

        // Type III: Add a guard clause to handle unexpected or invalid robot headings.
        // This adds robustness, preventing potential errors if the heading logic were to deviate.
        if (!currentStepDelta) {
            console.error(`Simulation Error: Robot encountered an unhandled heading of ${robotHeadingDegrees} degrees.`);
            break; // Terminate the simulation if an invalid state is reached.
        }

        // Type II & III: Update the robot's position by adding the delta values.
        currentHorizontalCoordinate += currentStepDelta.dx;
        currentVerticalCoordinate += currentStepDelta.dy;

        // Type II & III: Update the robot's heading by adding the predefined rotation rate.
        // Immediately normalize the new heading to keep it within the expected range (0-359 degrees).
        robotHeadingDegrees += rotationRateDegrees;
        robotHeadingDegrees = normalizeAngle(robotHeadingDegrees);

        // Type II: Check if the robot has returned to its starting point (0,0).
        // Type III: Use explicit comparisons (`!==`) to ensure clarity in the loop condition.
    } while (currentHorizontalCoordinate !== 0 || currentVerticalCoordinate !== 0); // Continue looping until both coordinates are zero.

    // Type II: Output the final count of steps taken.
    console.log(totalTraversalSteps);
}

// Type II & III: Adjust the function call to reflect the new name.
// The original code reads from standard input; this structure is maintained to
// preserve the original execution environment, even though the input content
// is no longer directly used by the cloned logic.
executeRobotTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));