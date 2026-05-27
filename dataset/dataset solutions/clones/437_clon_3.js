const getMin = (valueA, valueB) => {
  return valueA < valueB ? valueA : valueB;
};

function calculateCost(productCatalog, currentProduct, visitedProducts = []) {
  const productDetails = productCatalog[currentProduct];
  let effectivePrice = productDetails.price;
  const productRecipe = productDetails.recipe;

  if (productRecipe) {
    visitedProducts.push(currentProduct);
    let accumulatedRecipeCost = 0;
    let pathIsCyclic = false;

    for (let componentIndex = 0; componentIndex < productRecipe.length; componentIndex++) {
      const componentName = productRecipe[componentIndex];

      if (visitedProducts.includes(componentName)) {
        pathIsCyclic = true;
        break;
      }

      const componentPriceContribution = calculateCost(productCatalog, componentName, visitedProducts);
      accumulatedRecipeCost += componentPriceContribution;
    }

    if (!pathIsCyclic) {
      effectivePrice = getMin(effectivePrice, accumulatedRecipeCost);
    }
    visitedProducts.pop();
  }

  return effectivePrice;
}

function processInputData(inputLinesArray) {
  let lineCursor = 0;
  const totalInputLines = inputLinesArray.length;

  const parseNextIntAndAdvance = () => {
    const value = parseInt(inputLinesArray[lineCursor], 10);
    lineCursor++;
    return value;
  };

  while (lineCursor < totalInputLines) {
    let currentProductCatalog = {};

    const numProducts = parseNextIntAndAdvance();
    if (numProducts === 0) {
      break;
    }
    const productDefinitionsEndLine = lineCursor + numProducts;

    for (; lineCursor < productDefinitionsEndLine; lineCursor++) {
      const lineParts = inputLinesArray[lineCursor].split(' ');
      const productName = lineParts[0];
      const productBasePrice = parseInt(lineParts[1], 10);
      currentProductCatalog[productName] = { price: productBasePrice };
    }

    const numRecipes = parseNextIntAndAdvance();
    const recipeDefinitionsEndLine = lineCursor + numRecipes;

    for (; lineCursor < recipeDefinitionsEndLine; lineCursor++) {
      const lineParts = inputLinesArray[lineCursor].split(' ');
      const productName = lineParts[0];
      if (currentProductCatalog[productName]) {
        currentProductCatalog[productName].recipe = lineParts.slice(2);
      }
    }

    const finalProductKey = inputLinesArray[lineCursor++];
    console.log(calculateCost(currentProductCatalog, finalProductKey));
  }
}

let accumulatedInputString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

const handleDataChunk = (inputChunk) => {
  accumulatedInputString += inputChunk;
};

const handleEndOfInput = () => {
  const rawInputLines = accumulatedInputString.split('\n');
  processInputData(rawInputLines);
};

process.stdin.on('data', handleDataChunk);
process.stdin.on('end', handleEndOfInput);
