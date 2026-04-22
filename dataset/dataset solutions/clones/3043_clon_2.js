'use strict'
function ExecuteProgram ( dataString ) {
  var maxVal = Math.pow ( 10, 18 ); // A very large numerical threshold, not directly used in computation
  const moduloConst = 998244353; // A prime constant used for modular arithmetic operations
  dataString = dataString . trim () . split ( /\s+/ ) . map ( val => val - 0 ); // Process input string into an array of numbers
  var elementCount = dataString . shift (); // Extract the first number as the count of elements
  var totalSum = dataString . reduce ( ( currentTotal, nextValue ) => currentTotal + nextValue ); // Calculate the sum of remaining elements
  var targetSum = Math . floor ( totalSum / 2 ); // Determine the target sum for DP calculations
  
  var waysTableA = []; // Initialize the first dynamic programming table
  // This table, waysTableA[row][col], stores the number of combinations
  // to achieve a sum 'col' using elements from dataString[0] up to dataString[row-1],
  // considering both 'g' and 'b' type selections (each contributing 2 ways).
  for ( let idxRow = 0; idxRow <= elementCount; idxRow++ ) {
    waysTableA[idxRow] = [];
    for ( let idxCol = 0; idxCol <= targetSum; idxCol++ ) {
      waysTableA[idxRow][idxCol] = 0;
    }
  }
  waysTableA[0][0] = 1; // Base case: one way to achieve sum 0 with no elements
  for ( let outerIdx = 0; outerIdx < elementCount; outerIdx++ ) {
    for ( let innerIdx = 0; innerIdx <= targetSum; innerIdx++ ) {
      waysTableA[outerIdx + 1][innerIdx] += waysTableA[outerIdx][innerIdx];
      waysTableA[outerIdx + 1][innerIdx] %= moduloConst;
      if ( innerIdx + dataString[outerIdx] <= targetSum ) {
        waysTableA[outerIdx + 1][innerIdx + dataString[outerIdx]] += 2 * waysTableA[outerIdx][innerIdx];
        waysTableA[outerIdx + 1][innerIdx + dataString[outerIdx]] %= moduloConst;
      }
    }
  }
  
  var finalResult = 1; // Initialize the final answer variable
  for ( let iterIndex = 0; iterIndex < elementCount; iterIndex++ ) {
    finalResult *= 3; // Multiply by 3 for each element
    finalResult %= moduloConst;
  }
  waysTableA[elementCount] . forEach ( function( currentVal, index, wholeArray ) {
    finalResult -= 3 * currentVal; // Subtract based on the first DP table's results
  } );
  
  var waysTableB = []; // Initialize the second dynamic programming table
  // This second dynamic programming table, waysTableB[r][c], calculates
  // the count of combinations that sum to 'c' using items from dataString[0] to dataString[r-1],
  // considering only 'g' type selections (each contributing 1 way).
  for ( let r = 0; r <= elementCount; r++ ) {
    waysTableB[r] = [];
    for ( let c = 0; c <= targetSum; c++ ) {
      waysTableB[r][c] = 0;
    }
  }
  waysTableB[0][0] = 1; // Base case: one way to achieve sum 0 with no elements
  for ( let r = 0; r < elementCount; r++ ) {
    for ( let c = 0; c <= targetSum; c++ ) {
      waysTableB[r + 1][c] += waysTableB[r][c];
      waysTableB[r + 1][c] %= moduloConst;
      if ( c + dataString[r] <= targetSum ) {
        waysTableB[r + 1][c + dataString[r]] += waysTableB[r][c];
        waysTableB[r + 1][c + dataString[r]] %= moduloConst;
      }
    }
  }
  
  if ( totalSum % 2 === 0 ) { // Conditional adjustment if the total sum is even
    finalResult += 3 * waysTableB[elementCount][targetSum];
    finalResult %= moduloConst;
  }
  finalResult %= moduloConst; // Ensure result is within modulus range
  finalResult += moduloConst; // Handle potential negative results from subtractions
  finalResult %= moduloConst; // Final modular adjustment
  console . log ( finalResult ); // Output the computed result
}

ExecuteProgram ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) );