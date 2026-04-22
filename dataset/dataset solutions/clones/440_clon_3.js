// This module provides functionality to calculate the minimum cost of crafting an item,
// considering direct purchase price versus the cost of its components.
// It detects circular dependencies in crafting recipes.

/**
 * Determines the optimal (minimum) cost for a given product,
 * considering its direct purchase price or the sum of its recipe components.
 * This function is recursive and includes cycle detection.
 *
 * @param {object} productDefinitions - An object mapping product keys to their details
 *                                     (e.g., { 'itemA': { directPrice: 10, craftingComponents: ['itemB', 'itemC'] } }).
 * @param {string} currentProductIdentifier - The unique key of the product for which to calculate the cost.
 * @param {string[]} [activeRecursionStack=[]] - An array tracking products currently being processed in the recursion
 *                                             to prevent infinite loops in case of circular recipes.
 * @returns {number} The minimum cost of the specified product.
 * @throws {Error} If a product definition is invalid or a critical parsing error occurs.
 */
function determineOptimalCost(productDefinitions, currentProductIdentifier, activeRecursionStack = []) {
  let productDetails;
  let directPurchasePrice;
  let componentSumCost = 0;
  let recipeIsViable = true; // Flag to track if the current recipe path is valid

  try {
    // Attempt to retrieve details for the current product from the catalog
    productDetails = productDefinitions[currentProductIdentifier];
    if (!productDetails) {
      // Guard clause: Product not found in catalog, cannot determine cost.
      // This indicates a missing product that is either a component or a query.
      console.warn(`Warning: Product '${currentProductIdentifier}' referenced but not found in catalog. Assuming infinite cost.`);
      return Infinity; // Represents an uncraftable/unpurchasable item
    }

    directPurchasePrice = productDetails.directPrice;
    const productCraftingFormula = productDetails.craftingComponents;

    // Check if the product has a defined crafting recipe
    if (productCraftingFormula && productCraftingFormula.length > 0) {
      // Add the current product to the recursion stack to detect potential circular dependencies
      activeRecursionStack.push(currentProductIdentifier);

      // Iterate through each component required for the recipe
      for (const requiredComponent of productCraftingFormula) {
        // Check for two critical conditions that invalidate the recipe:
        // 1. Circular dependency: The component is already in the current recursion stack.
        // 2. Missing component: The component is not defined in the product catalog.
        if (activeRecursionStack.includes(requiredComponent) || !productDefinitions.hasOwnProperty(requiredComponent)) {
          recipeIsViable = false; // Mark the entire recipe as invalid
          // Log a more specific warning for debugging purposes
          if (activeRecursionStack.includes(requiredComponent)) {
            console.warn(`Circular dependency detected for '${currentProductIdentifier}' involving component '${requiredComponent}'.`);
          } else {
            console.warn(`Recipe for '${currentProductIdentifier}' requires unknown component '${requiredComponent}'.`);
          }
          break; // Stop processing this recipe, as it's invalid
        }
        // Recursively calculate the cost of each required component
        componentSumCost += determineOptimalCost(productDefinitions, requiredComponent, activeRecursionStack);
      }

      // If the recipe was found to be viable (no cycles, all components valid),
      // compare the direct purchase price with the calculated sum of component costs.
      if (recipeIsViable) {
        directPurchasePrice = getLesserValue(directPurchasePrice, componentSumCost);
      }

      // Remove the current product from the recursion stack as its processing is complete
      activeRecursionStack.pop();
    }
    // Return the determined optimal cost for the current product
    return directPurchasePrice;

  } catch (processingError) {
    // Catch any unexpected errors during calculation and log them with context.
    console.error(`An unhandled error occurred while processing product '${currentProductIdentifier}': ${processingError.message}`);
    // Re-throw a more informative error to propagate the failure.
    throw new Error(`Failed to calculate optimal cost for ${currentProductIdentifier}. Original error: ${processingError.message}`);
  }
}

/**
 * A utility function that returns the smaller of two numeric values.
 * This is a straightforward comparison.
 *
 * @param {number} valueOne - The first number for comparison.
 * @param {number} valueTwo - The second number for comparison.
 * @returns {number} The lesser of the two input numbers.
 */
function getLesserValue(valueOne, valueTwo) {
  return (valueOne < valueTwo) ? valueOne : valueTwo;
}

/**
 * Main function responsible for reading and parsing input data from standard input,
 * constructing the product catalog, and then calculating and printing the optimal
 * costs for specified query products.
 */
