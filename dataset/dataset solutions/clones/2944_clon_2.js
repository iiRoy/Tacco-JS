'use strict';
( function ( processData ) {

  // Retrieve and process the raw string input.
  // Trim whitespace, split by any whitespace, and convert each part to a number.
  let parsedNumbersArray = processData
    .trim()
    .split( /\s+/ )
    .map( ( numericEntry ) => +numericEntry );

  // Extract and assign the primary dimensions and the desired count from the processed input.
  const firstDimensionValue = Math.min( parsedNumbersArray[0], parsedNumbersArray[1] );
  const secondDimensionValue = Math.max( parsedNumbersArray[0], parsedNumbersArray[1] );
  const targetCount = parsedNumbersArray[2];

  // Establish a large prime number for all modular arithmetic computations.
  const largePrimeModulus = ( Math.pow( 10, 9 ) + 7 );

  let computedSumTotal = 0; // Initialize the variable that will accumulate the final result.

  // Execute the first computational loop: from 1 up to (firstDimensionValue - 1).
  for ( let currentIteration = 1; currentIteration <= firstDimensionValue - 1; currentIteration++ ) {
    // Calculate four distinct components based on the current iteration and dimensions.
    let componentFactorA = ( 1.0 / 6.0 ) * ( currentIteration + 1 ) * ( currentIteration + 2 ) * ( currentIteration * 3 );
    let componentFactorB = ( ( firstDimensionValue - currentIteration - 1 ) + ( secondDimensionValue - currentIteration - 1 ) ) * ( 0.5 ) * ( currentIteration + 1 ) * ( currentIteration + 2 );
    let componentFactorC = ( firstDimensionValue - currentIteration - 1 ) * ( secondDimensionValue - currentIteration - 1 ) * ( currentIteration + 1 );
    let componentFactorD = ( firstDimensionValue - currentIteration ) + ( secondDimensionValue - currentIteration );

    // Update the running total with the result derived from these components.
    computedSumTotal += currentIteration * ( ( componentFactorA + componentFactorB + componentFactorC ) * 2 - componentFactorD );
    computedSumTotal %= largePrimeModulus; // Apply the modulo operation to prevent overflow.
  }

  // Proceed with the second computational loop: from firstDimensionValue up to (secondDimensionValue - 1).
  for ( let iterIndex = firstDimensionValue; iterIndex <= secondDimensionValue - 1; iterIndex++ ) {
    // Determine a new set of components for this specific range.
    let termValueAlpha = ( 1.0 / 6.0 ) * ( firstDimensionValue ) * ( firstDimensionValue + 1 ) * ( firstDimensionValue + 2 );
    let termValueBeta  = ( secondDimensionValue - iterIndex - 1 ) * ( 0.5 ) * ( firstDimensionValue ) * ( firstDimensionValue + 1 );
    let termValueGamma = 0; // This specific term is set to zero for this section.
    let termValueDelta = ( secondDimensionValue - iterIndex );

    // Integrate these new term values into the main accumulator.
    computedSumTotal += iterIndex * ( ( termValueAlpha + termValueBeta + termValueGamma ) * 2 - termValueDelta );
    computedSumTotal %= largePrimeModulus; // Ensure the result remains within the modular range.
  }

  // Execute the third and final computational loop: from secondDimensionValue up to (firstDimensionValue + secondDimensionValue - 2).
  for ( let loopIteration = secondDimensionValue; loopIteration <= firstDimensionValue + secondDimensionValue - 2; loopIteration++ ) {
    let auxiliaryDimension = firstDimensionValue + secondDimensionValue - 1 - loopIteration;
    // Calculate the last set of components.
    let calculationComponentA = ( 1.0 / 6.0 ) * ( auxiliaryDimension ) * ( auxiliaryDimension + 1 ) * ( auxiliaryDimension + 2 );
    let calculationComponentB = 0; // This component is explicitly zero.
    let calculationComponentC = 0; // This component is also explicitly zero.
    let calculationComponentD = 0; // And similarly, this is zero.

    // Add the outcome of these calculations to the overall sum.
    computedSumTotal += loopIteration * ( ( calculationComponentA + calculationComponentB + calculationComponentC ) * 2 - calculationComponentD );
    computedSumTotal %= largePrimeModulus; // Apply the modulo to maintain integrity.
  }

  // Final step: Multiply the accumulated sum by a combinatorial factor, specifically (N*M-2) choose (K-2).
  // This is performed using modular multiplication for the numerator and modular inverse for the denominator.
  for ( let factorLoopCounter = 0; factorLoopCounter < targetCount - 2; factorLoopCounter++ ) {

    // Multiply by the next term in the numerator of the combination formula.
    computedSumTotal *= ( firstDimensionValue * secondDimensionValue - 2 - factorLoopCounter );
    computedSumTotal %= largePrimeModulus;

    // --- Modular Inverse Calculation using the Extended Euclidean Algorithm ---
    // This block finds the modular multiplicative inverse for dividing by (factorLoopCounter + 1).
    let remainderSequenceTracker = [ largePrimeModulus, factorLoopCounter + 1 ]; // Start with the modulus and the current divisor.
    let quotientSequenceTracker = [];

    // Perform the standard Euclidean algorithm to find GCD and collect quotients.
    while ( remainderSequenceTracker[ remainderSequenceTracker.length - 1 ] !== 1 ) {
      let currentDividend = remainderSequenceTracker[ remainderSequenceTracker.length - 2 ];
      let currentDivisor  = remainderSequenceTracker[ remainderSequenceTracker.length - 1 ];
      let currentRemainder = currentDividend % currentDivisor;
      let currentQuotient  = Math.floor( currentDividend / currentDivisor ); // Use floor for integer division
      remainderSequenceTracker.push( currentRemainder );
      quotientSequenceTracker.push( currentQuotient );
    }

    // Back-substitute the collected quotients to find the Bezout coefficients.
    let bezoutCoefficientsArray = [ -( quotientSequenceTracker.pop() ), 1 ]; // Initialize with coefficients for the last two remainders.
    while ( quotientSequenceTracker.length > 0 ) {
      bezoutCoefficientsArray.push( bezoutCoefficientsArray[ bezoutCoefficientsArray.length - 2 ] - bezoutCoefficientsArray[ bezoutCoefficientsArray.length - 1 ] * quotientSequenceTracker.pop() );
    }

    // Apply the modular inverse (which is the second-to-last Bezout coefficient) to the running total.
    computedSumTotal = ( bezoutCoefficientsArray[ bezoutCoefficientsArray.length - 2 ] * computedSumTotal ) % largePrimeModulus;
    // Ensure the result is non-negative, as JavaScript's % operator can return negative values.
    if ( computedSumTotal < 0 ) {
      computedSumTotal += largePrimeModulus;
    }
  }

  // Output the final calculated and modulated result to the console.
  console.log( computedSumTotal );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );