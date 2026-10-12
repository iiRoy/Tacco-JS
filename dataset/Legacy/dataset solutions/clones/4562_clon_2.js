function ProcessInput(rawData) {
  // This function processes the incoming text data.
  rawData = rawData.split("\n"); // Split the entire input string into an array of lines.

  var dimensionsStr = rawData[0].split(" "); // Take the first line and split it by space to get width and height.
  var heightVal = parseInt(dimensionsStr[0], 10); // Parse the first dimension as the height.
  var widthVal = parseInt(dimensionsStr[1], 10); // Parse the second dimension as the width.

  // Loop through each row, including the top and bottom borders.
  for (var rowIndex = 0; rowIndex < heightVal + 2; rowIndex++) {
    var currentRowChars = ['#']; // Start each row with a hash character.

    // Loop through the columns to fill the content of the current row.
    for (var colIndex = 0; colIndex < widthVal; colIndex++) {
      // Determine if the current row is a border row (first or last).
      if (rowIndex === 0 || rowIndex === heightVal + 1) {
        currentRowChars.push('#'); // If it's a border row, add a hash.
      } else {
        currentRowChars.push(rawData[rowIndex][colIndex]); // Otherwise, add the character from the original data.
      }
    }

    currentRowChars.push('#'); // End each row with a hash character.
    console.log(currentRowChars.join('')); // Print the assembled row to the console.
  }
}

// The following code reads from standard input and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
