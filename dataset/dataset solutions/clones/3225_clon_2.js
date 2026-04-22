/*
 * This function serves as the primary entry point for processing input data.
 * It reads various numerical parameters and performs a series of calculations
 * to determine a specific cumulative value based on the given measurements.
 */
function computeResult ( sourceData )
{
  // First, the raw input string is segmented into an array of lines.
  const textSegments = sourceData.split('\n');

  // The initial line holds two configuration numbers, separated by a space.
  var dimensionsText = textSegments[0].split(' ');
  // The subsequent line contains a collection of raw rotation measurement strings.
  var rotationMeasures = textSegments[1].split(' ');

  // Convert the first configuration number (N) to an integer.
  var maxSegments = parseInt(dimensionsText[0]);
  // Convert the second configuration number (M) to an integer.
  var totalSpins = parseInt(dimensionsText[1]);

  // Iterate through the array of string-based rotation measurements.
  // Each string is converted into its integer representation.
  for ( var loopVar = 0; loopVar < totalSpins; loopVar++ ) {
    rotationMeasures[loopVar] = parseInt(rotationMeasures[loopVar]);
  }

  // Sort the array of integer rotation measurements in ascending numerical order.
  rotationMeasures.sort( function ( elem1, elem2 ) { return elem1 - elem2; } );

  // Declare an array to store the absolute differences between consecutive sorted measurements.
  // This array is pre-allocated to the correct size.
  var spanDifferences = new Array(totalSpins - 1);

  // Calculate the absolute difference between each adjacent pair of sorted measurements.
  // These differences represent the 'gaps' between the rotation points.
  for ( var loopVar = 0; loopVar < totalSpins - 1; loopVar++ )
  {
    spanDifferences[loopVar] = Math.abs(rotationMeasures[loopVar] - rotationMeasures[loopVar + 1]);
  }

  // Initialize a placeholder variable for an intermediate cumulative sum.
  var cumulativeValue = 0;

  // If the number of available spins is less than the specified maximum segments,
  // the maximum segments limit is adjusted downwards to match the available spins.
  if ( totalSpins < maxSegments ) {
    maxSegments = totalSpins;
  }

  // Variable to store the array index of the currently largest gap.
  var maxGapIndex = 0;
  // Initialize the final sum variable, which will hold the ultimate result.
  var finalSum = 0;

  // This loop identifies and effectively removes the (maxSegments - 1) largest gaps.
  // By setting them to zero, they will not contribute to the final sum.
  for ( var loopVar = 0; loopVar < maxSegments - 1; loopVar++ ) {
    // Find the index of the maximum value within the 'spanDifferences' array.
    maxGapIndex = spanDifferences.indexOf(Math.max.apply(null, spanDifferences));
    // Neutralize the largest gap by setting its value to zero.
    spanDifferences[maxGapIndex] = 0;
  }

  // Iterate through the modified 'spanDifferences' array.
  // All remaining (non-zero) differences are added to the final sum.
  for ( var loopVar = 0; loopVar < totalSpins - 1; loopVar++ ) {
    finalSum += spanDifferences[loopVar];
  }

  // The computed final sum is then printed to the standard output.
  console.log( finalSum );
}

// The main processing function is invoked here,
// reading its input from the standard input stream as a UTF-8 string.
computeResult( require('fs').readFileSync('/dev/stdin', 'utf8') );