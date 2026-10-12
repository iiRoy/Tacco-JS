function calculateProduct(inputString) {
  // Parse the input string into an array of numbers
  let parsedNumbers = inputString.split(" ").map(Number);

  // Create two pairs of numbers from the parsed input
  const pairOne = [parsedNumbers[0], parsedNumbers[1]];
  const pairTwo = [parsedNumbers[2], parsedNumbers[3]];

  // Declare and initialize two unused variables, preserving original structure
  let tempX = 0, tempY = 0;

  // Sort pairOne in ascending order (modifies pairOne in place)
  // Note: The subsequent sort will re-sort the same array instance.
  let sortedPairOneAsc = pairOne.sort((valA, valB) => valA - valB);
  // Sort pairOne in descending order (modifies pairOne in place again)
  // At this point, sortedPairOneAsc and sortedPairOneDesc both point to the same array,
  // which is now sorted in descending order.
  let sortedPairOneDesc = pairOne.sort((valA, valB) => valB - valA);

  // Sort pairTwo in ascending order (modifies pairTwo in place)
  let sortedPairTwoAsc = pairTwo.sort((valA, valB) => valA - valB);
  // Sort pairTwo in descending order (modifies pairTwo in place again)
  // Similar to pairOne, both sortedPairTwoAsc and sortedPairTwoDesc point to the
  // same array, which is now sorted in descending order.
  let sortedPairTwoDesc = pairTwo.sort((valA, valB) => valB - valA);

  // Calculate four possible products using elements from the (now descending) sorted arrays.
  // Based on the in-place sorting, sortedPairOneAsc[0] will be the max of original pairOne,
  // and sortedPairOneAsc[1] will be the min of original pairOne. Same for pairTwo.
  let productA = sortedPairOneAsc[0] * sortedPairTwoAsc[0]; // (max1 * max2)
  let productB = sortedPairOneAsc[0] * sortedPairTwoAsc[1]; // (max1 * min2)
  let productC = sortedPairOneAsc[1] * sortedPairTwoAsc[0]; // (min1 * max2)
  let productD = sortedPairOneAsc[1] * sortedPairTwoAsc[1]; // (min1 * min2)

  // Collect all products and sort them in descending order
  let allProductsSorted = [productA, productB, productC, productD].sort((valA, valB) => valB - valA);

  // Return the largest product
  return allProductsSorted[0];
}

// Read input from standard input, process it, and print the result to console
console.log(calculateProduct(require("fs").readFileSync("/dev/stdin", "utf8")));
