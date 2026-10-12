// This function processes the given input to calculate a specific sum based on a halving and doubling algorithm.
function processInput(rawData) {
    // Initialize the primary numerical value by parsing the raw input string.
    // The input is expected to be an integer representing an initial height or quantity.
    let currentValue = parseInt(rawData);

    // Initialize a multiplier that will progressively double.
    // It starts at 1, representing the first "step" or "level".
    let stepMultiplier = 1;

    // Initialize an accumulator for the final sum.
    // It also starts at 1, corresponding to the initial stepMultiplier.
    let totalSum = 1;

    // Begin an infinite loop that continues until a specific condition is met internally.
    while (true) {
        // Halve the current value in each iteration. This simulates a process
        // where a quantity is repeatedly divided by two.
        currentValue = currentValue / 2;

        // Check if the current value has dropped below 1.
        // This serves as the termination condition for the loop.
        if (currentValue < 1) {
            // If the value is less than 1, the process is considered complete,
            // and the loop is exited.
            break;
        }

        // If the loop continues, double the step multiplier.
        // This represents the increasing number of elements or options at each subsequent level.
        stepMultiplier = stepMultiplier * 2;

        // Add the newly calculated step multiplier to the running total sum.
        // This accumulates the sum of all steps or levels.
        totalSum = totalSum + stepMultiplier;
    }

    // After the loop terminates, print the final calculated total sum to the console.
    console.log(totalSum);
}

// The program execution starts here.
// It reads the entire content of standard input as a UTF-8 string.
// This string is then passed to the 'processInput' function for calculation.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
