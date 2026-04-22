/* This self-executing anonymous function encapsulates the entire program logic. */
(  function   runSolution() {
  // Read all input from standard input, decode it, clean whitespace, and split into individual lines.
  const   rawInputLines   =   require( 'fs' ) .  readFileSync( '/dev/stdin' ,  'utf8' ) .  trim() .  split( '\n' ) ;

  // The first line contains the count of elements for the primary numeric set.
  const   countElements   =   Number( rawInputLines.shift() ) ;

  // The next line contains the actual numeric elements, parsed as numbers.
  const   sourceNumbers   =   rawInputLines.shift() .  split( ' ' ) .  map( Number ) ;

  // The line after that specifies how many target sums we need to check.
  const   targetCount   =   Number( rawInputLines.shift() ) ;

  // Finally, the last line provides the list of target sums to evaluate.
  const   desiredSums   =   rawInputLines.shift() .  split( ' ' ) .  map( Number ) ;


  /**
   * Recursively determines if a subset of 'sourceNumbers' starting from 'currentIndex'
   * can sum up to 'remainingSum'.
   * @param {number} currentIndex - The current index in 'sourceNumbers' to consider.
   * @param {number} remainingSum - The sum that still needs to be achieved.
   * @returns {boolean} True if 'remainingSum' can be formed, false otherwise.
   */
  const   checkSubsetSum   =   ( currentIndex ,  remainingSum )   =>   {
    // Base case 1: If the remaining sum is zero, we have successfully found a subset.
    if   ( remainingSum   ===   0 )   {
      return   true ;
    }

    // Base case 2: If we have exhausted all elements in 'sourceNumbers'
    // and 'remainingSum' is still not zero, then it's impossible.
    if   ( currentIndex   >=   countElements )   {
      return   false ;
    }

    // Recursive step: Explore two possibilities:
    // 1. Exclude the current element (sourceNumbers[currentIndex]) and move to the next.
    // 2. Include the current element, subtract its value from 'remainingSum', and move to the next.
    // If either of these paths leads to a solution, then 'possible' is true.
    let   possible   =   checkSubsetSum( currentIndex   +   1 ,   remainingSum )   ||
                       checkSubsetSum( currentIndex   +   1 ,   remainingSum   -   sourceNumbers[ currentIndex ] ) ;

    return   possible ; // Return the outcome of the recursive calls.
  } ; // End of checkSubsetSum function definition.


  // Iterate through each desired target sum.
  // For each target, call the recursive function 'checkSubsetSum' starting from the first element (index 0).
  // Map the boolean result to 'yes' or 'no' strings.
  // Then, print each resulting string to the console.
  desiredSums .  map( ( targetVal )   =>   {
    return   checkSubsetSum( 0 ,   targetVal )   ?   'yes'   :   'no' ;
  } ) .  forEach( ( outcomeString )   =>   {
    console.log( outcomeString ) ;
  } ) ;

} ) ( ) ; // Invoke the anonymous function.