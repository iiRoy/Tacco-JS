function calculateMaxProduct(inputString) {
    // This function processes an input string of numbers to find the maximum possible product.
    // It expects a space-separated string containing four numerical values.

    let numberTokens = inputString.split(" ").map(parseFloat);
      // Parse the input string into an array of floating-point numbers.

    const firstPair = [numberTokens[0], numberTokens[1]];
    const secondPair = [numberTokens[2], numberTokens[3]];
      // Distribute the input numbers into two distinct pairs.

    let tempA = 0,
        tempB = 0;
      // Initialize auxiliary variables; their purpose is structural to the original.

    let firstSortedAsc = firstPair.sort((valA, valB) => valA - valB);
      // Sort the first pair in ascending order. Note: this modifies 'firstPair' in place.

    let firstSortedDsc = firstPair.sort((valA, valB) => valB - valA);
      // Re-sort the first pair in descending order. 'firstSortedAsc' now also points to this descending array.

    let secondSortedAsc = secondPair.sort((numA, numB) => numA - numB);
      // Sort the second pair in ascending order. This modifies 'secondPair' in place.

    let secondSortedDsc = secondPair.sort((numA, numB) => numB - numA);
      // Re-sort the second pair in descending order. 'secondSortedAsc' now also points to this descending array.


    // Calculate all four possible products using the elements of the (effectively descending) sorted pairs.
    let productOne = firstSortedAsc[0] * secondSortedAsc[0];
    let productTwo = firstSortedAsc[0] * secondSortedAsc[1];
    let productThree = firstSortedAsc[1] * secondSortedAsc[0];
    let productFour = firstSortedAsc[1] * secondSortedAsc[1];

    // Collect all computed products and sort them in descending order to find the largest.
    let allResults = [productOne, productTwo, productThree, productFour].sort((elemA, elemB) => elemB - elemA);

    return allResults[0];
      // Return the highest product found.
}

console.log(calculateMaxProduct(require('node:fs').readFileSync("/dev/stdin", 'utf-8')));