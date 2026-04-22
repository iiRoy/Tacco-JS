// This function processes the incoming data to calculate a specific result.
function ProcessData(rawData) {
    // Split the entire input string into individual lines based on the newline character.
    var inputLines = rawData.split('\n');

    // The first line is expected to contain two space-separated numerical parameters.
    var firstLineTokens = inputLines[0].split(' ');

    // Parse the first parameter as the total count of elements, ensuring it's an integer.
    var totalElements = parseInt(firstLineTokens[0], 10);

    // Parse the second parameter as the capacity of each group, also as an integer.
    var groupCapacity = parseInt(firstLineTokens[1], 10);

    // The second line contains a list of space-separated numbers;
    // these are converted into an array of integers using a map function.
    var elementValues = inputLines[1].split(' ').map(itemValue => parseInt(itemValue, 10));

    // Perform the core calculation: determine the number of operations needed.
    // The result is rounded up to the nearest whole number using Math.ceil.
    console.log(Math.ceil((totalElements - 1) / (groupCapacity - 1)));
}

// Read input from the standard input stream using Node.js file system module.
// The read data is then passed to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));