function processInputAndCalculate() {
  const allInputLines = collectedRawInput.split('\n');
  const totalInputLines = allInputLines.length;

  let currentLineIndex = 0;
  let productCatalog; // This object will store all product definitions for a given test case

  // Loop through the input data, processing blocks of prices, recipes, and queries
  while (currentLineIndex < totalInputLines) {
    productCatalog = {}; // Initialize a fresh catalog for each new test case block

    // --- Section 1: Read product direct prices ---
    const numPriceEntriesLine = allInputLines[currentLineIndex++];
    const numPriceEntries = parseInt(numPriceEntriesLine, 10);

    // Check for termination condition or invalid input for number of price entries
    if (isNaN(numPriceEntries) || numPriceEntriesLine.trim() === '' || numPriceEntries === 0) {
      // An empty line, non-numeric value, or '0' for the first count typically signals the end of input blocks.
      break;
    }

    const endPriceSectionIndex = currentLineIndex + numPriceEntries;

    // Process each line in the price section
    for (; currentLineIndex < endPriceSectionIndex; ++currentLineIndex) {
      const currentLine = allInputLines[currentLineIndex];
      if (!currentLine || !currentLine.trim()) { // Skip empty or whitespace-only lines
        console.warn(`Skipping empty line in price section at index ${currentLineIndex}.`);
        continue;
      }

      const lineSegments = currentLine.split(' ');
      // Validate the structure of a price entry line
      if (lineSegments.length < 2) {
        console.warn(`Skipping malformed price entry line (expected "Product Price"): "${currentLine}"`);
        continue;
      }
      const productName = lineSegments[0];
      const productPrice = parseInt(lineSegments[1], 10);

      // Validate the parsed price
      if (isNaN(productPrice) || productPrice < 0) {
        console.warn(`Skipping invalid price for product '${productName}' (value: '${lineSegments[1]}'). Price must be a non-negative number.`);
        continue;
      }
      // Add the product with its direct price to the catalog
      productCatalog[productName] = { directPrice: productPrice };
    }

    // --- Section 2: Read product crafting recipes ---
    const numRecipeEntriesLine = allInputLines[currentLineIndex++];
    const numRecipeEntries = parseInt(numRecipeEntriesLine, 10);

    // Handle invalid or negative number of recipe entries
    if (isNaN(numRecipeEntries) || numRecipeEntries < 0) {
      console.warn(`Invalid number of recipe entries specified: '${numRecipeEntriesLine}'. Skipping this recipe section.`);
      // Attempt to advance currentLineIndex past where recipe lines would have been if numRecipeEntries was valid
      currentLineIndex += (isNaN(numRecipeEntries) ? 0 : Math.max(0, numRecipeEntries));
    } else {
      const endRecipeSectionIndex = currentLineIndex + numRecipeEntries;

      // Process each line in the recipe section
      for (; currentLineIndex < endRecipeSectionIndex; ++currentLineIndex) {
        const currentLine = allInputLines[currentLineIndex];
        if (!currentLine || !currentLine.trim()) { // Skip empty or whitespace-only lines
          console.warn(`Skipping empty line in recipe section at index ${currentLineIndex}.`);
          continue;
        }

        const lineSegments = currentLine.split(' ');
        // Validate the structure of a recipe entry line
        if (lineSegments.length < 2) { // At least product name and one component
          console.warn(`Skipping malformed recipe entry line (expected "Product Component1 Component2 ..."): "${currentLine}"`);
          continue;
        }
        const productName = lineSegments[0];
        // All subsequent segments are considered components for the recipe
        const componentList = lineSegments.slice(1);

        // If a recipe is defined for a product not yet in the catalog, add a placeholder
        if (!productCatalog.hasOwnProperty(productName)) {
          console.warn(`Recipe for product '${productName}' encountered before its direct price. Adding with default price 0.`);
          productCatalog[productName] = { directPrice: 0 }; // Default price if not specified earlier
        }
        // Assign the list of components as the crafting formula for the product
        productCatalog[productName].craftingComponents = componentList;
      }
    }

    // --- Section 3: Process query for a specific item's cost ---
    // Ensure there is a line remaining for the query product key
    if (currentLineIndex < totalInputLines) {
      const queryProductKey = allInputLines[currentLineIndex++];
      if (!queryProductKey || !queryProductKey.trim()) {
        console.warn("Empty query product key encountered. Skipping cost calculation for this block.");
        continue; // Move to the next block if the query is empty
      }

      try {
        // Calculate the optimal cost for the queried product
        const calculatedOptimalCost = determineOptimalCost(productCatalog, queryProductKey);
        // Output the result to standard output
        console.log(calculatedOptimalCost);
      } catch (calculationError) {
        // Handle errors that occur during the cost calculation process
        console.error(`Calculation failed for query product '${queryProductKey}': ${calculationError.message}`);
        console.log("ERROR_CALCULATION"); // Indicate an error state in output
      }
    } else {
      // If no query line is left, it means we've reached the end of input data
      break;
    }
  }
}

// Global variable to accumulate raw input data from stdin
let collectedRawInput = '';

// Configure standard input stream handling
process.stdin.resume(); // Ensures the Node.js process stays alive to receive input
process.stdin.setEncoding('utf8'); // Sets the character encoding for the input stream

// Event listener: 'data' event fires when new input data is available
process.stdin.on('data', function(dataSegment) {
  collectedRawInput += dataSegment; // Appends each new data chunk to the buffer
});

// Event listener: 'end' event fires when the input stream has finished
process.stdin.on('end', function() {
  // Once all input has been collected, initiate the main processing logic
  processInputAndCalculate();
});