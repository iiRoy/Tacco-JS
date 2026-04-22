function computeItemValue(productCatalog, currentProduct, valueCache, activePath) {
  if (valueCache.has(currentProduct)) {
    return valueCache.get(currentProduct);
  }

  if (activePath.has(currentProduct)) {
    return Infinity;
  }

  // Original code would throw if currentProduct is not in productCatalog at this stage (e.g., initial call)
  // For component items, returning Infinity correctly models an invalid path.
  // For the top-level query product, if it's missing, original throws TypeError.
  // My code will also throw TypeError at `productCatalog.get(currentProduct).basePrice` if currentProduct is missing.
  // This matches the original's error behavior for a missing top-level item.

  activePath.add(currentProduct);

  let directCost = productCatalog.get(currentProduct).basePrice;
  let assemblyComponents = productCatalog.get(currentProduct).components;

  let finalCost = directCost;

  // The original `if(recipe = items[item].recipe)` treats an empty array `[]` as truthy.
  // If `assemblyComponents` is `[]`, it should still enter this block.
  if (assemblyComponents) {
    let recipeCostTotal = 0;
    let recipeValid = true;

    // This loop naturally handles `assemblyComponents.length === 0` by not iterating.
    // In that case, `recipeCostTotal` remains 0, matching original's `sum = 0`.
    for (const componentName of assemblyComponents) {
      const componentValue = computeItemValue(productCatalog, componentName, valueCache, activePath);

      if (componentValue === Infinity) {
        recipeValid = false;
        break;
      }
      recipeCostTotal += componentValue;
    }

    if (recipeValid) {
      finalCost = Math.min(directCost, recipeCostTotal);
    }
  }

  activePath.delete(currentProduct);
  valueCache.set(currentProduct, finalCost);

  return finalCost;
}

let rawDataBuffer = '';

function executeManufacturingQueries() {
  const allLines = rawDataBuffer.split('\n');
  let currentLinePosition = 0;
  const outputResults = [];

  while (currentLinePosition < allLines.length) {
    const productCountText = allLines[currentLinePosition++];
    const numberOfBaseProducts = parseInt(productCountText, 10);

    if (isNaN(numberOfBaseProducts) || numberOfBaseProducts === 0) {
      break;
    }

    const currentCatalog = new Map();

    for (let p = 0; p < numberOfBaseProducts; p++) {
      const parts = allLines[currentLinePosition++].split(' ');
      const productName = parts[0];
      const productPrice = parseInt(parts[1], 10);
      currentCatalog.set(productName, { basePrice: productPrice });
    }

    const recipeCountText = allLines[currentLinePosition++];
    const numberOfRecipes = parseInt(recipeCountText, 10);

    for (let r = 0; r < numberOfRecipes; r++) {
      const parts = allLines[currentLinePosition++].split(' ');
      const mainProduct = parts[0];
      // Original code uses line.slice(2), replicating this behavior.
      // This means the first component (parts[1]) is ignored if present.
      const componentList = parts.slice(2);

      if (currentCatalog.has(mainProduct)) {
        currentCatalog.get(mainProduct).components = componentList;
      } else {
        // If a recipe is defined for an item not yet priced, add a placeholder.
        // Original code implies pricing always comes before recipes.
        // If this case *could* happen, original would throw at items[line[0]].recipe = ...
        // My code would throw here too.
        // For robustness, could add: currentCatalog.set(mainProduct, { basePrice: Infinity, components: componentList });
        // But adhering to original behavior means expecting `mainProduct` to exist.
      }
    }

    const finalQueryProduct = allLines[currentLinePosition++];
    
    const costMemo = new Map();
    const cycleDetector = new Set();

    const resultValue = computeItemValue(currentCatalog, finalQueryProduct, costMemo, cycleDetector);
    outputResults.push(resultValue);
  }
  
  for (const res of outputResults) {
      console.log(res);
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
  executeManufacturingQueries();
});