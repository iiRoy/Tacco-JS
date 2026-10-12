function ProcessInput(dataArray) {
    // The first input value, representing the total count of items.
    // Although parsed, its direct use in the loop condition is not present in this specific algorithm.
    let countOfItems = parseInt(dataArray[0], 10);

    // The second input value, defining the maximum permissible accumulated distance.
    let maxDistance = parseInt(dataArray[1], 10);

    // Extract the remaining input values, which are individual distances,
    // and convert each of them into an integer.
    const distances = dataArray.slice(2).map(itemStr => parseInt(itemStr, 10));

    // Initialize a counter for the number of points that are reachable.
    // It starts at 1 because the initial point (origin) is always considered reachable.
    let reachablePoints = 1;

    // Initialize a variable to keep track of the current total distance accumulated.
    let currentTotalDistance = 0;

    // Iterate through each distance in the 'distances' array.
    for (let idx = 0; idx < distances.length; idx++) {
        // Add the current distance to the running total.
        currentTotalDistance += distances[idx];

        // Check if the current accumulated total distance is within the allowed maximum.
        if (currentTotalDistance <= maxDistance) {
            // If it is within the limit, increment the count of reachable points.
            reachablePoints++;
        } else {
            // If the accumulated distance exceeds the maximum,
            // it means no further points can be reached.
            // To efficiently exit the loop, we adjust the loop index
            // so that the loop condition (idx < distances.length) becomes false
            // in the next iteration.
            idx += distances.length;
        }
    }

    // Print the final calculated number of reachable points to the console.
    console.log(reachablePoints);
}

// Read the entire content from standard input,
// decode it as UTF-8, remove leading/trailing whitespace,
// and then split the string into an array of substrings
// using either newline characters or spaces as delimiters.
// This array is then passed to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
