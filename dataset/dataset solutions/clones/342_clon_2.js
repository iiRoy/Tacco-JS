function primaryFunction() {
  // This nested function computes the minimum cost for a given weight.
  function calculateCost(weightInGrams) {
    let
      // Loop counters and temporary variables for pattern generation
      idx1, idx2, currentWeight, currentTotalWeight, currentCounts, patternEntry,
      // Stores the minimum calculated price found so far
      minimumPrice,
      // Temporary array to hold patterns during each iteration of the outer loop
      tempPatterns,
      // Main array to store all possible weight/count combinations
      allPatterns = [[0, []]]; // Initialize with a starting pattern: 0 weight, empty counts

    // Iterate through the three available weight categories (200g, 300g, 500g)
    // This loop builds up combinations of items from each category.
    for (idx1 = 0; idx1 < 3; idx1++) {
      currentWeight = [200, 300, 500][idx1]; // Get the weight for the current category
      tempPatterns = []; // Reset temporary patterns for this iteration

      // Process all existing patterns from the previous iteration
      // `shift()` removes and returns the first element, effectively processing the queue.
      while (patternEntry = allPatterns.shift()) {
        currentTotalWeight = patternEntry[0]; // Extract accumulated weight from the pattern
        currentCounts = patternEntry[1];     // Extract counts for each category from the pattern

        // Try adding different quantities of the current weight category
        // The loop continues as long as the total weight does not exceed the target.
        for (idx2 = 0; (idx2 * currentWeight) + currentTotalWeight <= weightInGrams; idx2++) {
          tempPatterns.push([
            (idx2 * currentWeight) + currentTotalWeight, // New total weight
            currentCounts.concat(idx2) // Append the count for the current category to existing counts
          ]);
        }
        // Add one more pattern where the current category count might exceed the target weight.
        // This ensures all combinations are considered, even if they go slightly over the required amount.
        tempPatterns.push([
          (idx2 * currentWeight) + currentTotalWeight,
          currentCounts.concat(idx2)
        ]);
      }
      allPatterns = tempPatterns; // Update the main patterns array for the next iteration
    }

    // After generating all possible patterns, we now find the minimum cost among them.
    allPatterns = tempPatterns; // Ensure allPatterns holds the final set of generated patterns
    minimumPrice = Infinity;    // Initialize minimum price to a very large value for comparison

    // Iterate through the final set of patterns to calculate and find the minimum price.
    while (patternEntry = allPatterns.shift()) {
      currentTotalWeight = patternEntry[0]; // Get the total weight for this specific pattern

      // Skip patterns where the total weight is less than the required weight.
      // We are only interested in patterns that meet or exceed the target weight.
      if (currentTotalWeight < weightInGrams) {
        continue;
      }

      currentCounts = patternEntry[1]; // Get the counts of each item type for this pattern

      // Calculate the price based on the counts and specific discount rules for each item type.
      // Item 1 (200g): Discount for every 5 items (20% off for the bundle).
      // Item 2 (300g): Discount for every 4 items (15% off for the bundle).
      // Item 3 (500g): Discount for every 3 items (12% off for the bundle).
      patternEntry = (
        (currentCounts[0] % 5) * 380 + (~~(currentCounts[0] / 5) * 5 * (380 * 0.8))
      ) + (
        (currentCounts[1] % 4) * 550 + (~~(currentCounts[1] / 4) * 4 * (550 * 0.85))
      ) + (
        (currentCounts[2] % 3) * 850 + (~~(currentCounts[2] / 3) * 3 * (850 * 0.88))
      );

      // Update the minimum price if the current pattern's calculated price is lower.
      minimumPrice = patternEntry < minimumPrice ? patternEntry : minimumPrice;
    }
    return minimumPrice; // Return the lowest calculated price found.
  }

  let
    processingFinished = false; // Flag to indicate if input processing should stop.

  // Process each line of input data received from stdin.
  rawData.forEach(function(inputLine) {
    // Skip empty lines or if the end-of-input signal has already been received.
    if (inputLine.trim() === '' || processingFinished) {
      return;
    }

    // If the input line is '0', it signals the end of valid input data.
    if (inputLine == 0) {
      processingFinished = true;
      return;
    }

    // Parse the input line as an integer (base 10) and calculate the cost,
    // then print the result to the console.
    console.log(calculateCost(parseInt(inputLine, 10)));
  });
}

let
  rawData = ''; // Global variable to accumulate all incoming data from stdin.

// Resume the standard input stream to start receiving data.
process.stdin.resume();
// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks received from stdin.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk; // Append each received data chunk to the rawData string.
});

// Event listener for the 'end' of the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines based on newline characters.
  rawData = rawData.split('\n');
  // Call the primary processing function to handle the parsed input.
  primaryFunction();
});
