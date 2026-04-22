function ProcessInput(incomingContent) {
  // Split the raw incoming text into individual lines
  incomingContent = incomingContent.split("\n");

  // Extract the first segment of data, splitting it by spaces
  let initialSegment = incomingContent[0].split(" ");

  // Parse the first numeric component from the segment
  let operandOne = parseInt(initialSegment[0]);

  // Parse the second numeric component from the segment
  let operandTwo = parseInt(initialSegment[1]);
  
  // Evaluate if the combined value exceeds a specific threshold
  if (operandOne + operandTwo > 9) {
    // If the sum is too large, indicate a problem
    console.log("issue");
  } else {
    // Otherwise, display the successful sum
    console.log(operandOne + operandTwo);
  }
}

// Retrieve content from standard input and pass it to the handler
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));