function ProcessInput(rawData) {
  // Parse the first line of input to get two integer values
  let firstLineParts = rawData.split("\n")[0].split(" ");
  let firstNum = parseInt(firstLineParts[0]); // Corresponds to N
  let secondNum = parseInt(firstLineParts[1]); // Corresponds to K

  // Extract the second line of input, which contains space-separated numbers
  let dataLine = rawData.split("\n")[1];

  // Create an array from the second line, converting string numbers to actual numbers
  let singleArray = dataLine.split(" ").map((item) => Number(item));

  // Create a doubled array by concatenating the dataLine with itself
  // This is used for calculating inversions over a repeated sequence
  let doubleArray = (dataLine + " " + dataLine).split(" ").map((item) => Number(item));

  // A flag to check if all elements in the single array are identical
  let isVaried = false;
  for (let idx1 = 0; idx1 < singleArray.length - 1; idx1++) {
    if (singleArray[idx1] !== singleArray[idx1 + 1]) {
      isVaried = true; // Found at least two different elements
      break;
    }
  }

  // If all elements are the same, the number of inversions is 0
  if (!isVaried) {
    console.log("0");
    return; // Exit the function early
  } else {
    // This array will store the inversion counts for different scenarios
    let inversionCounts = [];
    let currentInversions = 0; // Temporary variable to hold inversion count

    // Calculate inversions for the single array
    for (let idx1 = 0; idx1 < singleArray.length; idx1++) {
      for (let idx2 = idx1 + 1; idx2 < singleArray.length; idx2++) {
        let valA = singleArray[idx1];
        let valB = singleArray[idx2];
        if (valA > valB) {
          currentInversions++; // Increment if an inversion is found
        }
      }
    }
    inversionCounts.push(currentInversions); // Store the count for the single array

    currentInversions = 0; // Reset for the next calculation

    // Calculate inversions for the doubled array
    for (let idx1 = 0; idx1 < doubleArray.length; idx1++) {
      for (let idx2 = idx1 + 1; idx2 < doubleArray.length; idx2++) {
        let valA = doubleArray[idx1];
        let valB = doubleArray[idx2];
        if (valA > valB) {
          currentInversions++; // Increment if an inversion is found
        }
      }
    }
    inversionCounts.push(currentInversions); // Store the count for the doubled array

    currentInversions = 0; // Reset, though not strictly necessary here

    // Determine the final output based on the value of secondNum (K)
    if (secondNum <= 2) {
      // If K is 1 or 2, output the corresponding pre-calculated inversion count
      console.log(inversionCounts[secondNum - 1]);
    } else {
      // If K is greater than 2, perform an iterative calculation
      let iterationCounter = 2;
      while (iterationCounter !== secondNum) {
        // Calculate the next inversion count based on the pattern
        // This pattern seems to be (inversions_for_single_array + inversions_for_double_array + inversions_for_double_array)
        let nextSum = inversionCounts[0] + inversionCounts[1] + inversionCounts[1];
        inversionCounts.push(nextSum); // Add the new count to the end
        inversionCounts.shift(); // Remove the oldest count from the beginning
        iterationCounter++; // Move to the next iteration
      }
      // Output the final calculated inversion count modulo (10^9 + 7)
      console.log(inversionCounts[1] % (1e9 + 7));
    }
  }
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
