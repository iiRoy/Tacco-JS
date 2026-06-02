function primaryProcess() {
  // This function calculates the minimum cost for a given weight of an item.
  function calculateCost(weightInGrams) {
    let
      idx1, idx2, itemWeight, currentWeight, currentCombo, currentPrice,
      minimumPrice, temporaryCombinations,
      // Initialize with a base combination: 0 weight, empty array of counts
      allCombinations = [[0, []]];

    // Iterate through different item types (e.g., packages of different sizes)
    for (idx1 = 0; idx1 < 3; idx1++) {
      // Define the weight for the current item type
      itemWeight = [200, 300, 500][idx1];
      temporaryCombinations = []; // Prepare for new combinations

      // Process existing combinations
      while (currentPrice = allCombinations.shift()) {
        currentWeight = currentPrice[0]; // Current total weight
        currentCombo = currentPrice[1];   // Current counts of items

        // Explore adding more of the current item type
        for (idx2 = 0; (idx2 * itemWeight) + currentWeight <= weightInGrams; idx2++) {
          temporaryCombinations.push([(idx2 * itemWeight) + currentWeight, currentCombo.concat(idx2)]);
        }
        // The loop condition (idx2 * itemWeight) + currentWeight <= weightInGrams
        // means that after the loop, idx2 will be one step too far.
        // The original code adds one more combination with this 'too far' idx2.
        // This seems to be a specific logic to include combinations that exceed the target weight,
        // which are then filtered out later if they don't match exactly.
        temporaryCombinations.push([(idx2 * itemWeight) + currentWeight, currentCombo.concat(idx2)]);
      }
      allCombinations = temporaryCombinations; // Update combinations for the next iteration
    }

    // After processing all item types, filter and find the minimum price
    allCombinations = temporaryCombinations; // Ensure we use the final set of combinations
    minimumPrice = Infinity; // Initialize minimum price to a very large value

    // Iterate through all generated combinations
    while (currentPrice = allCombinations.shift()) {
      currentWeight = currentPrice[0]; // Total weight of this combination

      // Only consider combinations that exactly match the target weight
      if (currentWeight !== weightInGrams) {
        continue; // Skip if weight doesn't match
      }

      currentCombo = currentPrice[1]; // Item counts for this combination

      // Calculate the total price based on item counts and discounts
      // Item type 1: 200g packages (base price 380)
      // Item type 2: 300g packages (base price 550)
      // Item type 3: 500g packages (base price 850)
      currentPrice = ((currentCombo[0] % 5) * 380) + (~~(currentCombo[0] / 5) * 5 * (380 * 0.8))
                   + ((currentCombo[1] % 4) * 550) + (~~(currentCombo[1] / 4) * 4 * (550 * 0.85))
                   + ((currentCombo[2] % 3) * 850) + (~~(currentCombo[2] / 3) * 3 * (850 * 0.88));

      // Update minimum price if the current combination is cheaper
      minimumPrice = currentPrice < minimumPrice ? currentPrice : minimumPrice;
    }
    return minimumPrice; // Return the lowest calculated price
  }

  let
    finishedProcessing = false; // Flag to stop processing input lines

  // Process each line of input data
  receivedData.forEach(function(currentLine) {
    // Skip empty lines or if processing has finished
    if (currentLine.trim() === '' || finishedProcessing) {
      return;
    }
    // If a '0' is encountered, it signals the end of input
    if (currentLine == 0) {
      finishedProcessing = true;
      return;
    }
    // Parse the line as an integer and calculate the cost, then print it
    console.log(calculateCost(parseInt(currentLine, 10)));
  });
}

let
  receivedData = ''; // Global variable to accumulate input

// Set up standard input stream handling
process.stdin.resume(); // Keep the process alive
process.stdin.setEncoding('utf8'); // Expect UTF-8 encoded text

// Event listener for incoming data chunks
process.stdin.on('data', function(dataChunk) {
  receivedData += dataChunk; // Append data to the global buffer
});

// Event listener for end of input stream
process.stdin.on('end', function() {
  receivedData = receivedData.split('\n'); // Split accumulated data into lines
  primaryProcess(); // Start the main processing logic
});
