function ProcessInput(rawData) {
    // Remove leading and trailing whitespace from the raw input string.
    rawData = rawData.trim();

    // Initialize a string containing all uppercase English alphabet characters.
    var alphabetChars = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

    // Declare a variable to store the final generated output string.
    var resultString = "";

    // Parse the height (number of rows) from the first line of the input.
    // The input is split by newline, then the first line is split by space, and the first part is taken.
    var heightVal = parseInt(rawData.split("\n")[0].split(" ")[0]);
    // Parse the width (number of columns) from the first line of the input.
    // This variable (widthVal) is declared but not used in the subsequent logic.
    var widthVal = parseInt(rawData.split("\n")[0].split(" ")[1]);

    // Loop through each row of the grid, starting from the second line of the input (index 1).
    // The loop runs from 1 up to and including the determined height.
    for (var rowIdx = 1; rowIdx <= heightVal; rowIdx++) {
        // Extract the current row's data by splitting the input by newline,
        // then splitting the specific row by spaces to get individual elements.
        var currentRowData = rawData.split("\n")[rowIdx].split(" ");

        // Loop through each element (column) within the current row.
        // The loop runs from 1 up to and including the number of elements in the current row.
        for (var colIdx = 1; colIdx <= currentRowData.length; colIdx++) {
            // Check if the current element (word) in the row is exactly "snuke".
            // Note: Array access is 0-indexed, so 'colIdx - 1' is used.
            if (currentRowData[colIdx - 1] == "snuke") {
                // If "snuke" is found, append the corresponding alphabet character
                // (based on the column index) and the current row number to the result string.
                // 'slice(colIdx - 1, colIdx)' extracts a single character from 'alphabetChars'.
                resultString += alphabetChars.slice(colIdx - 1, colIdx) + rowIdx;
            }
        }
    }

    // Print the accumulated result string to the standard output.
    console.log(resultString);
}

// Read the entire content of standard input synchronously using Node.js 'fs' module,
// decode it as UTF-8, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
