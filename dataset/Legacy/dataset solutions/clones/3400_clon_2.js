function ProcessData(rawData) {
  // Divide the incoming string into individual lines.
  rawData = rawData.split("\n");

  // Extract the numerical count from the first line of input.
  var countElements = parseInt(rawData[0]);

  // Initialize a primary array with the determined size.
  elementArray = new Array(countElements);

  // Split the second line of input into temporary string components.
  tempValues = rawData[1].split(" ");

  // Populate the primary array by converting temporary string components to integers.
  for (idx = 0; idx < countElements; idx++) {
    elementArray[idx] = parseInt(tempValues[idx]);
  }

  // Declare a variable for an intermediate result, which will be immediately superseded.
  var initialResult = 1;

  // Initialize a state tracking variable.
  var stateIndicator = 0;

  // Declare the variable that will hold the ultimate computed result.
  var finalResult = 0;

  // Initialize a counter variable, starting from one.
  var counterVar = 1;

  // Create a secondary array, filled with ones, its size determined by the first element of the primary array.
  bufferArray = new Array(elementArray[0]).fill(1);

  // Begin the main processing loop, iterating through the primary array from the second element.
  for (idx = 1; idx < countElements; idx++) {
    // If the state indicator is set to its third condition (2).
    if (stateIndicator == 2) {
      // Iterate through the secondary array.
      for (subIdx = 0; subIdx < bufferArray.length; subIdx++) {
        // Check if any element in the secondary array differs from its first element.
        if (bufferArray[subIdx] != bufferArray[0]) {
          stateIndicator = 1; // Transition state to the second condition (1).
          break; // Exit the inner loop prematurely.
        } else {
          stateIndicator = 0; // Otherwise, reset the state to its initial condition (0).
        }
      }
    }

    // Evaluate the relationship between the current and preceding elements in the primary array.
    if (elementArray[idx] > elementArray[idx - 1]) {
      // If the current element is greater, append '1's to the secondary array.
      for (subIdx = 0; subIdx < elementArray[idx] - elementArray[idx - 1]; subIdx++) {
        bufferArray.push(1);
        // If the state is not the initial condition (0), set it to the second condition (1).
        if (stateIndicator != 0) {
          stateIndicator = 1;
        }
      }
    } else if (stateIndicator == 0) {
      // If the state is the initial condition (0) and the current element is not greater.
      // Increment the value at a specific index within the secondary array.
      bufferArray[elementArray[idx] - 1] = bufferArray[elementArray[idx] - 1] + 1;
      // Truncate the secondary array to a new length.
      bufferArray = bufferArray.slice(0, elementArray[idx]);
      // If the secondary array's length is not one, update the state and increment the counter.
      if (bufferArray.length != 1) {
        stateIndicator = 1;
        counterVar++;
      }
    } else if (stateIndicator == 1) {
      // If the state is the second condition (1).
      // Truncate the secondary array to a new length.
      bufferArray = bufferArray.slice(0, elementArray[idx]);
      // Iterate backward through the secondary array.
      for (subIdx = elementArray[idx] - 1; subIdx >= 0; subIdx--) {
        // If an element matches the counter variable, reset it to one.
        if (bufferArray[subIdx] == counterVar) {
          bufferArray[subIdx] = 1;
        } else if (bufferArray[subIdx] != counterVar) {
          // If an element differs, increment it and transition the state to the third condition (2).
          bufferArray[subIdx] = bufferArray[subIdx] + 1;
          stateIndicator = 2;
          break; // Exit the inner loop.
        }
      }
    }
  }

  // After the primary loop concludes, determine the maximum value present in the secondary array.
  for (idx = 0; idx < bufferArray.length; idx++) {
    finalResult = Math.max(finalResult, bufferArray[idx]);
  }

  // Output the final computed result to the console, formatted as a string.
  console.log('%s', finalResult);
}

// This auxiliary function is intended for debugging within a browser environment.
function performDebug() {
  var rawData = document.getElementById("input").value;
  ProcessData(rawData);
}

// Invoke the main processing function, reading input from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
