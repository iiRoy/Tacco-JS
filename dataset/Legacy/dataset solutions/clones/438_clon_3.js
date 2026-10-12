const getMinValue = (valueOne, valueTwo) => {
  if (typeof valueOne !== 'number' || isNaN(valueOne)) {
    return valueTwo;
  }
  if (typeof valueTwo !== 'number' || isNaN(valueTwo)) {
    return valueOne;
  }
  return valueOne < valueTwo ? valueOne : valueTwo;
};

const calculateComponentCost = (productCatalog, currentProductKey, visitedProductSet = new Set()) => {
  if (!productCatalog || !productCatalog.has(currentProductKey)) {
    throw new Error(`Product '${currentProductKey}' not found in catalog.`);
  }

  const productDetails = productCatalog.get(currentProductKey);
  let minimumAcquisitionCost = productDetails.price;

  const componentList = productDetails.recipe;

  if (componentList && componentList.length > 0) {
    if (visitedProductSet.has(currentProductKey)) {
      return minimumAcquisitionCost;
    }

    visitedProductSet.add(currentProductKey);

    let aggregatedRecipeCost = 0;
    let isRecipeFeasible = true;

    for (const subComponentKey of componentList) {
      try {
        aggregatedRecipeCost += calculateComponentCost(productCatalog, subComponentKey, visitedProductSet);
      } catch (error) {
        console.error(`Error calculating cost for sub-component '${subComponentKey}' of '${currentProductKey}': ${error.message}`);
        isRecipeFeasible = false;
        break;
      }
    }

    if (isRecipeFeasible) {
      minimumAcquisitionCost = getMinValue(minimumAcquisitionCost, aggregatedRecipeCost);
    }

    visitedProductSet.delete(currentProductKey);
  }

  return minimumAcquisitionCost;
};

const safeParseInt = (strValue, radix = 10) => {
  const parsed = parseInt(strValue, radix);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number format: '${strValue}'`);
  }
  return parsed;
};

const processInputData = (processedInputLines) => {
  let currentLineIndex = 0;
  const totalInputLines = processedInputLines.length;

  while (currentLineIndex < totalInputLines) {
    const productCatalog = new Map();

    const numberOfProductsString = processedInputLines[currentLineIndex++];
    if (!numberOfProductsString) {
      break;
    }
    const productDefinitionsEndIndex = safeParseInt(numberOfProductsString) + currentLineIndex;

    if (productDefinitionsEndIndex === currentLineIndex) {
      break;
    }

    while (currentLineIndex < productDefinitionsEndIndex) {
      const currentLine = processedInputLines[currentLineIndex++];
      if (!currentLine) {
        console.error(`Warning: Empty line encountered while expecting product definition at line ${currentLineIndex - 1}. Skipping.`);
        continue;
      }
      const parsedLine = currentLine.split(' ');
      const [productName, priceString] = parsedLine;

      if (!productName || !priceString) {
        console.error(`Invalid product definition format: '${currentLine}'. Skipping.`);
        continue;
      }

      try {
        const productPrice = safeParseInt(priceString);
        productCatalog.set(productName, { price: productPrice });
      } catch (error) {
        console.error(`Error processing product '${productName}' from line '${currentLine}': ${error.message}. Skipping.`);
      }
    }

    const numberOfRecipesString = processedInputLines[currentLineIndex++];
    if (!numberOfRecipesString) {
      break;
    }
    const recipeDefinitionsEndIndex = safeParseInt(numberOfRecipesString) + currentLineIndex;

    while (currentLineIndex < recipeDefinitionsEndIndex) {
      const currentLine = processedInputLines[currentLineIndex++];
      if (!currentLine) {
        console.error(`Warning: Empty line encountered while expecting recipe definition at line ${currentLineIndex - 1}. Skipping.`);
        continue;
      }
      const parsedLine = currentLine.split(' ');
      const [productName, , ...recipeComponents] = parsedLine;

      if (!productName || !productCatalog.has(productName)) {
        console.error(`Recipe for unknown product or invalid format: '${currentLine}'. Skipping.`);
        continue;
      }

      const existingProduct = productCatalog.get(productName);
      productCatalog.set(productName, { ...existingProduct, recipe: recipeComponents });
    }

    const targetProductKey = processedInputLines[currentLineIndex++];
    if (!targetProductKey) {
      console.error(`Error: Missing target product key for calculation at line ${currentLineIndex - 1}. Terminating processing.`);
      break;
    }

    try {
      const finalCost = calculateComponentCost(productCatalog, targetProductKey);
      console.log(finalCost);
    } catch (error) {
      console.error(`Calculation failed for target product '${targetProductKey}': ${error.message}`);
      console.log('ERROR');
    }
  }
};

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
  rawInputBuffer += inputChunk;
});

process.stdin.on('end', () => {
  const cleanedInputLines = rawInputBuffer.split('\n').filter(line => line.trim() !== '');
  processInputData(cleanedInputLines);
});

process.stdin.on('error', (err) => {
  console.error('An error occurred during stdin processing:', err);
  process.exit(1);
});