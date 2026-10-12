process.stdin.on("data", function(inputLinesBuffer) {
    // Convert the input buffer to a string, clean it up, and split into individual lines.
    let inputLines = (inputLinesBuffer + "").trim().split("\n");

    // Initialize an object to store elements from the first list for quick lookup.
    // This acts as a hash set to track unique items.
    const firstSetElements = {};

    // Initialize a counter for elements found in both lists.
    let commonElementCount = 0;

    // Process the second line of input, which contains the first set of numbers.
    // Split the string by spaces and iterate over each number.
    inputLines[1].split(" ").forEach(function(elementValue) {
        // Add each unique element from the first set to our lookup object.
        // The value '1' is arbitrary; any truthy value would work to indicate presence.
        firstSetElements[elementValue] = 1;
    });

    // Process the fourth line of input, which contains the second set of numbers.
    // Split the string by spaces and iterate over each number.
    inputLines[3].split(" ").forEach(function(elementValue) {
        // Check if the current element from the second set exists in our lookup object.
        // If it does, increment the common element counter by the value stored (which is 1).
        if (firstSetElements[elementValue]) {
            commonElementCount += firstSetElements[elementValue];
        }
    });

    // Output the final count of common elements to the console.
    console.log(commonElementCount);
}).resume(); // Ensure the process continues to listen for input.
