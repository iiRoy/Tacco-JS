function ProcessInput(rawData) {
    // Split the entire input string by newline characters into an array of lines.
    rawData = rawData.split("\n");

    // The first line contains a single numerical value, which represents the count of items.
    // The original code uses `split(" ")` on the first line, which is then converted to a number.
    // For a single number like "5", `split(" ")` yields `["5"]`, and `Number(["5"])` is `5`.
    var itemCount = Number(rawData[0].split(" "));

    // The second line contains space-separated numbers, parsed into the first list.
    var firstList = rawData[1].split(" ").map(Number);

    // The third line contains space-separated numbers, parsed into the second list.
    var secondList = rawData[2].split(" ").map(Number);

    // The fourth line contains space-separated numbers, parsed into the third list.
    var thirdList = rawData[3].split(" ").map(Number);

    // Initialize a variable to accumulate the final calculated score.
    var totalScore = 0;

    // Iterate through the items from the first list, up to the determined item count.
    for (var idx = 0; idx < itemCount; idx++) {
        // Add a base score from the second list.
        // The index for `secondList` is derived from `firstList[idx]`,
        // subtracting 1 because `firstList` values are assumed to be 1-indexed.
        totalScore += secondList[firstList[idx] - 1];

        // Check for a specific condition: if the current item in `firstList`
        // is exactly one greater than the previous item in `firstList`.
        // This condition is false for `idx = 0` because `firstList[-1]` would be `undefined`,
        // and `undefined + 1` results in `NaN`, making the comparison `false`.
        if (firstList[idx] === firstList[idx - 1] + 1) {
            // If the condition is met, add an additional bonus from the third list.
            // The index for `thirdList` is derived from `firstList[idx]`,
            // subtracting 2 to correctly reference the bonus associated with the preceding item.
            totalScore += thirdList[firstList[idx] - 2];
        }
    }

    // Output the final calculated total score to the console.
    console.log(totalScore);
}

// Read the entire input from standard input (typically a file in competitive programming environments)
// and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
