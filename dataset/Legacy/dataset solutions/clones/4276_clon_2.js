process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function processes the entire input data
function ProcessInput(rawData) {
  // Split the raw input into an array of lines
  // The first line goes into firstLineParts, the second into secondLineParts, etc.
  let linesArray = rawData.split("\n");
  let firstLineParts = linesArray[0].split(" ");
  let secondLineParts = linesArray[1].split(" ");
  // let thirdLineParts = linesArray[2].split(" "); // Unused line
  // let fourthLineParts = linesArray[3].split(" "); // Another unused line

  // Parse numerical values from the first and second lines
  let iterationsCount = Number(firstLineParts[0]);
  let thresholdValue = Number(secondLineParts[0]);
  // let someOtherValue = Number(firstLineParts[2]); // This variable was commented out

  let currentResult = 1; // Initialize the result variable

  // console.log(iterationsCount + " " + thresholdValue + " " + " debug message "); // Debugging line, commented out

  // Loop a specified number of times
  for (let loopIndex = 1; loopIndex <= iterationsCount; loopIndex++) {
    // Apply the core logic: double if below threshold, otherwise add threshold
    if (currentResult < thresholdValue) {
      currentResult *= 2;
    } else {
      currentResult += thresholdValue;
    }
  }

  // Output the final calculated result to the console
  console.log(currentResult);
}

// Do not modify the code below this line (it handles standard input/output and calls the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
