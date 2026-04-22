// This module encapsulates a specific numerical sequence processing routine.
function ProcessNumericSequence(initialValuesStr)
{
    // Convert the input string into an array of numeric values.
    // Each part of the string, separated by spaces, is parsed as a number.
    let currentNumericalSet = initialValuesStr
        .split(" ")
        .map(Number);

    // Initialize a counter for the series of transformations.
    // The transformation loop continues as long as all three elements in the set are even,
    // and the maximum allowed iterations have not been exceeded.
    for (
        let currentIteration = 0;
        currentNumericalSet[0] % 2 === 0 &&
        currentNumericalSet[1] % 2 === 0 &&
        currentNumericalSet[2] % 2 === 0 &&
        currentIteration !== 1000;
        currentIteration++
    )
    {
        // A temporary array to hold the values from the current step
        // before they are modified in the next step.
        let priorValues = [
            currentNumericalSet[0],
            currentNumericalSet[1],
            currentNumericalSet[2]
        ];

        // Apply a specific transformation rule to each element of the set.
        // The first element is updated based on the second and third prior values.
        currentNumericalSet[0] = priorValues[1] / 2 + priorValues[2] / 2;
        // The second element is updated based on the first and third prior values.
        currentNumericalSet[1] = priorValues[0] / 2 + priorValues[2] / 2;
        // The third element is updated based on the second and third prior values.
        currentNumericalSet[2] = priorValues[1] / 2 + priorValues[2] / 2;
    }

    // After the loop terminates, check if it was due to reaching the maximum iteration limit.
    // If so, indicate an 'unresolved' state by setting the counter to -1.
    if (currentIteration === 1000) {
        currentIteration = -1;
    }

    // Display the final iteration count or the 'unresolved' indicator.
    console.log(currentIteration);
}

// The entry point of the script: reads data from standard input,
// cleans it, and passes it to the main processing function.
ProcessNumericSequence(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim()
);