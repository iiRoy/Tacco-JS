function ProcessData(rawData) {
  // Parse the first line of input to get elementCount and factorValue
  let elementCount = Number.parseInt(rawData.split('\n')[0].split(' ')[0]);
  let factorValue = Number.parseInt(rawData.split('\n')[0].split(' ')[1]);

  // Extract the second line of data
  const lineData = rawData.split('\n')[1];

  // Convert the space-separated string into an array of numbers
  const parsedArrayA = lineData.split(' ').map((currentValueA) => Number(currentValueA));

  // Create a doubled version of the array for later calculations
  const parsedArrayB = (lineData + ' ' + lineData).split(' ').map((currentValueB) => Number(currentValueB));

  // Initialize a flag to check if all elements in parsedArrayA are identical
  let isHomogeneous = false;
  for (let idx1 = 0; idx1 < parsedArrayA.length - 1; idx1++) {
    // If any adjacent elements are different, set the flag and break
    if (parsedArrayA[idx1] !== parsedArrayA[idx1 + 1]) {
      isHomogeneous = true;
      break;
    }
  }

  // If the array is homogeneous (all elements are the same), output 0 and exit
  if (!isHomogeneous) {
    console.log('0');
    return;
  } else {
    // Initialize an array to store cumulative inversion counts
    let cumulativeResults = [];
    // Initialize a counter for inversions
    let inversionCounter = 0;

    // Calculate inversions for the first array (parsedArrayA)
    // A pair (i, j) is an inversion if i < j and array[i] > array[j]
    for (let idx1 = 0; idx1 < parsedArrayA.length; idx1++) {
      for (let idx2 = idx1 + 1; idx2 < parsedArrayA.length; idx2++) {
        let firstElement = parsedArrayA[idx1];
        let secondElement = parsedArrayA[idx2];
        if (firstElement > secondElement) {
          inversionCounter++;
        }
      }
    }
    // Store the total inversions for parsedArrayA
    cumulativeResults.push(inversionCounter);

    // Reset the inversion counter for the second calculation
    inversionCounter = 0;

    // Calculate inversions for the doubled array (parsedArrayB)
    for (let idx1 = 0; idx1 < parsedArrayB.length; idx1++) {
      for (let idx2 = idx1 + 1; idx2 < parsedArrayB.length; idx2++) {
        let firstElement = parsedArrayB[idx1];
        let secondElement = parsedArrayB[idx2];
        if (firstElement > secondElement) {
          inversionCounter++;
        }
      }
    }
    // Store the total inversions for parsedArrayB
    cumulativeResults.push(inversionCounter);

    // This variable is not used further but kept for structural consistency.
    inversionCounter = 0;

    // Determine output based on the factorValue
    if (factorValue <= 2) {
      // If factorValue is 1 or 2, output the corresponding stored result
      console.log(cumulativeResults[factorValue - 1]);
    } else {
      // For factorValue greater than 2, calculate iteratively
      let iterationTracker = 2; // Start tracking iterations from 2

      while (iterationTracker !== factorValue) {
        // Calculate the next term using the previous two results
        const nextSumTerm = cumulativeResults[0] + cumulativeResults[1] + cumulativeResults[1];
        cumulativeResults.push(nextSumTerm); // Add the new term
        cumulativeResults.shift();           // Remove the oldest term
        iterationTracker++;                  // Increment the iteration counter
      }
      // Output the second element of the remaining cumulativeResults, modulo (10^9 + 7)
      console.log(cumulativeResults[1] % (1e9 + 7));
    }
  }
}

// Read input from stdin and pass it to the main processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));