// This module processes some input data.
function processInput(dataArray) {
  let firstElement = dataArray[0]; // Extract the initial data item.

  if (firstElement[0] === firstElement[2]) { // Check if the first and third characters are identical.
    console.log("Yes"); // Output confirmation.
  } else {
    console.log("No"); // Output denial.
  }
}

// Execute the primary function with data read from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
