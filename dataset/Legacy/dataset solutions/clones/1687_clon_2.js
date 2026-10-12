function ProcessInput(rawData) {
    // Parse the input string into an integer representing the item's cost
    var itemCost = parseInt(rawData);

    // Initialize a variable to find the next multiple of 1000
    // This variable will store the current multiple of one thousand
    var targetMultiple = 1000;

    // Loop to find the smallest multiple of 1000 that is greater than the item's cost
    while (targetMultiple <= itemCost) {
        // Increment the multiple by 1000 in each iteration
        targetMultiple += 1000;
    }

    // Calculate the difference between the found multiple and the item's cost
    // This represents the amount needed to reach the next 1000-yen boundary
    console.log(targetMultiple - itemCost);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
