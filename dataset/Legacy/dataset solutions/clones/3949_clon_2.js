function ProcessInput(rawData) {
  rawData = rawData.split("\n");

  let firstValue = parseInt(rawData[0].split(" ")[0]);
  let secondValue = parseInt(rawData[0].split(" ")[1]);

  // Initialize a 100x100 grid
  let canvasMatrix = new Array(100);

  for (let rowIndex = 0; rowIndex < 100; rowIndex++) {
    let currentLineData;
    if (rowIndex < 50) {
      // First 50 rows are filled with '.'
      currentLineData = new Array(100).fill(".");
    } else {
      // Remaining 50 rows are filled with '#'
      currentLineData = new Array(100).fill("#");
    }
    canvasMatrix[rowIndex] = currentLineData;
  }

  // Modify the grid based on the second input value
  for (let bCounter = 0; bCounter < secondValue - 1; bCounter++) {
    let targetRow = Math.round(bCounter / 50) * 2;
    let targetCol = (bCounter % 50) * 2;
    canvasMatrix[targetRow][targetCol] = "#";
  }

  // Modify the grid based on the first input value
  for (let aCounter = 0; aCounter < firstValue - 1; aCounter++) {
    let targetRow = 99 - Math.round(aCounter / 50) * 2;
    let targetCol = (aCounter % 50) * 2;
    canvasMatrix[targetRow][targetCol] = ".";
  }

  // Convert the 2D array into an array of strings
  let finalOutputRows = new Array(100);
  for (let outputRowIndex = 0; outputRowIndex < 100; outputRowIndex++) {
    finalOutputRows[outputRowIndex] = canvasMatrix[outputRowIndex].join("");
  }

  // Join the array of strings into a single string with newlines
  let finalResultString = finalOutputRows.join("\n");

  // Print the generated pattern to the console
  console.log('%s', finalResultString);
}

// This function is for local debugging, typically triggered by a UI button.
function executeTest() {
  let testData = document.getElementById("input").value;
  ProcessInput(testData);
}

// Execute the main processing function with input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
