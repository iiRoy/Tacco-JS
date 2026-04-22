"use strict" ; /* Enable strict mode for enhanced error handling and cleaner code. */

function executeProgram ( dataSource )
{
  // Parse the incoming data stream by splitting it into lines.
  // Empty lines are discarded to ensure valid numerical processing.
  const parsedLines = dataSource . split ( "\n" ) . filter ( lineContent => lineContent !== "" ) ;
  
  // Extract the first numerical value from the parsed lines to serve as an upper bound.
  let upperBound = Number ( parsedLines [ 0 ] ) ;

  /**
   * Computes the frequency of each prime factor for all integers from 2 up to 'limitVal'.
   * @param {number} limitVal - The maximum number to consider for prime factorization.
   * @returns {number[]} An array where index 'p' stores the total count of prime 'p'
   *                     across all numbers from 2 to limitVal.
   */
  function factorizeCounts ( limitVal )
  {
    // Initialize an array to hold the tallies of prime factors.
    // The array size is 'limitVal + 1' to allow direct indexing by prime number.
    let primeFactorTallies = Array ( limitVal + 1 ) . fill ( 0 ) ;
    
    // Iterate through each integer from 2 up to the specified limit.
    for ( let currentNumber = 2 ; currentNumber <= limitVal ; currentNumber ++ )
    {
      let tempNumber = currentNumber ; // A temporary variable to perform divisions without altering the loop counter.
      
      // Attempt to divide 'tempNumber' by potential prime divisors, starting from 2.
      for ( let divisorCandidate = 2 ; divisorCandidate <= currentNumber ; divisorCandidate ++ )
      {
        // Continuously divide 'tempNumber' by 'divisorCandidate' as long as it's divisible.
        // Each division indicates a prime factor instance.
        while ( tempNumber % divisorCandidate === 0 )
        {
          primeFactorTallies [ divisorCandidate ] += 1 ; // Increment the count for this prime factor.
          tempNumber = tempNumber / divisorCandidate ; // Reduce 'tempNumber'.
        }
      }
    }
    return primeFactorTallies ; // Return the accumulated prime factor counts.
  } // End of factorizeCounts.

  /**
   * Counts how many elements within a given collection meet or exceed a specified threshold.
   * @param {number} thresholdValue - The minimum value an element must have to be counted.
   * @param {number[]} dataCollection - The array of numbers to be evaluated.
   * @returns {number} The total count of elements satisfying the condition.
   */
  function countElementsGreaterOrEqual( thresholdValue , dataCollection )
  {
    // Use the filter method to select relevant elements and then get the count.
    return dataCollection . filter ( itemValue => itemValue >= thresholdValue ) . length ;
  }

  /**
   * Calculates the number of combinations (n choose k).
   * This function is defined but not utilized in the main execution path.
   * @param {number} totalItems - The total number of items available (n).
   * @param {number} itemsToChoose - The number of items to choose (k).
   * @returns {number} The computed combination value.
   */
  function calcCombinations ( totalItems , itemsToChoose )
  {
    let combinationResult = 1 ; // Initialize the product for the combination calculation.
    
    // Calculate the numerator part of the combination formula (n * (n-1) * ... * (n-k+1)).
    for ( let iteratorVar = totalItems ; iteratorVar > totalItems - itemsToChoose ; iteratorVar = iteratorVar - 1 )
    {
      combinationResult = combinationResult * iteratorVar ;
    }

    // Calculate the denominator part (k!).
    for ( let iteratorVar = itemsToChoose ; iteratorVar > 0 ; iteratorVar = iteratorVar - 1 )
    {
      combinationResult = combinationResult / iteratorVar ;
    }
    return combinationResult ; // Return the final combination result.
  } // End of calcCombinations.

  // Compute the prime factor occurrences for all numbers up to the determined upper bound.
  let primeFactorOccurrences = factorizeCounts ( upperBound ) ;

  // Calculate the number of distinct prime factors that appear at least specific thresholds.
  let countAtLeast74 = countElementsGreaterOrEqual ( 74 , primeFactorOccurrences ) ;
  let countAtLeast24 = countElementsGreaterOrEqual ( 24 , primeFactorOccurrences ) ;
  let countAtLeast14 = countElementsGreaterOrEqual ( 14 , primeFactorOccurrences ) ;
  let countAtLeast4  = countElementsGreaterOrEqual ( 4  , primeFactorOccurrences ) ;
  let countAtLeast2  = countElementsGreaterOrEqual ( 2  , primeFactorOccurrences ) ;

  // These variables are defined in the original source, but their values are directly
  // embedded in the final console.log expression rather than being referenced by name.
  // They represent distinct components of a larger combinatorial sum.
  let termFiveFiveThree     = ( countAtLeast4 * ( countAtLeast4 - 1 ) * ( countAtLeast2 - 2 ) ) / 2 ;
  let termFifteenFive       =   countAtLeast14 * ( countAtLeast4 - 1 ) ;
  let termTwentyFiveThree   =   countAtLeast24 * ( countAtLeast2 - 1 ) ;
  let termSeventyFive       =   countAtLeast74 ;

  // Print the final aggregated result to the standard output.
  // This sum corresponds to a particular counting problem solution.
  console . log (
      countAtLeast74
    + countAtLeast24 * ( countAtLeast2 - 1 )
    + countAtLeast14 * ( countAtLeast4 - 1 )
    + ( countAtLeast4 * ( countAtLeast4 - 1 ) * ( countAtLeast2 - 2 ) ) / 2
  ) ;
}

// Initiate the program by reading input from the standard input stream.
executeProgram ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;