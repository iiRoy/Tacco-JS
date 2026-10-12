'use strict';
(function(rawInputString) {
  // Helper function to process the raw input string into an array of numbers.
  const parseInputNumbers = (str) => {
    return str.trim().split(/\s+/).map(val => Number(val));
  };

  const processedInputValues = parseInputNumbers(rawInputString);

  // Destructure the parsed input values into meaningful constants.
  const totalElements = processedInputValues[0];
  const groupSize = processedInputValues[1];

  // Calculate the effective 'N' for the first combination term, which is N - K + 1.
  const effectiveNForFirstCombination = totalElements - groupSize + 1;

  // Define the modulus value for all arithmetic operations.
  const modulusValue = (1e9 + 7);

  // Constant for bit shifting in the modular multiplication function.
  const BIT_SHIFT_AMOUNT = 16;
  const SHIFT_FACTOR = 1 << BIT_SHIFT_AMOUNT; // Represents 2^16

  // Function for modular addition: (a + b) % M.
  function addMod(operandA, operandB) {
    return (operandA + operandB) % modulusValue;
  }

  // Function for modular multiplication: (a * b) % M,
  // designed to prevent intermediate overflow for large numbers before modulo.
  function multiplyMod(factorA, factorB) {
    // Split factorA into high and low parts.
    const factorAHigh = factorA >> BIT_SHIFT_AMOUNT;
    const factorALow = factorA - (factorAHigh << BIT_SHIFT_AMOUNT);

    // Split factorB into high and low parts.
    const factorBHigh = factorB >> BIT_SHIFT_AMOUNT;
    const factorBLow = factorB - (factorBHigh << BIT_SHIFT_AMOUNT);

    // Calculate the four terms of the product (A*2^S + A_)*(B*2^S + B_) mod M.
    // Term 1: (A_high * B_high * 2^S * 2^S) % M
    const productTerm1 = ((((factorAHigh * factorBHigh) % modulusValue) * SHIFT_FACTOR) % modulusValue * SHIFT_FACTOR) % modulusValue;

    // Term 2: (A_high * B_low * 2^S) % M
    const productTerm2 = (((factorAHigh * factorBLow) % modulusValue) * SHIFT_FACTOR) % modulusValue;

    // Term 3: (A_low * B_high * 2^S) % M
    const productTerm3 = (((factorALow * factorBHigh) % modulusValue) * SHIFT_FACTOR) % modulusValue;

    // Term 4: (A_low * B_low) % M
    const productTerm4 = (factorALow * factorBLow) % modulusValue;

    // Sum all terms modulo M to get the final product.
    const finalModularProduct = (productTerm1 + productTerm2 + productTerm3 + productTerm4) % modulusValue;
    return finalModularProduct;
  }

  // Initialize a 2D array to store combination values (Pascal's Triangle).
  // Renamed 'combination' to 'combinationsLookupTable'.
  const combinationsLookupTable = new Array(totalElements + 1);

  // Populate the table: C(n,0) and C(n,n) are always 1.
  for (let rowIndex = 0; rowIndex <= totalElements; rowIndex++) {
    combinationsLookupTable[rowIndex] = new Array(rowIndex + 1).fill(1);
  }

  // Compute intermediate combination values using the recurrence C(n,k) = C(n-1,k-1) + C(n-1,k).
  for (let rowIndex = 2; rowIndex <= totalElements; rowIndex++) {
    for (let colIndex = 1; colIndex < rowIndex; colIndex++) {
      combinationsLookupTable[rowIndex][colIndex] = addMod(
        combinationsLookupTable[rowIndex - 1][colIndex - 1],
        combinationsLookupTable[rowIndex - 1][colIndex]
      );
    }
  }

  const computedResults = []; // Renamed 'ans' to 'computedResults'.

  // Iterate to calculate the final set of results.
  for (let currentIterationIndex = 0; currentIterationIndex < groupSize; currentIterationIndex++) {
    const currentGroupCount = currentIterationIndex + 1; // Represents 'i' from the original code.

    // Retrieve the first combination term: C(L, i) or C(effectiveNForFirstCombination, currentGroupCount).
    const termOneCombination = combinationsLookupTable[effectiveNForFirstCombination][currentGroupCount];

    // Retrieve the second combination term: C(K-1, i-1) or C(groupSize - 1, currentGroupCount - 1).
    const termTwoCombination = combinationsLookupTable[groupSize - 1][currentGroupCount - 1];

    // Multiply the two combination terms modulo M and store the result.
    computedResults.push(multiplyMod(termOneCombination, termTwoCombination));
  }

  // Output the computed results, each on a new line.
  console.log(computedResults.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
