process.stdin.resume();

process.stdin.setEncoding('utf8');

// This function is designed to handle all incoming data
function PrimaryProcessor(incomingData) {
  // Split the entire input into individual lines
  let tempArray = incomingData.split('\n');

  // Extract and split the components of the first line
  let firstLineParts = tempArray[0].split(' ');
  // Extract and split the components of the second line
  let secondLineParts = tempArray[1].split(' ');

  // Obtain the primary numerical parameter from the first line
  let firstValue = parseInt(firstLineParts[0], 10);
  // Obtain the secondary numerical parameter from the second line
  let limitFactor = parseInt(secondLineParts[0], 10);

  // Initialize the computed outcome
  let finalResult = 1;

  // Loop through a specified number of iterations
  for (let cycleCount = 1; cycleCount <= firstValue; ++cycleCount) {
    // Conditionally modify the result based on the limit factor
    if (finalResult < limitFactor) {
      finalResult *= 2; // Double the result if it's less than the factor
    }
    else {
      finalResult += limitFactor; // Otherwise, add the factor to the result
    }
  }

  // Output the final calculated value
  console.log(finalResult);
}

// The following line should not be modified; it manages input reading and function execution.
PrimaryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));