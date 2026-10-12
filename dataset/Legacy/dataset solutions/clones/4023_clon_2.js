function ProcessInput(inputData) {
    // Extract the item cost from the first line of the input string.
    const itemCost = parseInt(inputData.split("\n")[0]);

    // Retrieve the available allowance from the second line of the input.
    const allowance = parseInt(inputData.split("\n")[1]);

    // Determine if the remainder of the item cost divided by 500 is within the allowance.
    // If it is, print "YES"; otherwise, print "NO".
    console.log(itemCost % 500 <= allowance ? "YES" : "NO");
}

// Read the standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
