function processInput(inputString) {
    // This function takes an input string, converts it to a number,
    // and then performs a modulo operation repeatedly until the number
    // is less than 1000. Finally, it prints the result.

    // The original code had a commented-out line for splitting input,
    // which is not relevant for this specific problem's input format.
    // const initialData = inputString.split("\n");

    let currentValue = Number(inputString); // Convert the provided string argument into a numerical type.

    // Begin a loop that continues as long as the numerical value is 1000 or greater.
    while (currentValue >= 1000) {
        currentValue %= 1000; // Update the value by taking its remainder when divided by 1000.
    }

    // Output the final processed numerical value to the console.
    console.log(currentValue);

    // Another commented-out line from the original source, not part of the active logic.
    // console.log(currentValue === 1000 ? 0 : 1000 - currentValue);
}

// The original code also contained a commented-out direct function call for testing.
// processInput("1900");

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it as an argument to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
