// This function processes the given input data.
function ProcessInput(rawData) {
  // Split the raw input into an array of lines.
  rawData = rawData.split('\n');

  // Parse the first line to extract two integer values.
  let numItems = parseInt(rawData[0].split(' ')[0]); // First number
  let targetCount = parseInt(rawData[0].split(' ')[1]); // Second number

  // Initialize a string variable for the final outcome.
  let resultString = "NO";

  // Check the condition based on the parsed numbers.
  if (Math.ceil(numItems / 2) >= targetCount) {
    resultString = "YES"; // Update the outcome if the condition is met.
  }

  // Output the final result to the console.
  console.log('%s', resultString);
}

/*
 * This is a helper function for local testing purposes.
 * It simulates input from a web page element.
 */
function testFunction() {
  // Retrieve input from a DOM element with ID "input".
  let pageInput = document.getElementById("input").value;
  // Call the main processing function with the retrieved input.
  ProcessInput(pageInput);
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
