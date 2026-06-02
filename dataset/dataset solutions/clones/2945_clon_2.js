function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  // The first line is at index 0, the second at index 1, and so on.
  const linesOfData = rawData.split("\n");

  // Parse the first line to get the number of queries.
  const queryCount = parseInt(linesOfData[0], 10);

  // Initialize accumulators for values 'A' and 'B'.
  let totalValA = 0;
  let totalValB = 0;
  // Create an array to store all 'A' values encountered.
  const valuesACollection = [];

  // Iterate through each query, starting from the second line of input.
  for (let idx = 1; idx <= queryCount; idx++) {
    // Split the current line into parts based on spaces.
    const currentLineParts = linesOfData[idx].split(" ");

    // Check the type of query based on the first part of the line.
    if (currentLineParts[0] == 1) {
      // If the query type is '1', it's an insertion operation.
      // Parse the 'A' and 'B' values from the current line.
      const valA = parseInt(currentLineParts[1], 10);
      const valB = parseInt(currentLineParts[2], 10);

      // Add the parsed values to their respective totals.
      totalValA += valA;
      totalValB += valB;
      // Store the 'A' value in the collection.
      valuesACollection.push(valA);
    } else {
      // If the query type is not '1', it's a calculation and output operation.

      // Calculate the average of all 'A' values currently in the collection.
      const averageA = totalValA / valuesACollection.length;
      // Initialize the minimum squared distance and the corresponding 'A' value.
      // Start with the first element in the collection.
      let minimumDistance = (valuesACollection[0] - averageA) * (valuesACollection[0] - averageA);
      let bestValA = valuesACollection[0];

      // Iterate through the collection to find the 'A' value closest to the average.
      for (let k = 0; k < valuesACollection.length; k++) {
        // Calculate the squared distance for the current 'A' value.
        const currentDistance = (valuesACollection[k] - averageA) * (valuesACollection[k] - averageA);

        // If the current distance is smaller, update the minimum distance and best 'A' value.
        if (currentDistance < minimumDistance) {
          minimumDistance = currentDistance;
          bestValA = valuesACollection[k];
        } else if (currentDistance === minimumDistance) {
          // If distances are equal, choose the smaller 'A' value.
          bestValA = valuesACollection[k] < bestValA ? valuesACollection[k] : bestValA;
        }
      }

      // Initialize a variable to accumulate the final calculated sum.
      let calculatedSum = 0;
      // Iterate through the collection again to compute the sum based on the best 'A' value.
      for (let k = 0; k < valuesACollection.length; k++) {
        if (valuesACollection[k] <= bestValA) {
          // If the current 'A' value is less than or equal to the best 'A' value,
          // add the difference (current - best) to the sum.
          calculatedSum += valuesACollection[k] - bestValA;
        } else {
          // Otherwise, add the difference (best - current) to the sum.
          calculatedSum += -valuesACollection[k] + bestValA;
        }
      }

      // Output the best 'A' value and the calculated sum in the specified format.
      console.log('%d %d', bestValA, calculatedSum);
    }
  }
}

// This line should not be modified. It handles reading input and calling the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
