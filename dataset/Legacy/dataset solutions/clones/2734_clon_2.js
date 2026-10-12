function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    let parsedLines = rawData.split("\n");

    // The first line contains the count of items
    const countOfItems = parsedLines[0];

    // Remove the first line as it's already used for the count
    parsedLines.shift();

    // The remaining lines form the primary data array
    const dataArray = parsedLines;

    // Iterate through each item based on the initial count
    for (let idx = 0; idx < countOfItems; idx++) {
        // Create a temporary subset array by copying the main data
        let currentSubset = dataArray.slice(0, dataArray.length);

        // Remove the item at the current index from the subset
        currentSubset.splice(idx, 1);

        // Find the maximum value in the modified subset and print it
        console.log(currentSubset.reduce((val1, val2) => val1 > val2 ? val1 : val2));
    }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
