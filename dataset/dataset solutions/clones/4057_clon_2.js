/*
 * This routine processes the entire provided raw data.
 */
function ProcessInput(rawData) {
  let textLines = rawData.split('\n'); // Divide the raw data into individual lines
  let segments = textLines[0].split(' '); // Split the first line into distinct parts
  const countA = Number(segments[0]); // Convert the first segment to a numerical count
  const countB = Number(segments[1]); // Convert the second segment to another numerical count

  let leftIndices = []; // Initialize an array to store left boundary indicators
  let rightIndices = []; // Initialize an array to store right boundary indicators
  let distances = []; // Initialize an array to store calculated distances
  
  for (let idx = 1; idx <= countB; idx++) { // Iterate through the subsequent data lines
    const currentParts = textLines[idx].split(' '); // Split the current line into its component parts
    leftIndices.push(Number(currentParts[0])); // Store the converted first part into the left indicators array
    rightIndices.push(Number(currentParts[1])); // Store the converted second part into the right indicators array
    distances.push(Number(currentParts[2])); // Store the converted third part into the distances array

    // Check for an invalid condition where left and right indicators are identical
    if (Number(currentParts[0]) === Number(currentParts[1])) {
      console.log('No'); // Output 'No' to indicate an invalid state
      return false; // Terminate execution, as the condition is not met
    }
  }

  let positions = []; // An array to track the determined positions of elements
  let resultStatus; // Variable to hold the final outcome ('Yes' or 'No')
  let maxPosition = 1; // Tracks the maximum calculated position, initialized to 1

  processingLoop: // Label for the main data processing loop
  for (let k = 0; k < countB; k++) {
    if (k === 0) {
      positions[leftIndices[k] - 1] = 1; // For the first iteration, set the initial position
    }
    
    // Calculate the expected position for the right indicator based on the left and distance
    const calculatedRightPosition = positions[leftIndices[k] - 1] + distances[k];
    
    // Update the maximum observed position if the current calculated position is greater
    if (maxPosition <= calculatedRightPosition) {
      maxPosition = calculatedRightPosition;
    }

    // Check if the right indicator's position has already been established
    if (!positions[rightIndices[k] - 1]) {
      positions[rightIndices[k] - 1] = calculatedRightPosition; // If not, establish it
    } else {
      // If already established, verify consistency
      if (positions[rightIndices[k] - 1] !== calculatedRightPosition) {
        resultStatus = 'No'; // Inconsistency detected, set result to 'No'
        break processingLoop; // Exit the loop immediately
      }
    }
  }

  // Final check: if the overall maximum position exceeds a predefined limit
  if (maxPosition - 1 > 1000000001) {
    resultStatus = 'No'; // Set the status to 'No' if the limit is exceeded
  }
  
  // If no inconsistencies were found and no limits exceeded, default to 'Yes'
  if (!resultStatus) {
    resultStatus = 'Yes';
  }

  console.log(resultStatus); // Display the final determination
}

/*
 * The following code segment is responsible for handling standard input/output.
 * It should remain unaltered to ensure proper execution environment interaction.
 */
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));