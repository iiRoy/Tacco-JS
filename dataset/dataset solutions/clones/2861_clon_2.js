// Function to parse raw text data into a structured array
function processTextData (rawData , convertToInts ) {
  // Default the conversion flag if not provided
  if ( typeof convertToInts === 'undefined' ) { convertToInts = false ; }
  
  let parsedLines = []; // Array to store processed lines
  const textLines = rawData.split('\n'); // Split input by newline characters

  // Iterate over each line of the input
  for ( let idx = 0; idx < textLines.length; idx += 1 ) {
    if ( convertToInts ) {
      // If conversion to integers is requested, split by space and parse each part
      parsedLines.push(textLines[idx].split(' ').map(val => Number.parseInt(val, 10)));
    }
    else {
      // Otherwise, just split the line by space
      parsedLines.push(textLines[idx].split(' '));
    }
  }
  return parsedLines; // Return the fully parsed data
}

// Helper function to create and initialize a dynamic programming array
function initializeDynamicArray(arraySize, initialValue) {
  // Create an array of size arraySize + 2 (for 0-based indexing and potential offsets)
  // and fill it with the specified initial value.
  return Array(arraySize + 2).fill(initialValue);
}

/*
 * This function attempts to update a variable 'currentVal' to 'candidateVal'
 * if 'candidateVal' is smaller than 'currentVal'.
 * Note: In JavaScript, primitive types are passed by value,
 * so this function will only modify its local copy of 'currentVal'.
 * For external effect, it would need to return the new minimum or operate on an object property.
 */
function updateMinimum (currentVal, candidateVal) {
  if ( currentVal > candidateVal ) {
    currentVal = candidateVal;
  }
}

// Similar to updateMinimum, but for maximum value.
function updateMaximum ( currentVal , candidateVal ) {
  if ( currentVal < candidateVal ) { currentVal = candidateVal; }
}


// Main execution function for the problem solution
function executeSolution (problemData) {
  // Parse the input data, converting all elements to integers
  const processedDataMatrix = processTextData(problemData, true);
  
  // Extract the total number of elements from the first line, first item
  const totalElements = processedDataMatrix[0][0];
  
  // Collect 'forbidden' or 'blocked' indices from subsequent lines
  let forbiddenElements = [];
  for ( let k = 1; k < processedDataMatrix.length; k++ ) {
    forbiddenElements.push(processedDataMatrix[k][0]);
  }
    
  // Initialize the dynamic programming array.
  // The size is totalElements + 2, filled with zeros.
  let dynamicProgrammingArray = initializeDynamicArray(totalElements, 0);
  dynamicProgrammingArray[0] = 1; // Base case: one way to reach position 0

  // Iterate through each step from 1 up to totalElements
  for ( let step = 1; step <= totalElements; step++ ) {
    // Check if the current step is a forbidden element
    if ( forbiddenElements.length > 0 && forbiddenElements[0] === step ) {
      forbiddenElements.shift(); // Remove the forbidden element once processed
      continue; // Skip calculations for forbidden steps
    }
    
    // Calculate the number of ways to reach the current step
    // Add ways from the previous step
    dynamicProgrammingArray[step] += dynamicProgrammingArray[step - 1];
    
    // If step is at least 2, also add ways from two steps back
    if ( step >= 2 ) {
      dynamicProgrammingArray[step] += dynamicProgrammingArray[step - 2];
    }
    
    // Apply modulo operation to prevent integer overflow
    dynamicProgrammingArray[step] %= 1000000007;
  }

  // Output the final result: number of ways to reach the totalElements position
  console.log(dynamicProgrammingArray[totalElements]);
}

// Read input from standard input and execute the main solution
executeSolution(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));