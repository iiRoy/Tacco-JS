function ProcessInput(rawData) {
  // The incoming raw data string is first divided into an array of lines.
  let processedData = rawData.split("\n");

  // Extract the first numerical value from the initial line of input.
  const firstVal = parseInt(processedData[0].split(" ")[0], 10);
  // Extract the second numerical value from the initial line of input.
  const secondVal = parseInt(processedData[0].split(" ")[1], 10);

  // Initialize a two-dimensional array (matrix) of size 100x100 to represent a canvas.
  let canvasMatrix = new Array(100);

  // Populate the initial state of the canvas matrix.
  // The first 50 rows are filled with '.' characters, and the next 50 with '#'.
  for (let idx = 0; idx < 100; idx++) {
    let tempRow; // A temporary array to construct each row.
    if (idx < 50) {
      // Rows in the upper half are initialized with dots.
      tempRow = new Array(100).fill(".");
    } else {
      // Rows in the lower half are initialized with hash symbols.
      tempRow = new Array(100).fill("#");
    }
    canvasMatrix[idx] = tempRow; // Assign the completed row to the matrix.
  }

  // Modify the canvas based on the 'secondVal' input.
  // This loop places '#' characters in specific positions within the upper half of the canvas.
  for (let idx = 0; idx < secondVal - 1; idx++) {
    const targetRow = Math.round(idx / 100) * 2;
    const targetCol = (idx % 50) * 2;
    canvasMatrix[targetRow][targetCol] = "#";
  }

  // Modify the canvas based on the 'firstVal' input.
  // This loop places '.' characters in specific positions within the lower half of the canvas.
  for (let idx = 0; idx < firstVal - 1; idx++) {
    const targetRow = 99 - Math.round(idx / 100) * 2;
    const targetCol = (idx % 50) * 2;
    canvasMatrix[targetRow][targetCol] = ".";
  }

  // Prepare an array to store the final output lines, including a header.
  let outputLines = new Array(101);
  outputLines[0] = "100 100"; // The first line specifies the dimensions of the grid.

  // Convert each row of the canvas matrix into a single string and add it to the output lines.
  for (let idx = 0; idx < 100; idx++) {
    outputLines[idx + 1] = canvasMatrix[idx].join("");
  }

  // Combine all generated output lines into a single string, separated by newline characters.
  const finalOutput = outputLines.join("\n");

  // Display the final generated pattern to the standard output.
  console.log('%s', finalOutput);
}

// This auxiliary function is intended for debugging within a browser environment.
function testFunction() {
  // It retrieves input from a designated HTML element.
  const browserInput = document.getElementById("input").value;
  // Then, it invokes the primary processing function with this browser-sourced input.
  ProcessInput(browserInput);
}

// Execute the main processing logic by reading input from standard input,
// which is typical for competitive programming environments using Node.js.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
