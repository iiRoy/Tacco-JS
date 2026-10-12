function calculateCost(productCatalog, productName, visitedProducts) {
  // This function determines the minimum cost to acquire a product,
  // considering its direct purchase price or the cost of its components.
  try {
    let
      componentList, // Holds the list of components if the product has a recipe
      currentPrice = productCatalog[productName].price, // Initial price is the direct purchase price
      totalComponentCost, // Accumulates the cost of all components
      isValidRecipe = false, // Flag to check if all recipe components are valid and not circular
      componentIndex; // Loop counter for iterating through recipe components

    // Initialize the visited products array if not provided (for the initial call)
    visitedProducts = visitedProducts || [];

    // Check if the current product has a recipe defined
    if (componentList = productCatalog[productName].recipe) {
      // Add the current product to the visited list to detect circular dependencies
      visitedProducts.push(productName);
      totalComponentCost = 0; // Reset component cost for this product
      isValidRecipe = true; // Assume recipe is valid until proven otherwise

      // Iterate through each component required for the product's recipe
      for (componentIndex = 0; componentIndex < componentList.length; componentIndex++) {
        const currentComponent = componentList[componentIndex];
        // Check for circular dependency or if a component is not defined in the catalog
        if (visitedProducts.indexOf(currentComponent) !== -1 || !(currentComponent in productCatalog)) {
          isValidRecipe = false; // Mark recipe as invalid
          break; // Stop processing this recipe
        }
        // Recursively calculate the cost of the current component and add to total
        totalComponentCost += calculateCost(productCatalog, currentComponent, visitedProducts);
      }

      // If the recipe was valid (no circular dependencies or missing components)
      if (isValidRecipe) {
        // Update the product's price if the component cost is lower
        currentPrice = findMinimum(currentPrice, totalComponentCost);
      }
      // Remove the current product from the visited list as its subtree has been processed
      visitedProducts.pop();
    }
  } catch (err) {
    // Catch any errors during processing and re-throw with context
    throw [err, productCatalog, productName];
  }

  // Return the determined minimum price for the product
  return currentPrice;
}

// Helper function to find the minimum of two numbers
function findMinimum(valA, valB) {
  return valA < valB ? valA : valB;
}

// Main execution logic for processing input data
function executeProcessing() {
  let
    lineIterator, // Iterator for input lines
    productCountEnd, // Marks the end index for product definitions
    recipeCountEnd, // Marks the end index for recipe definitions
    inputLineParts, // Array to hold parts of a split input line
    totalInputLines = rawData.length, // Total number of lines in the input
    productCatalog; // Object to store product details (price, recipe)

  // Loop through the input data, processing sets of products and recipes
  for (lineIterator = 0; lineIterator < totalInputLines;) {
    productCatalog = {}; // Initialize a new product catalog for each test case

    // Read the number of products for the current test case
    productCountEnd = parseInt(rawData[lineIterator++], 10) + lineIterator;
    // If productCountEnd equals lineIterator, it means the count was 0, so break
    if (productCountEnd === lineIterator) break;

    // Process product definitions (name and direct price)
    for (; lineIterator < productCountEnd; lineIterator++) {
      inputLineParts = rawData[lineIterator].split(' ');
      productCatalog[inputLineParts[0]] = {
        price: parseInt(inputLineParts[1], 10)
      };
    }

    // Read the number of recipes for the current test case
    recipeCountEnd = parseInt(rawData[lineIterator++], 10) + lineIterator;
    // Process recipe definitions (product name and its components)
    for (; lineIterator < recipeCountEnd; lineIterator++) {
      inputLineParts = rawData[lineIterator].split(' ');
      // Assign the slice of the array (components) as the recipe
      productCatalog[inputLineParts[0]].recipe = inputLineParts.slice(2);
    }

    // After processing all products and recipes for a test case,
    // calculate and print the cost of the target product.
    console.log(calculateCost(productCatalog, rawData[lineIterator++]));
  }
}

// Global variable to accumulate raw input data
let
  rawData = '';

// Set up standard input stream handlers
process.stdin.resume(); // Keep the process alive while waiting for input
process.stdin.setEncoding('utf8'); // Specify input encoding

// Event listener for incoming data chunks
process.stdin.on('data', function(chunk) {
  rawData += chunk; // Append each chunk to the rawData string
});

// Event listener for the end of the input stream
process.stdin.on('end', function() {
  rawData = rawData.split('\n'); // Split the accumulated data into an array of lines
  executeProcessing(); // Start the main processing logic
});
