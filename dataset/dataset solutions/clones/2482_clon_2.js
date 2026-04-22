function processInputData(sourceLines) {
  // Parse the initial configuration from the first line
  var initialParams = sourceLines[0].split(' ');

  var itemQuantity = initialParams[0]; // Represents N from original
  var reductionCount = initialParams[1]; // Represents K from original

  // Extract the first array of numbers
  var firstNumericalSet = sourceLines[1].split(' ');

  // Extract the second array of factors
  var secondFactorSet = sourceLines[2].split(' ');

  // Sort the first numerical set in descending order
  // This helps in prioritizing larger values for modification
  firstNumericalSet.sort(function(elementX, elementY) {
    if (elementX > elementY) {
      return -1;
    }
    if (elementX < elementY) {
      return 1;
    }
    return 0;
  });


  // Sort the second factor set in ascending order
  // This ensures factors are applied strategically
  secondFactorSet.sort(function(elementX, elementY) {
    if (elementX > elementY) {
      return 1;
    }
    if (elementX < elementY) {
      return -1;
    }
    return 0;
  });


  var calculatedProducts = []; // Stores [product, original_A_value, original_F_value]

  // Initialize the array of products and their components
  for (var loopIndex = 0; loopIndex < itemQuantity; loopIndex++) {
    calculatedProducts[loopIndex] = [
      firstNumericalSet[loopIndex] * secondFactorSet[loopIndex],
      firstNumericalSet[loopIndex],
      secondFactorSet[loopIndex]
    ];
  }


  // Perform reduction operations 'reductionCount' times
  for (var iterationCounter = 0; iterationCounter < reductionCount; iterationCounter++) {
    // Sort the products array by the product value in descending order
    // This brings the largest product to the first position for reduction
    calculatedProducts.sort(function(entryOne, entryTwo) {
      if (entryOne[0] > entryTwo[0]) return -1;
      if (entryOne[0] < entryTwo[0]) return 1;
      return 0;
    });

    // Decrease the 'A' component of the largest product by 1
    calculatedProducts[0][1] = calculatedProducts[0][1] - 1;

    // Recalculate the product for the modified entry
    calculatedProducts[0][0] = calculatedProducts[0][1] * calculatedProducts[0][2];
  }

  // After all reductions, sort the products one last time
  // This ensures the final maximum product is at the top
  calculatedProducts.sort(function(comparisonA, comparisonB) {
    if (comparisonA[0] > comparisonB[0]) return -1;
    if (comparisonA[0] < comparisonB[0]) return 1;
    return 0;
  });

  // Output the final largest product value
  console.log(calculatedProducts[0][0]);
}

// Read input from standard input and pass to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));