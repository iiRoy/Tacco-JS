// This primary function handles the processing of an incoming data stream.
function processInputData(incomingStream) {

  // Divide the raw input into distinct sections using a space as the delimiter.
  const dataSections = incomingStream.split(' ');

  // Extract the first section and convert it into an integer, representing the initial quantity.
  let currentQuantity = parseInt(dataSections[0], 10);

  // Extract the second section and convert it into an integer, serving as the system's base.
  const operationalBase = parseInt(dataSections[1], 10);

  // Initialize an empty string variable to accumulate the transformation results.
  let transformationResult = '';

  // Continue iterating as long as the current quantity remains positive.
  while (currentQuantity > 0) {

    // Append the remainder of the current quantity divided by the operational base to the result string.
    transformationResult += currentQuantity % operationalBase;

    // Update the current quantity by performing integer division with the operational base.
    currentQuantity = Math.floor(currentQuantity / operationalBase);
  }

  // Output the total character count of the final transformation result string.
  console.log(transformationResult.length);
}

// The following code segment is responsible for managing standard input/output operations.
// It should not be altered, as it reads data from the system's standard input and invokes the main processing logic.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));