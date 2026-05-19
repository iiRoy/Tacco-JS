process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Orchestrates the processing of standard input data.
 * This function serves as the primary entry point for the application logic.
 * @param {string} fullInputString - The complete string content read from standard input.
 */
function ProcessInputData(fullInputString) {
  // Divide the entire input string into an array of individual lines.
  // Each element in 'inputLines' corresponds to a line from the input.
  let inputLines = fullInputString.split("\n");

  // Extract the first line and further split it by spaces to get individual tokens.
  let firstLineTokens = inputLines[0].split(" ");

  // The original code contained commented-out declarations for subsequent lines.
  // These are retained as comments to preserve the structural intent.
  // let subsequentLine1 = inputLines[1].split(" ");
  // let subsequentLine2 = inputLines[2].split(" ");
  // let subsequentLine3 = inputLines[3].split(" ");

  // Convert the first two tokens of the first line into numerical values.
  // 'firstNum' corresponds to the 'S' value in the original problem context.
  let firstNum = Number(firstLineTokens[0]);
  // 'secondNum' corresponds to the 'c' value in the original problem context.
  let secondNum = Number(firstLineTokens[1]);
  // Additional commented-out variable declarations from the original.
  // let anotherValueA = Number(firstLineTokens[1]);
  // let anotherValueB = Number(firstLineTokens[2]);
  
  // Declare and initialize a variable, 'operationResult', which is not ultimately used
  // in the final output calculation, mirroring the original 'count' variable's behavior.
  let operationResult = 0;
  
  // A commented-out debug statement from the original code.
  // console.log(firstNum + " " + secondNum);

  // Evaluate a condition involving 'firstNum' and 'secondNum'.
  // If 'firstNum' is greater than half of 'secondNum', print a specific calculated value.
  if (firstNum > secondNum / 2) {
    console.log(Math.floor(secondNum / 2));
  }
  
  // Modify 'secondNum' based on a calculation involving 'firstNum'.
  secondNum = secondNum - firstNum * 2;
  
  // Output the final computed value, which is a sum of 'firstNum' and a quarter of the modified 'secondNum'.
  console.log(firstNum + Math.floor(secondNum / 4));
}

// This section is responsible for reading input from the standard input stream
// and passing it to the main processing function. It should remain unchanged
// to ensure proper interaction with the execution environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
