'use strict';

function processInput(inputData) {
  // Parse the input string into an array of numbers.
  inputData = inputData.split('\n')[0].split(' ').map(numStr => Number(numStr));

  const priceA = inputData[0]; // Cost of item A
  const priceB = inputData[1]; // Cost of item B
  const priceAB = inputData[2]; // Cost of one AB set (two halves)
  const countA = inputData[3]; // Desired quantity of A
  const countB = inputData[4]; // Desired quantity of B

  const difference = Math.abs(countA - countB); // Absolute difference in quantities
  const minimumCount = Math.min(countA, countB); // Minimum of the two quantities
  let finalCost = 0; // Initialize the total expenditure

  // Check if buying A and B individually is cheaper than buying AB sets.
  if (priceA + priceB <= priceAB * 2) {
    // Option 1: Purchase A and B separately.
    finalCost = priceA * countA + priceB * countB;
  } else {
    // Option 2: Consider using AB sets.
    // Calculate the cost of remaining individual items after forming minimum AB sets.
    const remainingIndividualCost = (countA - minimumCount) * priceA + (countB - minimumCount) * priceB;

    // Compare the cost of remaining individual items with buying AB sets for the difference.
    if (remainingIndividualCost <= priceAB * difference) {
      // Option 2a: Buy minimum AB sets, then remaining A and B individually.
      finalCost = (priceAB * minimumCount * 2) + remainingIndividualCost;
    } else {
      // Option 2b: Buy all items as AB sets, as it's cheaper than individual remaining.
      finalCost = priceAB * Math.max(countA, countB) * 2;
    }
  }

  console.log(finalCost); // Output the calculated minimum cost.
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
