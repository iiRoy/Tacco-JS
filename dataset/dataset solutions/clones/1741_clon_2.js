function ProcessInput(rawData) {
    // First, clean up the raw input string: trim whitespace, split by newlines,
    // and then split each resulting line by spaces.
    rawData = rawData.trim().split("\n").map(function(lineString) {
        return lineString.split(" ");
    });

    // Extract the integer value for the limit from the first parsed line.
    let limitVal = parseInt(rawData[0][1], 10);

    // Parse the array of numbers from the second line of input.
    let dataArray = rawData[1].map(elementStr => parseInt(elementStr, 10));

    // Sort the array of numbers in ascending order using our custom comparator.
    dataArray.sort(sortComparator);

    // Initialize a variable to store the accumulated sum.
    let totalSum = 0;

    // Iterate through the first 'limitVal' elements of the sorted array
    // and add each element to the total sum.
    for (let idx = 0; idx < limitVal; idx++) {
        totalSum += dataArray[idx];
    }

    // Print the final calculated sum to the console.
    console.log(totalSum);
}

// This helper function defines the comparison logic for sorting numbers in ascending order.
function sortComparator(valA, valB) {
    return valA - valB; // Returns a negative value if valA < valB, 0 if equal, positive if valA > valB.
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
