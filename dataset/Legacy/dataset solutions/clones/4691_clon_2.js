function CalculateValue(inputQuantity) {
    // This variable stores the initial calculated cost based on the input quantity.
    let totalCost = inputQuantity * 800;

    // This variable will count the number of iterations in the subsequent loop.
    let iterationCount = 0;

    // The loop processes the input quantity, decrementing it by a fixed amount in each step.
    // The loop continues as long as the quantity remains non-negative.
    for (inputQuantity; inputQuantity >= 0; inputQuantity -= 15) {
        // Increment the iteration counter for each pass through the loop.
        iterationCount = iterationCount + 1;
    }

    // This variable calculates a rebate amount based on the total iterations.
    let rebateAmount = (iterationCount * 200) + 200;

    // The final result, which is the difference between the total cost and the rebate, is printed to the console.
    console.log(totalCost - rebateAmount);
}

// The program starts by reading an input value from standard input,
// then converts it to a string using UTF-8 encoding, and passes it to the main calculation function.
CalculateValue(require("fs").readFileSync("/dev/stdin", "utf8"));
