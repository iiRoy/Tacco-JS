function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(contentToPrint) {
  console.log(contentToPrint);
}

// This utility function handles various input transformations.
// The 'transformationType' parameter dictates the processing method:
// 0: Returns the input string as is.
// 1: Converts the input string to an integer.
// 2: Splits the input string by spaces into an array of strings.
// 3: Splits the input string by newlines into an array of strings.
// 4: Splits by spaces, then converts each part to a number, returning a number array.
// 5: Splits by newlines, then converts each part to a number, returning a number array.
// 6: Splits the input string into an array of individual characters.
// 7: Splits into individual characters, then converts each character to a number, returning a number array.
function processInput(inputValue, transformationType) {
  switch (transformationType) {
    case 0:
      return inputValue;
    case 1:
      return Number.parseInt(inputValue, 10);
    case 2:
      return inputValue.split(" ");
    case 3:
      return inputValue.split("\n");
    case 4:
      return inputValue.split(" ").map((itemVal) => Number(itemVal));
    case 5:
      return inputValue.split("\n").map((itemVal) => Number(itemVal));
    case 6:
      return inputValue.split("");
    case 7:
      return inputValue.split("").map((itemVal) => Number(itemVal));
    default:
      return inputValue;
  }
}

function executeProgram(initialInput) {
  // First, split the entire input by newlines to get an array of lines.
  let processedLines = processInput(initialInput, 3);

  // Extract grid dimensions (height and width) from the first line.
  const gridHeight = processInput(processedLines[0], 4)[0];
  const gridWidth = processInput(processedLines[0], 4)[1];

  // Extract the total number of colors (though not directly used in the loop logic, it's part of input).
  const colorCount = processInput(processedLines[1], 1);

  // Extract the quantities for each color from the third line.
  const colorQuantities = processInput(processedLines[2], 4);

  // Initialize a 2D array (grid) to store the output.
  let resultGrid = Array(gridHeight);
  for (let rowInitializer = 0; rowInitializer < gridHeight; rowInitializer++) {
    resultGrid[rowInitializer] = Array(gridWidth);
  }

  // This variable keeps track of the current color ID being placed in the grid.
  let currentColorId = 1;

  // Iterate through each row of the grid.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    if (rowIdx % 2 === 0) {
      // For even-indexed rows, fill cells from left to right.
      for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
        // If the current color's quantity is depleted, move to the next color ID.
        if (colorQuantities[currentColorId - 1] === 0) {
          currentColorId++;
        }
        // Decrement the quantity of the current color and assign it to the grid cell.
        colorQuantities[currentColorId - 1]--;
        resultGrid[rowIdx][colIdx] = currentColorId;
      }
    } else {
      // For odd-indexed rows, fill cells from right to left.
      for (let colIdx = gridWidth - 1; colIdx >= 0; colIdx--) {
        // If the current color's quantity is depleted, move to the next color ID.
        if (colorQuantities[currentColorId - 1] === 0) {
          currentColorId++;
        }
        // Decrement the quantity of the current color and assign it to the grid cell.
        colorQuantities[currentColorId - 1]--;
        resultGrid[rowIdx][colIdx] = currentColorId;
      }
    }
  }

  // After filling the grid, format each row into a space-separated string.
  for (let rowFormatter = 0; rowFormatter < gridHeight; rowFormatter++) {
    resultGrid[rowFormatter] = resultGrid[rowFormatter].join(" ");
  }

  // Join all formatted rows with newline characters and display the final result.
  displayOutput(resultGrid.join("\n"));
}

// Initiate the program by reading input and then executing the main logic.
executeProgram(getInputData());
