const processInput = function (rawData) {
    // Parse the input string into an array of integers
    let parsedNumbers = rawData.split(' ').map(val => parseInt(val));

    // Extract the three main numerical parameters
    let rowsCount = parsedNumbers[0];
    let colsCount = parsedNumbers[1];
    let targetValue = parsedNumbers[2];

    // Initialize a flag to store the outcome, default to 'No'
    let resultFlag = 'No';

    // Iterate through all possible row indices from 0 to rowsCount (inclusive)
    for (let rowIndex = 0; rowIndex <= rowsCount; rowIndex++) {
        // For each row index, iterate through all possible column indices from 0 to colsCount (inclusive)
        for (let colIndex = 0; colIndex <= colsCount; colIndex++) {
            // Check if the current combination of rowIndex and colIndex satisfies the given equation
            // The equation is: colIndex * (rowsCount - rowIndex) + rowIndex * (colsCount - colIndex) == targetValue
            if (colIndex * (rowsCount - rowIndex) + rowIndex * (colsCount - colIndex) === targetValue) {
                resultFlag = 'Yes'; // If a match is found, update the flag
                console.log(resultFlag); // Print 'Yes' to standard output
                return 0; // Exit the function immediately as a solution is found
            }
        }
    }

    // If the loops complete without finding any matching combination,
    // print the literal string 'Ans' as per original code's behavior.
    console.log('Ans');
    return 0; // Indicate successful execution
};

// Read input from standard input, decode as UTF-8, and remove leading/trailing whitespace
processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
