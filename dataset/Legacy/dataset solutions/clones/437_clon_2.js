function calculateCost(inventory, product, visitedProducts) {
  // Declare local variables for the function's scope
  let componentsList,
      unitCost = inventory[product].unitCost, // Initial cost from inventory
      totalComponentCost,
      isValidPath = false, // Flag to track if a valid recipe path is found
      componentIndex;

  // Initialize visitedProducts array if not provided (for initial call)
  visitedProducts = visitedProducts || [];

  // Check if the current product has a recipe (i.e., it's a composite item)
  if (componentsList = inventory[product].components) {
    visitedProducts.push(product); // Add current product to the visited list to detect cycles
    totalComponentCost = 0;
    isValidPath = true; // Assume valid path until a cycle is detected

    // Iterate through each component in the recipe
    for (componentIndex = 0; componentIndex < componentsList.length; componentIndex++) {
      // Check for circular dependencies
      if (visitedProducts.indexOf(componentsList[componentIndex]) !== -1) {
        isValidPath = false; // Cycle detected, this path is invalid
        break; // Exit loop as this recipe path is invalid
      }
      // Recursively calculate the cost of each component
      totalComponentCost += calculateCost(inventory, componentsList[componentIndex], visitedProducts);
    }

    // If no circular dependency was found in this path, update the unitCost
    if (isValidPath) {
      unitCost = getMin(unitCost, totalComponentCost); // Take the minimum of direct cost or recipe cost
    }
    visitedProducts.pop(); // Remove current product from visited list as we backtrack
  }

  // Return the calculated minimum cost for the product
  return unitCost;
}

function getMin(val1, val2) {
  // Returns the smaller of two values
  return val1 < val2 ? val1 : val2;
}

function processInputData() {
  let lineIterator,
      itemEndIndex,
      recipeEndIndex,
      currentLineParts,
      inputLength = rawData.length, // Total number of lines in the input
      inventory; // Object to store product inventory details

  // Loop through the input data, processing each test case
  for (lineIterator = 0; lineIterator < inputLength;) {
    inventory = {}; // Initialize inventory for the current test case

    // Read the number of items and calculate the end index for item definitions
    itemEndIndex = parseInt(rawData[lineIterator++], 10) + lineIterator;
    if (itemEndIndex === lineIterator) { // If N is 0, break the loop (end of input)
      break;
    }

    // Parse item definitions (product name and direct cost)
    for (; lineIterator < itemEndIndex; lineIterator++) {
      currentLineParts = rawData[lineIterator].split(' ');
      inventory[currentLineParts[0]] = { unitCost: parseInt(currentLineParts[1], 10) };
    }

    // Read the number of recipes and calculate the end index for recipe definitions
    recipeEndIndex = parseInt(rawData[lineIterator++], 10) + lineIterator;

    // Parse recipe definitions (product name and its components)
    for (; lineIterator < recipeEndIndex; lineIterator++) {
      currentLineParts = rawData[lineIterator].split(' ');
      // Assign the list of components to the product's recipe property
      inventory[currentLineParts[0]].components = currentLineParts.slice(2);
    }

    // After processing all items and recipes for a test case, calculate and print the cost
    // The next line in rawData contains the product for which the cost needs to be calculated
    console.log(calculateCost(inventory, rawData[lineIterator++]));
  }
}

let rawData = ''; // Accumulator for all incoming standard input data

// Set up standard input stream handling
process.stdin.resume(); // Keep the process alive while waiting for input
process.stdin.setEncoding('utf8'); // Specify character encoding for input

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk; // Append each chunk of data to the rawData string
});

// Event listener for 'end' of stdin stream
process.stdin.on('end', function() {
  // Once all input is received, split it into lines
  rawData = rawData.split('\n');
  // Call the main processing function
  processInputData();
});
