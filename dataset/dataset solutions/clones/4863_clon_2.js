function ProcessGridData(rawData) {
  // Begin by cleaning up any leading or trailing whitespace from the raw input.
  rawData = rawData.trim();

  // Define a constant string containing the uppercase English alphabet.
  const letterSequence = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Initialize an empty string to store the accumulated processing result.
  let resultString = "";

  // Parse the grid dimensions (height and width) from the first line of the input.
  const firstLineTokens = rawData.split("\n")[0].split(" ");
  const gridRows = parseInt(firstLineTokens[0], 10); // Extract the total number of rows.
  const gridCols = parseInt(firstLineTokens[1], 10); // Extract the total number of columns.

  // Iterate through each row of the grid, starting from the first actual data row.
  for (let rowIndex = 1; rowIndex <= gridRows; rowIndex++) {
    // Split the current line into individual elements based on space delimiter.
    const currentRowElements = rawData.split("\n")[rowIndex].split(" ");

    // Loop through each element in the current row.
    for (let colIndex = 1; colIndex <= currentRowElements.length; colIndex++) {
      // Check if the current element matches the specific target word.
      if (currentRowElements[colIndex - 1] === "snuke") {
        // If a match is found, append the corresponding letter from the sequence
        // and the current row number to the result string.
        resultString += letterSequence.slice(colIndex - 1, colIndex) + rowIndex;
      }
    }
  }

  // Output the final generated string to the console.
  console.log(resultString);
}

// Read input from standard input and pass it to the processing function.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));