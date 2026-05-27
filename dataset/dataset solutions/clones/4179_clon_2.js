function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get an array of lines.
  let processedLines = rawData.split("\n");

  // Parse the first number from the first line. This number determines the size
  // of the primary data structure.
  let countElements = parseInt(processedLines[0].split(" ")[0]);

  // Split the second line of the input into an array of string values.
  let tempValues = processedLines[1].split(" ");

  // Initialize a main data array with a specified number of elements, all set to zero.
  let dataArray = new Array(countElements).fill(0);

  // Create an empty array to store pairs of indices representing operations performed.
  let operationsList = [];

  // Iterate through the elements, from the first up to 'countElements - 1'.
  // 'idx' serves as the current index for processing.
  for (let idx = 0; idx < countElements; idx++) {
    // Convert the string value from 'tempValues' at the current index to an integer
    // and assign it to the corresponding position in 'dataArray'.
    dataArray[idx] = parseInt(tempValues[idx]);

    // Evaluate the first specific condition:
    // 1. Ensure it's not the very first element (idx > 0).
    // 2. Check if the current element's value is less than the previous element's value.
    // 3. Verify that the current element's value is positive.
    if (idx > 0 && dataArray[idx] < dataArray[idx - 1] && dataArray[idx] > 0) {
      // If the condition is met, create a new array containing the previous and current indices.
      let opPair = [idx - 1, idx];
      // Add this index pair to the list of operations.
      operationsList.push(opPair);
      // Update the current element's value by adding the previous element's value to it.
      dataArray[idx] = dataArray[idx - 1] + dataArray[idx];
    }
    // If the first condition is not met, evaluate a second specific condition:
    // 1. Ensure it's not the very first element (idx > 0).
    // 2. Check if the current element's value is negative.
    // 3. Verify that the current element's value is less than the previous element's value.
    else if (idx > 0 && dataArray[idx] < 0 && dataArray[idx] < dataArray[idx - 1]) {
      // If this condition is met, create a new array containing the previous and current indices.
      let opPair = [idx - 1, idx];
      // Begin an inner loop. Crucially, the 'idx' variable (the outer loop counter)
      // is incremented within this inner loop's update expression.
      for (let innerIdx = 0; dataArray[idx] + dataArray[idx - 1] * (innerIdx) <= dataArray[idx - 1]; idx++) {
        // Add the current operation pair to the list.
        operationsList.push(opPair);
        // Increment the current element's value by adding the previous element's value.
        dataArray[idx] += dataArray[idx - 1];
      }
      // After the inner loop completes, add the operation pair one more time.
      operationsList.push(opPair);
      // Perform one final increment of the current element's value.
      dataArray[idx] += dataArray[idx - 1];
    }
  }

  // Initialize the string that will hold the final output.
  // It starts with the total number of operations recorded.
  let finalOutput = operationsList.length;

  // Iterate through the collected list of operations.
  // 'idx' is reused here as a loop counter for this final formatting step.
  for (let idx = 0; idx < operationsList.length; idx++) {
    // Append each operation pair (formatted as "index1 index2") to the output string,
    // prefixed by a newline character.
    finalOutput += "\n" + operationsList[idx][0] + " " + operationsList[idx][1];
  }

  // Output the final formatted string to the console.
  console.log('%s', finalOutput);
}

// Read the input from standard input (typically a file in competitive programming environments)
// using Node.js 'fs' module and pass it to the 'ProcessInput' function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
