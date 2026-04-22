// This function processes raw input data to determine if one entity can intercept another within a given timeframe.
function AnalyzeMovementScenario(sourceData) {
    // The input data is expected to be a multi-line string.
    // Each line represents a distinct set of parameters for the movement scenario.

    // A utility function to safely convert a string segment into an integer.
    // This helps in robust parsing and handling of potential non-numeric inputs.
    const parseNumericValue = (strSegment) => {
        const numericalVal = parseInt(strSegment.trim(), 10);
        // In a production system, more sophisticated error handling might be required,
        // such as throwing an exception or returning a default/null value.
        // For this context, we assume valid input or default to 0 on failure.
        if (isNaN(numericalVal)) {
            console.error("Warning: Non-numeric input encountered:", strSegment);
            return 0; // Fallback for invalid numeric data.
        }
        return numericalVal;
    };

    // Divide the entire input string into an array of individual lines.
    const dataRows = sourceData.trim().split("\n");

    // Perform a basic validation to ensure the minimum expected number of lines are present.
    // The problem expects at least three lines of input.
    if (dataRows.length < 3) {
        console.log("NO"); // Insufficient data to process the scenario.
        return;
    }

    // --- Processing the first line of input: Entity One's parameters ---
    const initialConfigLine = dataRows[0];
    const entityOneDetails = initialConfigLine.split(" ");
    // Extract starting position and velocity for the first entity.
    const entityOneStartingPosition = parseNumericValue(entityOneDetails[0]);
    const entityOneTravelSpeed = parseNumericValue(entityOneDetails[1]);

    // --- Processing the second line of input: Entity Two's parameters ---
    const targetConfigLine = dataRows[1];
    const entityTwoDetails = targetConfigLine.split(" ");
    // Extract starting position and velocity for the second entity.
    const entityTwoStartingPosition = parseNumericValue(entityTwoDetails[0]);
    const entityTwoTravelSpeed = parseNumericValue(entityTwoDetails[1]);

    // --- Processing the third line of input: Time constraint ---
    // Extract the maximum duration allowed for interception.
    const maximumAllowedDuration = parseNumericValue(dataRows[2]);

    // Initialize a flag to track if interception is feasible.
    let interceptionFeasible = false;
    // Prepare the final string output, defaulting to "NO".
    let scenarioOutcomeString = "NO";

    // Calculate the difference in speeds between the two entities.
    // A positive value means Entity One is faster than Entity Two.
    const speedDifferential = entityOneTravelSpeed - entityTwoTravelSpeed;

    // Determine the absolute spatial separation between the entities.
    const initialDistanceGap = Math.abs(entityTwoStartingPosition - entityOneStartingPosition);

    // Logic Branch 1: Entity One is not faster than Entity Two (speedDifferential <= 0).
    // In this case, Entity One can only intercept Entity Two if they are already
    // at the same location at the start. Otherwise, they will never meet or Entity Two
    // will pull further ahead/maintain distance.
    if (speedDifferential <= 0) {
        if (entityOneStartingPosition === entityTwoStartingPosition) {
            interceptionFeasible = true;
        }
    }
    // Logic Branch 2: Entity One is faster than Entity Two (speedDifferential > 0).
    // Interception is possible if Entity One can cover the initial distance gap
    // within the allowed time, leveraging its superior speed.
    else {
        // Calculate the time required for Entity One to close the initial distance gap.
        // This is the distance divided by the relative closing speed.
        const durationRequiredForCatchUp = initialDistanceGap / speedDifferential;

        // Check if the required duration is positive (meaning they are not already at the same spot
        // and moving apart, or already at the same spot and this branch should be skipped by the original logic)
        // AND if this duration falls within the maximum allowed time.
        // The condition `durationRequiredForCatchUp > 0` ensures that if they are already at the same position
        // (initialDistanceGap is 0), and Entity One is faster, it doesn't count as "catching up"
        // in this specific branch, consistent with the original problem's nuanced logic.
        if (durationRequiredForCatchUp > 0 && durationRequiredForCatchUp <= maximumAllowedDuration) {
            interceptionFeasible = true;
        }
    }

    // Based on the final determination, set the output string.
    if (interceptionFeasible) {
        scenarioOutcomeString = "YES";
    }

    // Display the conclusive result for the scenario.
    console.log(scenarioOutcomeString);

    // The function completes its execution.
    return;
}

// This section handles the standard input/output mechanism.
// It reads all data from the system's standard input stream,
// typically used in competitive programming environments, and
// then invokes the main processing function with this data.
// This part should generally remain untouched for problem submissions.
AnalyzeMovementScenario(require("fs").readFileSync("/dev/stdin", "utf8"));

// Example of how to run this code locally for testing:
// 1. Save the code as 'solution.js'.
// 2. Open a terminal and navigate to the directory where 'solution.js' is saved.
// 3. Execute: `node solution.js`
// 4. Then, manually type the input lines, e.g.:
//    1
//    2 3
//    10
// 5. Press Ctrl + D (or Ctrl + Z on Windows) to signal End-Of-File.
//    The program will then process the input and display the result.