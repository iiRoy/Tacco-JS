/*
 * This JavaScript module calculates the maximum possible product of K elements
 * chosen from a given array of N integers. It uses BigInt for modulo arithmetic
 * to handle potentially very large numbers. Input is read from standard input.
 */
console.log(
  (function(appInputString) {
    // Step 1: Parse the incoming text data.
    // The first line contains two integers: 'totalElements' (N) and 'elementsToSelect' (K).
    // The second line contains 'totalElements' space-separated integer values.
    const inputLinesArray = appInputString
      .trim()
      .split('\n');

    const [firstLineData, secondLineData] = inputLinesArray;

    const [totalElements, elementsToSelect] = firstLineData
      .split(' ')
      .map(strVal => Number(strVal));

    const sourceValues = secondLineData
      .split(' ')
      .map(strVal => Number(strVal));

    // Step 2: Segregate the numbers into three categories: positive, negative, and zero.
    let negativeValues = [];
    let positiveValues = [];
    let zeroCounter = 0;

    for ( let currentIdx = 0; currentIdx < totalElements; currentIdx++ ) {
      const valueAtCurrentIdx = sourceValues[currentIdx];
      if ( valueAtCurrentIdx > 0 ) {
        positiveValues.push(valueAtCurrentIdx);
      } else if ( valueAtCurrentIdx < 0 ) {
        negativeValues.push(valueAtCurrentIdx);
      } else {
        zeroCounter++;
      }
    }

    // Step 3: Handle edge case where picking K elements inevitably results in zero.
    // If 'elementsToSelect' plus any existing zeros exceeds the total available elements,
    // it means we are forced to pick a zero, making the product zero.
    if ( elementsToSelect + zeroCounter > totalElements ) {
      return '0';
    }

    // Step 4: Define a modulus for calculations and a multiplication utility function.
    // This is crucial for handling large products that exceed standard JavaScript number limits.
    const largePrimeModulus = BigInt(1_000_000_007); // A common prime modulus (10^9 + 7)
    const bigIntProduct = (factor1, factor2) => {
      const intermediateProduct = (BigInt(factor1) * BigInt(factor2)) % largePrimeModulus;
      // Ensure the result is always positive, even if intermediateProduct is negative.
      return (intermediateProduct + largePrimeModulus) % largePrimeModulus;
    };

    // Step 5: Sort the categorized arrays to facilitate selection.
    // Negative numbers are sorted in ascending order (smallest to largest).
    negativeValues.sort((valA, valB) => valA - valB);
    // Positive numbers are sorted in descending order (largest to smallest).
    positiveValues.sort((valA, valB) => valB - valA);

    // Step 6: Handle another specific edge case: no positives and an odd number of elements to select.
    // If there are no positive numbers available, and we need to select an odd count of numbers,
    // the product will be negative unless a zero can be picked.
    if ( positiveValues.length === 0 && (elementsToSelect % 2 !== 0) ) {
      // If there's at least one zero, the product can be zero.
      // Otherwise, we must pick 'elementsToSelect' negative numbers, resulting in a negative product.
      // We pick the 'elementsToSelect' largest (closest to zero) negative numbers to maximize the negative result.
      return zeroCounter > 0
        ? '0'
        : `${ negativeValues
            .slice(-elementsToSelect)
            .reduce(bigIntProduct, 1n) }`;
    }

    // Step 7: Greedily select 'elementsToSelect' numbers.
    // We aim to pick pairs of numbers that contribute most positively to the product.
    let negPointer = 0; // Index for 'negativeValues'
    let posPointer = 0; // Index for 'positiveValues'
    let selectedPositives = []; // Array to store chosen positive numbers
    let selectedNegatives = []; // Array to store chosen negative numbers
    let lastPushedValues = [0, 0]; // Keeping track of last pushed, for structural consistency.

    for ( let selectionIter = 0; selectionIter < elementsToSelect; selectionIter++ ) {
      const canAccessPositive = posPointer < positiveValues.length;
      const canAccessNegative = negPointer < negativeValues.length;

      if ( canAccessPositive && canAccessNegative ) {
        // Compare the current largest positive with the absolute value of the current smallest negative.
        // We prioritize the one that contributes more to a larger (positive) product.
        if ( positiveValues[posPointer] > -negativeValues[negPointer] ) {
          selectedPositives.push(positiveValues[posPointer]);
          lastPushedValues[0] = positiveValues[posPointer]; // Record the last positive added
          posPointer++;
        } else {
          selectedNegatives.push(negativeValues[negPointer]);
          lastPushedValues[1] = negativeValues[negPointer]; // Record the last negative added
          negPointer++;
        }
      } else if ( canAccessPositive ) {
        // Only positive numbers are available for selection.
        selectedPositives.push(positiveValues[posPointer]);
        lastPushedValues[0] = positiveValues[posPointer];
        posPointer++;
      } else if ( canAccessNegative ) {
        // Only negative numbers are available for selection.
        selectedNegatives.push(negativeValues[negPointer]);
        lastPushedValues[1] = negativeValues[negPointer];
        negPointer++;
      }
      // If neither is accessible, it implies 'elementsToSelect' was greater than 'totalElements'
      // which should have been caught by an earlier check, or we've picked all available.
    }

    // Step 8: Adjust selections if an odd number of negatives were chosen.
    // An odd count of negatives makes the product negative. We want to make it positive if possible,
    // or maximize it by swapping if it must remain negative.
    if ( selectedNegatives.length % 2 !== 0 ) { // If the count of chosen negatives is odd
      // Option A: Try to swap out the smallest chosen negative for the next largest positive.
      // This is viable if we haven't exhausted all negatives AND the next positive is "stronger" (larger abs value)
      // OR if we have exhausted all negatives and can only add a positive.
      const noMoreNegsToSwapIn = negPointer >= negativeValues.length;
      const canSwapForPositive = posPointer < positiveValues.length && ( noMoreNegsToSwapIn || positiveValues[posPointer] > -negativeValues[negPointer] );

      if ( canSwapForPositive ) {
        selectedNegatives.pop(); // Remove the smallest chosen negative
        selectedPositives.push(positiveValues[posPointer]); // Add the next largest available positive
      }
      // Option B: If Option A is not possible, try to swap out the smallest chosen positive for the next largest negative.
      // This keeps the negative count even, effectively making the product positive.
      else if ( selectedPositives.length > 0 && negPointer < negativeValues.length ) {
        selectedPositives.pop(); // Remove the smallest chosen positive
        selectedNegatives.push(negativeValues[negPointer]); // Add the next smallest available negative
      }
      // If neither swap is possible, the product will remain negative. This implies a scenario
      // where we had to pick an odd number of negatives and couldn't balance it out.
    }

    // Step 9: Compute the final product of all selected elements.
    const finalProductPositives = selectedPositives.reduce(bigIntProduct, 1n);
    const finalProductNegatives = selectedNegatives.reduce(bigIntProduct, 1n);

    return `${bigIntProduct(finalProductPositives, finalProductNegatives)}`;

  })( require('node:fs').readFileSync('/dev/stdin', 'utf8') )
);