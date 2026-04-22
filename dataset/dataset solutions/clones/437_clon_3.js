let incomingRawText = '';

function getLesserOfTwo(valA, valB) {
  if (valA < valB) {
    return valA;
  } else {
    return valB;
  }
}

function determineMinimalPrice(productCatalog, targetProductId, currentDependencyPath) {
  if (!currentDependencyPath) {
    currentDependencyPath = [];
  }

  const productDetails = productCatalog[targetProductId];
  if (!productDetails) {
    return Infinity;
  }

  let finalCalculatedCost = productDetails.price;
  const craftingPlan = productDetails.recipe;
  let accumulatedRecipeCost = 0;
  let hasValidCraftingPath = true;

  if (craftingPlan) {
    currentDependencyPath.push(targetProductId);
    accumulatedRecipeCost = 0;
    hasValidCraftingPath = true;

    for (let componentIdx = 0; componentIdx < craftingPlan.length; componentIdx++) {
      const requiredComponentId = craftingPlan[componentIdx];

      if (currentDependencyPath.includes(requiredComponentId)) {
        hasValidCraftingPath = false;
        break;
      }
      
      const componentCost = determineMinimalPrice(productCatalog, requiredComponentId, currentDependencyPath);
      if (componentCost === Infinity) {
          hasValidCraftingPath = false;
          break;
      }
      accumulatedRecipeCost += componentCost;
    }

    if (hasValidCraftingPath) {
      finalCalculatedCost = getLesserOfTwo(finalCalculatedCost, accumulatedRecipeCost);
    }
    
    currentDependencyPath.pop();
  }
  
  return finalCalculatedCost;
}

function orchestrateItemCostEvaluation() {
  const processedInputLines = incomingRawText.split('\n');
  let currentLinePointer = 0;
  const totalAvailableLines = processedInputLines.length;

  if (totalAvailableLines === 0 || (totalAvailableLines === 1 && processedInputLines[0].trim() === '')) {
      return;
  }

  while (currentLinePointer < totalAvailableLines) {
    let currentItemCatalog = {};
    
    const itemPriceCountStr = processedInputLines[currentLinePointer];
    currentLinePointer++;
    const numberOfItemsWithPrices = parseInt(itemPriceCountStr, 10);
    
    if (isNaN(numberOfItemsWithPrices)) {
        break;
    }
    if (numberOfItemsWithPrices === 0 && itemPriceCountStr.trim() === '0') {
        break;
    }

    const priceSectionEndLine = currentLinePointer + numberOfItemsWithPrices;
    if (priceSectionEndLine > totalAvailableLines) {
        break;
    }

    for (; currentLinePointer < priceSectionEndLine; currentLinePointer++) {
      const currentItemPriceLine = processedInputLines[currentLinePointer];
      if (!currentItemPriceLine) { // Handle empty lines
          continue;
      }
      const priceLineSegments = currentItemPriceLine.split(' ');
      if (priceLineSegments.length < 2) { // Ensure enough segments
          continue;
      }
      const itemName = priceLineSegments[0];
      const itemBasePriceStr = priceLineSegments[1];
      const parsedPrice = parseInt(itemBasePriceStr, 10);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
          continue;
      }
      currentItemCatalog[itemName] = { price: parsedPrice };
    }

    const recipeCountStr = processedInputLines[currentLinePointer];
    currentLinePointer++;
    const numberOfRecipes = parseInt(recipeCountStr, 10);

    if (isNaN(numberOfRecipes)) {
        break;
    }

    const recipeSectionEndLine = currentLinePointer + numberOfRecipes;
    if (recipeSectionEndLine > totalAvailableLines) {
        break;
    }

    for (; currentLinePointer < recipeSectionEndLine; currentLinePointer++) {
      const currentRecipeLine = processedInputLines[currentLinePointer];
      if (!currentRecipeLine) { // Handle empty lines
          continue;
      }
      const recipeLineSegments = currentRecipeLine.split(' ');
      if (recipeLineSegments.length < 1) { // Ensure at least item name
          continue;
      }
      const itemToCraft = recipeLineSegments[0];
      if (currentItemCatalog[itemToCraft]) {
          currentItemCatalog[itemToCraft].recipe = recipeLineSegments.slice(2);
      }
    }

    const finalTargetItem = processedInputLines[currentLinePointer];
    currentLinePointer++;

    if (finalTargetItem && currentItemCatalog[finalTargetItem]) {
        const minimalCost = determineMinimalPrice(currentItemCatalog, finalTargetItem, []);
        console.log(minimalCost);
    } else if (finalTargetItem) {
        console.log(Infinity);
    }
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
  incomingRawText += dataChunk;
});

process.stdin.on('end', function() {
  orchestrateItemCostEvaluation();
});