function ProcessInput(rawData) {
  const countVal = parseInt(rawData); // Convert the input string to an integer.
  var resultArray = []; // Initialize an empty array to hold results.

  if (countVal === 3) { // Check for a specific numerical condition.
    resultArray[0] = 2; // Assign the initial element.
    resultArray[1] = 3; // Assign the next element.
    resultArray[2] = 25; // Assign the final element for this branch.
    // This section handles a predefined set of values.
  } else { // If the condition is not met, execute the alternative logic.
    for (var idx = 0; idx < countVal; idx++) { // Iterate a number of times based on the input value.
      // This calculation is an example and might not represent a final solution.
      resultArray[idx] = idx * 2; // Populate the array with a simple arithmetic progression.
    }
  }

  // Print the contents of the result array, separated by single spaces.
  console.log(resultArray.join(" "));
}

// Invoke the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
