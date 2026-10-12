function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  let processedLines = rawData.split('\n');

  // Parse the first line to get the number of elements.
  const countElements = parseInt(processedLines[0], 10);

  // Initialize an array to store the parsed data.
  let dataArray = new Array(countElements);

  // Split the second line into parts and parse them into integers.
  const tempParts = processedLines[1].split(' ');
  for (let idx = 0; idx < countElements; idx++) {
    dataArray[idx] = parseInt(tempParts[idx], 10);
  }

  // Initialize variables for the algorithm's state.
  let stateIndicator = 0;
  let finalResult = 0; // This variable will hold the final computed value.
  let currentValue = 1; // A counter or value tracker.

  // Initialize a working list based on the first element of the data array.
  let workingList = new Array(dataArray[0]).fill(1);

  // Iterate through the data array starting from the second element.
  for (let idx = 1; idx < countElements; idx++) {
    // If the current element is less than the previous one, truncate the working list.
    if (dataArray[idx] < dataArray[idx - 1]) {
      workingList = workingList.slice(0, dataArray[idx]);
    }

    // Check a specific state condition.
    if (stateIndicator === 2) {
      // Iterate through the working list to check for uniformity.
      for (let subIdx = 0; subIdx < workingList.length; subIdx++) {
        if (workingList[subIdx] !== workingList[0]) {
          stateIndicator = 1; // Change state if not uniform.
          break;
        } else {
          stateIndicator = 0; // Reset state if uniform.
        }
      }
    }

    // Handle cases based on the comparison of current and previous elements.
    if (dataArray[idx] > dataArray[idx - 1]) {
      // If current is greater, extend the working list.
      for (let subIdx = 0; subIdx < dataArray[idx] - dataArray[idx - 1]; subIdx++) {
        workingList.push(1);
        stateIndicator = 2; // Set state to 2.
      }
    } else if (stateIndicator === 0) {
      // If state is 0, increment a specific element in the working list and truncate.
      workingList[dataArray[idx] - 1] = workingList[dataArray[idx] - 1] + 1;
      workingList = workingList.slice(0, dataArray[idx]);
      if (workingList.length !== 1) {
        stateIndicator = 1; // Change state if list length is not 1.
        currentValue++; // Increment the value tracker.
      }
    } else if (stateIndicator === 1) {
      // If state is 1, truncate the working list and adjust its elements.
      workingList = workingList.slice(0, dataArray[idx]);
      for (let subIdx = dataArray[idx] - 1; subIdx >= 0; subIdx--) {
        if (workingList[subIdx] === currentValue) {
          workingList[subIdx] = 1; // Reset element if it matches the tracker.
        } else if (workingList[subIdx] !== currentValue) {
          workingList[subIdx] = workingList[subIdx] + 1; // Increment and change state.
          stateIndicator = 2;
          break;
        }
      }
    }
  }

  // Assign the final value of the tracker to the result variable.
  finalResult = currentValue;
  // Output the final result to the console.
  console.log('%s', finalResult);
}

// This function is for debugging purposes, typically used in a browser environment.
function debug() {
  const debugInput = document.getElementById("input").value;
  ProcessInput(debugInput);
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
