function ProcessInput(dataString) {
    // Convert the input string to a numerical value.
    var currentValue = Number(dataString);

    // Handle the special case where the initial value is 1.
    if (currentValue === 1) {
        return console.log(1);
    }

    // Initialize a counter for the number of steps.
    var stepCount = 1;
    // Begin an indefinite loop to perform calculations.
    while (true) {
        // Divide the current value by 2 and take the floor (integer part).
        currentValue = Math.floor(currentValue / 2);
        // Increment the step counter for each division.
        stepCount++;
        // If the current value has been reduced to 1, exit the loop.
        if (currentValue === 1) {
            break;
        }
    }

    // Compute the final outcome based on the accumulated step count.
    const finalResult = Math.pow(2, stepCount) - 1;

    // Output the calculated result to the console.
    console.log(finalResult);
}

// This section is responsible for reading input from standard input and executing the primary function.
// It is crucial for the program's operation and should remain unaltered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
