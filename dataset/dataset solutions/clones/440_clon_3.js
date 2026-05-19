function calculateCost(productCatalog, currentProduct, visitedProducts) {
  try {
    const productDetails = productCatalog[currentProduct];
    let productPrice = productDetails.price;
    let totalRecipeCost = 0;
    let isRecipeValid = false;
    
    visitedProducts = visitedProducts || [];

    const productRecipe = productDetails.recipe;

    if (productRecipe) {
      visitedProducts.push(currentProduct);
      totalRecipeCost = 0;
      isRecipeValid = true;

      for (let recipeIndex = 0; recipeIndex < productRecipe.length; recipeIndex++) {
        const ingredientProduct = productRecipe[recipeIndex];
        
        if (visitedProducts.includes(ingredientProduct) || !(ingredientProduct in productCatalog)) {
          isRecipeValid = false;
          break;
        }
        
        totalRecipeCost += calculateCost(productCatalog, ingredientProduct, visitedProducts);
      }

      if (isRecipeValid) {
        productPrice = determineMinimum(productPrice, totalRecipeCost);
      }
      visitedProducts.pop();
    }
    return productPrice;
  } catch (error) {
    throw [error, productCatalog, currentProduct];
  }
}

function determineMinimum(valA, valB) {
  if (valA < valB) {
    return valA;
  } else {
    return valB;
  }
}

function processInputData() {
  let lineIterator = 0;
  const inputLength = rawInputLines.length;
  
  while (lineIterator < inputLength) {
    const productCatalog = {};
    
    const numProductsToRead = parseInt(rawInputLines[lineIterator], 10);
    lineIterator++;
    
    if (numProductsToRead === 0) {
        break;
    }

    const productLinesEndIndex = lineIterator + numProductsToRead;

    for (; lineIterator < productLinesEndIndex; lineIterator++) {
      const currentLineParts = rawInputLines[lineIterator].split(' ');
      const productName = currentLineParts[0];
      const productBasePrice = parseInt(currentLineParts[1], 10);
      productCatalog[productName] = { price: productBasePrice };
    }

    const numRecipesToRead = parseInt(rawInputLines[lineIterator], 10);
    lineIterator++;
    const recipeLinesEndIndex = lineIterator + numRecipesToRead;

    for (; lineIterator < recipeLinesEndIndex; lineIterator++) {
      const currentLineParts = rawInputLines[lineIterator].split(' ');
      const productName = currentLineParts[0];
      productCatalog[productName].recipe = currentLineParts.slice(2);
    }

    const targetProductName = rawInputLines[lineIterator];
    lineIterator++;
    console.log(calculateCost(productCatalog, targetProductName));
  }
}

let rawInputBuffer = '';
let rawInputLines;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
  rawInputBuffer += inputChunk;
});

process.stdin.on('end', () => {
  rawInputLines = rawInputBuffer.split('\n');
  processInputData();
});
