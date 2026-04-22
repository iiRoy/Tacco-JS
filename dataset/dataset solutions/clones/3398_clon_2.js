// This function is designed to process a sequence of numerical data
function processData(rawData) {
  // Break down the entire input string into an array of individual lines
  rawData = rawData.split("\n");

  // Determine the primary array's capacity by parsing the initial input line
  let arrayCapacity = parseInt(rawData[0], 10);

  // Declare and initialize the main numerical collection
  const baseSequence = new Array(arrayCapacity);

  // Extract and parse the space-separated numbers from the second input line
  const interimValues = rawData[1].split(" ");

  // Populate the base sequence array with converted integer values
  for (let currentIdx = 0; currentIdx < arrayCapacity; currentIdx++) {
    baseSequence[currentIdx] = parseInt(interimValues[currentIdx], 10);
  }

  // Set up control variables for logic flow and final output
  let stateIndicator = 0; // Denotes the current processing phase or condition
  let finalResult = 0;   // Holds the computed outcome

  // Initialize a counter relevant to the algorithm's progression
  let currentCounter = 1;

  // Construct a dynamic array, initially sized by the first element of the base sequence
  // All elements are set to 1 by default
  let dynamicCollection = (new Array(baseSequence[0])).fill(1);

  // Begin iterating through the base sequence from its second element
  for (let currentIdx = 1; currentIdx < arrayCapacity; currentIdx++) {
    // Scenario 1: Current element is smaller than its predecessor
    if (baseSequence[currentIdx] < baseSequence[currentIdx - 1]) {
      // Truncate the dynamic collection to match the current element's value
      dynamicCollection = dynamicCollection.slice(0, baseSequence[currentIdx]);
    }

    // Scenario 2: If the state indicator is at its 'uniformity check' value (2)
    if (stateIndicator === 2) {
      // Examine each item within the dynamic collection for consistency
      for (let elementPos = 0; elementPos < dynamicCollection.length; elementPos++) {
        // If any element deviates from the first, update the state and exit this inner loop
        if (dynamicCollection[elementPos] !== dynamicCollection[0]) {
          stateIndicator = 1;
          break;
        } else {
          stateIndicator = 0; // Maintain 'uniform' state if elements match so far
        }
      }
    }

    // Scenario 3: Current element is greater than its predecessor
    if (baseSequence[currentIdx] > baseSequence[currentIdx - 1]) {
      // Append new elements (value 1) to the dynamic collection to extend its size
      for (let expansionCount = 0; expansionCount < baseSequence[currentIdx] - baseSequence[currentIdx - 1]; expansionCount++) {
        dynamicCollection.push(1);
        stateIndicator = 2; // Set indicator to 'extended' state
      }
    }
    // Scenario 4: If the state indicator is at its 'initial' value (0)
    else if (stateIndicator === 0) {
      // Increment a specific element in the dynamic collection
      dynamicCollection[baseSequence[currentIdx] - 1] = dynamicCollection[baseSequence[currentIdx] - 1] + 1;
      // Re-slice the dynamic collection to its current base sequence value
      dynamicCollection = dynamicCollection.slice(0, baseSequence[currentIdx]);
      // If the collection's length isn't one, adjust state and increment the main counter
      if (dynamicCollection.length !== 1) {
        stateIndicator = 1;
        currentCounter++;
      }
    }
    // Scenario 5: If the state indicator is at its 'modification' value (1)
    else if (stateIndicator === 1) {
      // Again, slice the dynamic collection based on the current base sequence value
      dynamicCollection = dynamicCollection.slice(0, baseSequence[currentIdx]);
      // Iterate backwards through the collection to perform updates
      for (let reverseIndex = baseSequence[currentIdx] - 1; reverseIndex >= 0; reverseIndex--) {
        // If an element matches the current counter, reset it to 1
        if (dynamicCollection[reverseIndex] === currentCounter) {
          dynamicCollection[reverseIndex] = 1;
        }
        // Otherwise, increment the element and switch the state indicator
        else if (dynamicCollection[reverseIndex] !== currentCounter) {
          dynamicCollection[reverseIndex] = dynamicCollection[reverseIndex] + 1;
          stateIndicator = 2;
          break; // Exit the reverse iteration
        }
      }
    }
  }

  // Assign the final value of the counter to the result variable
  finalResult = currentCounter;
  // Output the final computed result to the console
  console.log('%s', finalResult);
}

// Auxiliary function for local development or browser-based testing
function performTest() {
  // Retrieve input from a specified HTML element
  const testInput = document.getElementById("testInputField").value;
  // Invoke the main processing function with the test input
  processData(testInput);
}

// Standard entry point for execution, typically in a Node.js environment
// Reads content from a designated input source and passes it for processing
processData(require("node:fs").readFileSync("/input/source.txt", "unicodeEncoding"));