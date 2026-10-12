const modularProduct = (val1, val2, modulus) => {
  const product = val1 * val2;
  // Ensure the result is always positive for modulo operations
  return (product % modulus + modulus) % modulus;
};

const getAbsoluteValue = (val) => Math.abs(val);

const computeMaxProduct = (sourceNumbers, totalCount, selectionSize, modulusValue) => {
  if (selectionSize === 0) {
    return 1n; // Product of an empty set is 1
  }

  // Sort the numbers by their absolute value in descending order
  const numbersSortedByAbsDesc = [...sourceNumbers].sort((a, b) => getAbsoluteValue(b) - getAbsoluteValue(a));

  // Take the initial 'selectionSize' numbers based on absolute value
  let initialSelection = numbersSortedByAbsDesc.slice(0, selectionSize);

  let currentProduct = 1n;
  let negativeCount = 0;
  let hasZero = false;

  // Calculate the product and count negatives for the initial selection
  for (const num of initialSelection) {
    if (num === 0) {
      hasZero = true;
      break; // If any number is zero, the product is zero
    }
    if (num < 0) {
      negativeCount++;
    }
    currentProduct = modularProduct(currentProduct, BigInt(num), modulusValue);
  }

  // If a zero is in the initial selection, the product is 0
  if (hasZero) {
    return 0n;
  }

  // If the product is already positive (even number of negatives), return it
  if (negativeCount % 2 === 0) {
    return currentProduct;
  }

  // If the product is negative (odd number of negatives), we need to make a swap
  // to achieve a positive product, if possible, and maximize it.
  const remainingNumbers = numbersSortedByAbsDesc.slice(selectionSize);

  let bestOverallProduct = -1n; // Sentinel value indicating no positive product found yet

  // Identify candidates for swapping
  // Negatives in the current selection, sorted by absolute value ascending (smallest magnitude)
  const selectedNegatives = initialSelection.filter(x => x < 0).sort((a, b) => getAbsoluteValue(a) - getAbsoluteValue(b));
  // Positives in the current selection, sorted by absolute value ascending (smallest magnitude)
  const selectedPositives = initialSelection.filter(x => x > 0).sort((a, b) => getAbsoluteValue(a) - getAbsoluteValue(b));
  // Negatives in the remaining numbers, sorted by absolute value descending (largest magnitude)
  const remainingNegatives = remainingNumbers.filter(x => x < 0).sort((a, b) => getAbsoluteValue(b) - getAbsoluteValue(a));
  // Positives in the remaining numbers, sorted by absolute value descending (largest magnitude)
  const remainingPositives = remainingNumbers.filter(x => x > 0).sort((a, b) => getAbsoluteValue(b) - getAbsoluteValue(a));

  // Option A: Replace a negative from 'initialSelection' with a positive from 'remainingNumbers'
  // This swap changes (negative * negative) to positive, making the overall product positive.
  if (selectedNegatives.length > 0 && remainingPositives.length > 0) {
    const negativeToReplace = selectedNegatives[0]; // Smallest absolute negative in selection
    const positiveToInsert = remainingPositives[0]; // Largest absolute positive in remaining

    const candidateSetA = [...initialSelection];
    const indexToReplace = candidateSetA.indexOf(negativeToReplace);
    candidateSetA[indexToReplace] = positiveToInsert;

    let productCandidateA = 1n;
    for (const num of candidateSetA) {
      productCandidateA = modularProduct(productCandidateA, BigInt(num), modulusValue);
    }
    bestOverallProduct = productCandidateA;
  }

  // Option B: Replace a positive from 'initialSelection' with a negative from 'remainingNumbers'
  // This swap changes (positive * negative) to positive, making the overall product positive.
  if (selectedPositives.length > 0 && remainingNegatives.length > 0) {
    const positiveToReplace = selectedPositives[0]; // Smallest absolute positive in selection
    const negativeToInsert = remainingNegatives[0]; // Largest absolute negative in remaining

    const candidateSetB = [...initialSelection];
    const indexToReplace = candidateSetB.indexOf(positiveToReplace);
    candidateSetB[indexToReplace] = negativeToInsert;

    let productCandidateB = 1n;
    for (const num of candidateSetB) {
      productCandidateB = modularProduct(productCandidateB, BigInt(num), modulusValue);
    }

    // Update bestOverallProduct if this candidate yields a larger positive product
    if (productCandidateB > bestOverallProduct) {
      bestOverallProduct = productCandidateB;
    }
  }

  // If after considering all possible swaps, 'bestOverallProduct' is still -1n,
  // it means no swap could result in a positive product. This typically happens
  // when all numbers are negative and 'selectionSize' is odd.
  // In this scenario, to maximize a negative product, we must choose the 'selectionSize'
  // largest (least negative) numbers.
  if (bestOverallProduct === -1n) {
    const numbersSortedAscending = [...sourceNumbers].sort((a, b) => a - b);
    let finalNegativeProduct = 1n;
    for (let i = totalCount - selectionSize; i < totalCount; i++) {
      finalNegativeProduct = modularProduct(finalNegativeProduct, BigInt(numbersSortedAscending[i]), modulusValue);
    }
    return finalNegativeProduct;
  }

  return bestOverallProduct;
};

function entryPoint(inputData) {
  const MODULO_CONSTANT = 1_000_000_007n; // Using BigInt for the modulo constant

  const inputLines = inputData.trim().split("\n");
  const [arrayLength, selectionCount] = inputLines[0].split(" ").map(Number);
  const numberValues = inputLines[1].split(" ").map(Number);

  const finalComputedResult = computeMaxProduct(numberValues, arrayLength, selectionCount, MODULO_CONSTANT);

  console.log(Number(finalComputedResult)); // Convert BigInt result back to Number for output
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
