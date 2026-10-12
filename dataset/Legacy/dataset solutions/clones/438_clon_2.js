function calculateCost(productData, productName, visitedProducts) {
  try {
    let componentList,
      currentPrice = productData[productName].cost,
      totalComponentCost,
      isCyclicFree = false,
      idx;

    // Initialize visited products array if not provided
    visitedProducts = visitedProducts || [];

    // console.log(productName, visitedProducts); // Debugging line, kept commented

    // Check if the product has a recipe (components)
    if ((componentList = productData[productName].components)) {
      visitedProducts.push(productName); // Add current product to visited list
      totalComponentCost = 0;
      isCyclicFree = true; // Assume no cycle initially for this path

      // Iterate through components in the recipe
      for (idx = 0; idx < componentList.length; idx++) {
        // If a component is already in the visited list, it's a cycle
        if (visitedProducts.indexOf(componentList[idx]) !== -1) {
          isCyclicFree = false; // Mark as cyclic
          break; // Exit loop, cannot calculate sum for this path
        }
        // Recursively calculate cost for the component and add to total
        totalComponentCost += calculateCost(productData, componentList[idx], visitedProducts);
      }

      // If no cycle was detected, update the price if the component cost is lower
      if (isCyclicFree) {
        currentPrice = findMinimum(currentPrice, totalComponentCost);
      }

      visitedProducts.pop(); // Remove current product from visited list upon returning
    }
  } catch (err) {
    // If an error occurs (e.g., product not found), re-throw the product name
    throw productName;
  }
  return currentPrice; // Return the calculated or original price
}

// Helper function to determine the smaller of two values
function findMinimum(valA, valB) {
  return valA < valB ? valA : valB;
}

// Main processing function for input data
function processInputData() {
  let lineIndex,
    numItemsEndIndex,
    numRecipesEndIndex,
    currentLineParts,
    inputLength = inputLines.length,
    allProducts;

  // Loop through the input lines
  for (lineIndex = 0; lineIndex < inputLength; ) {
    allProducts = {}; // Initialize product data for each test case

    // Read number of items and calculate end index for item definitions
    numItemsEndIndex = parseInt(inputLines[lineIndex++], 10) + lineIndex;

    // If no items are specified, break the loop (end of input)
    if (numItemsEndIndex === lineIndex) break;

    // Parse item definitions (product name and base cost)
    for (; lineIndex < numItemsEndIndex; lineIndex++) {
      currentLineParts = inputLines[lineIndex].split(' ');
      allProducts[currentLineParts[0]] = {
        cost: parseInt(currentLineParts[1], 10),
      };
    }

    // Read number of recipes and calculate end index for recipe definitions
    numRecipesEndIndex = parseInt(inputLines[lineIndex++], 10) + lineIndex;

    // Parse recipe definitions (product name and its components)
    for (; lineIndex < numRecipesEndIndex; lineIndex++) {
      currentLineParts = inputLines[lineIndex].split(' ');
      // Store components as an array, starting from the third element
      allProducts[currentLineParts[0]].components = currentLineParts.slice(2);
    }

    // console.log(allProducts); // Debugging line, kept commented

    // Calculate and print the minimum cost for the target product
    console.log(calculateCost(allProducts, inputLines[lineIndex++]));
  }
}

// Global variable to accumulate raw input
let inputBuffer = '';

// Set up standard input stream handling
process.stdin.resume(); // Keep the process alive
process.stdin.setEncoding('utf8'); // Expect UTF-8 encoded input

// Event listener for incoming data chunks
process.stdin.on('data', function (dataChunk) {
  inputBuffer += dataChunk; // Append data to the buffer
});

// Event listener for end of input stream
process.stdin.on('end', function () {
  // Split the accumulated input into an array of lines
  inputLines = inputBuffer.split('\n');
  processInputData(); // Start processing the input
});
