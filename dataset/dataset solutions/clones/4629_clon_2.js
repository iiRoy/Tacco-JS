require('readline')
  .createInterface(
    {
      input:  process.stdin,
      output: process.stdout
    }
  )
  .on(
    'line',
    processInputLine
  );

// This global variable acts as a gate to skip the very first input line.
var  toggleSwitch = false ;

/**
 * This function is activated for every line received from standard input.
 * It processes numerical data, calculates trends, and outputs a final count.
 * @param {string} inputString - The textual content of the current input line.
 */
function processInputLine( inputString ) {
  // On the initial call, `toggleSwitch` is `false`. `!toggleSwitch` makes it `true`.
  // The assignment `toggleSwitch = true` makes it skip the current line.
  // For subsequent calls, `toggleSwitch` is `true`, `!toggleSwitch` makes it `false`,
  // and the `if` condition evaluates to `false`, allowing processing to continue.
  if ( ( toggleSwitch = !toggleSwitch ) )
    return ;

  // Convert the space-separated string of numbers into an array of integers.
  const numericalValues = inputString
                            .split(  ' '  )
                            .map(  item => parseInt( item, 10 )  ) ;

  // Analyze the sequence of numbers to determine the direction of change between consecutive elements.
  const directionalIndicators = determineDirections( ...numericalValues ) ;

  // Compute a final aggregated value based on the sequence of directional indicators.
  const finalTally = tallyDifferences( 1 ,  ...directionalIndicators ) ;

  // Display the calculated result to the standard output.
  console.log( finalTally ) ;
}

/**
 * Recursively determines the sign of the difference between adjacent numbers in a sequence.
 * This function effectively creates an array of -1, 0, or 1 for each pair (b-a).
 * @param {number} firstVal - The initial number in the current pair being examined.
 * @param {number} secondVal - The subsequent number in the current pair.
 * @param {...number} remainingVals - Any additional numbers left in the sequence.
 * @returns {number[]} An array containing the signs of differences. An empty array is returned if no valid comparison can be made.
 */
function determineDirections( firstVal ,  secondVal ,  ...remainingVals ) {
  // Calculate the mathematical sign of the difference (secondVal - firstVal).
  // Returns -1 for negative, 0 for zero, 1 for positive.
  const differenceSign = Math.sign( secondVal - firstVal ) ;

  // If the difference is not a valid number (e.g., if 'secondVal' is undefined),
  // it means we've reached the end of the sequence, so return an empty array.
  // Otherwise, prepend the current difference sign to the result of the recursive call.
  return  isNaN( differenceSign )
        ? []
        : [ differenceSign ,  ...determineDirections( secondVal, ...remainingVals ) ] ;
}

/**
 * Recursively counts the number of times consecutive directional indicators are different.
 * It compares valueOne with valueTwo, then valueTwo with the next, and so on.
 * @param {number} currentCount - The running total of discrepancies found so far.
 * @param {number} valueOne - The first directional indicator in the current comparison.
 * @param {number} valueTwo - The second directional indicator in the current comparison.
 * @param {...number} subsequentValues - Any remaining directional indicators in the sequence.
 * @returns {number} The final accumulated count of differing consecutive indicators.
 */
function tallyDifferences( currentCount ,  valueOne ,  valueTwo ,  ...subsequentValues ) {
  // A previous debug line that was commented out, now completely removed.

  // If 'valueTwo' is undefined, it indicates that there are no more pairs to compare,
  // signifying the end of the recursion. Return the current accumulated count.
  if ( typeof  valueTwo  ===  'undefined' )
    return  currentCount ;

  // Compare 'valueOne' and 'valueTwo'.
  // If they are not equal, increment 'currentCount' and proceed with the next pair
  // (valueTwo becomes the new valueOne, and the first of 'subsequentValues' becomes the new valueTwo).
  // If they are equal, keep 'currentCount' as is and proceed with the next pair,
  // effectively skipping 'valueTwo' and using 'valueOne' as the new reference for the next comparison.
  return ( valueOne  !==  valueTwo )
         ? tallyDifferences( ++currentCount ,  ...subsequentValues )
         : tallyDifferences( currentCount ,  valueOne ,  ...subsequentValues ) ;
}