// This module processes incoming textual information
function ProcessData(inputText) {

  // Split the entire text into individual lines for structured handling
  let parsedLines = inputText.split("\n");

  // Extract numerical values from the initial line of input
  // The first number often represents a primary count or value
  const quantityX = parsedLines[0].split(" ")[0] - 0;
  // The second number usually signifies a secondary count or a different metric
  const quantityY = parsedLines[0].split(" ")[1] - 0;

  // Evaluate a specific condition involving the extracted counts
  if (quantityX * 2 >= quantityY) {
    // If the condition holds true, compute and display a direct division result
    console.log(Math.floor(quantityY / 2));
    // Immediately exit the function after displaying the result
    return;
  }

  // Otherwise, if the initial condition is not met, proceed with an alternative calculation
  // This involves an addition and a floored division of a derived difference
  console.log(quantityX + Math.floor((quantityY - quantityX * 2) / 4));
}

/*
 * The following code snippet is responsible for integrating with the system's standard I/O.
 * It is crucial not to modify this section to ensure the program correctly receives input
 * and invokes the primary data processing function. It reads all data from standard input
 * and supplies it as a single string to the 'ProcessData' function.
 */
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));