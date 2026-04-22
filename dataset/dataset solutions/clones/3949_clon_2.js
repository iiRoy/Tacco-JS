function processInputData(incomingText) {
  // Break down the received string into individual lines
  incomingText = incomingText.split("\n");
  
  // Parse the first two integer values from the initial line
  let valX = parseInt(incomingText[0].split(" ")[0]);
  let valY = parseInt(incomingText[0].split(" ")[1]);

  // Initialize a 2D array (matrix) of 100x100 characters
  let charMatrix = new Array(100);
  
  // Populate the matrix with initial characters
  for (let idx = 0; idx < 100; idx++) {
    let tempArr;
    if (idx < 50) {
      // First 50 rows filled with '.'
      tempArr = new Array(100).fill(".");
    } else {
      // Remaining 50 rows filled with '#'
      tempArr = new Array(100).fill("#");
    }
    charMatrix[idx] = tempArr;
  }

  // Modify the matrix based on valY
  for (let loopX = 0; loopX < valY - 1; loopX++) {
    charMatrix[Math.round(loopX / 50) * 2][(loopX % 50) * 2] = "#";
  }

  // Further modify the matrix based on valX
  for (let loopY = 0; loopY < valX - 1; loopY++) {
    charMatrix[99 - Math.round(loopY / 50) * 2][(loopY % 50) * 2] = ".";
  }

  // Convert the character matrix into an array of joined strings
  const outputLines = new Array(100);
  for (let rowNum = 0; rowNum < 100; rowNum++) {
    outputLines[rowNum] = charMatrix[rowNum].join("");
  }
  
  // Join all the string rows with newlines to form the final result
  const finalOutput = outputLines.join("\n");

  // Output the generated string to the console
  console.log('%s', finalOutput);
}

// Helper function for local development environment
function testUtility() {
  // Retrieve input from a specified HTML element
  const testInput = document.getElementById("inputElement").value;
  // Execute the main processing logic
  processInputData(testInput);
}

// Invoke the primary processing function with input from standard I/O
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));