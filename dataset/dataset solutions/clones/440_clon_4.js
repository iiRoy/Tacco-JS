function determineOptimalCost(itemIdentifier, itemRegistry, pathTracker, costCache) {
  try {
    if (costCache.has(itemIdentifier)) {
      return costCache.get(itemIdentifier);
    }

    const itemData = itemRegistry.get(itemIdentifier);
    // If itemData is undefined, accessing .price or .recipe will throw,
    // replicating original behavior for non-existent items.
    let currentPrice = itemData.price;
    const itemRecipe = itemData.recipe;

    if (itemRecipe) {
      if (pathTracker.has(itemIdentifier)) {
        // Cycle detected for this item in the current path.
        // The recipe for this item cannot be used, so return its direct price.
        return currentPrice;
      }

      pathTracker.add(itemIdentifier); // Mark as visited in current path

      let recipeSum = 0;
      let recipePathValid = true;

      for (const component of itemRecipe) {
        if (pathTracker.has(component) || !itemRegistry.has(component)) {
          // Component causes a cycle or doesn't exist.
          // The entire recipe path for itemIdentifier is invalid.
          recipePathValid = false;
          break;
        }
        recipeSum += determineOptimalCost(component, itemRegistry, pathTracker, costCache);
      }

      pathTracker.delete(itemIdentifier); // Remove from current path

      if (recipePathValid) {
        currentPrice = Math.min(currentPrice, recipeSum);
      }
    }

    costCache.set(itemIdentifier, currentPrice);
    return currentPrice;

  } catch (e) {
    // Replicate original error handling
    throw [e, itemRegistry, itemIdentifier];
  }
}

function processInputData() {
  const inputLines = input.split('\n');
  let currentLineIndex = 0;
  const outputBuffer = [];

  while (currentLineIndex < inputLines.length) {
    const lineContent = inputLines[currentLineIndex];
    if (lineContent === undefined || lineContent.trim() === '') {
      break; // End of input or empty line
    }

    const numPriceDefinitions = parseInt(lineContent, 10);
    currentLineIndex++;

    if (numPriceDefinitions === 0) {
      break; // As per original logic, N=0 means end of all test cases.
    }

    const itemRegistry = new Map();
    const costCache = new Map(); // Cache per test case

    for (let i = 0; i < numPriceDefinitions; i++) {
      const parts = inputLines[currentLineIndex++].split(' ');
      itemRegistry.set(parts[0], { price: parseInt(parts[1], 10) });
    }

    const numRecipeDefinitions = parseInt(inputLines[currentLineIndex++], 10);
    for (let i = 0; i < numRecipeDefinitions; i++) {
      const parts = inputLines[currentLineIndex++].split(' ');
      const itemName = parts[0];
      // Original would throw if item doesn't exist before adding recipe.
      // Replicate this by letting .get() return undefined and then accessing .recipe.
      itemRegistry.get(itemName).recipe = parts.slice(2);
    }

    const queryItem = inputLines[currentLineIndex++];
    const pathTracker = new Set(); // Path tracker per query
    outputBuffer.push(determineOptimalCost(queryItem, itemRegistry, pathTracker, costCache));
  }

  outputBuffer.forEach(result => console.log(result));
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  processInputData();
});
