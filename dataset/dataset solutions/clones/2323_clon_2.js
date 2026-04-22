/*
 * This routine combines elements from two input sources
 * into a single concatenated string based on a specified count.
 */
function mergeStringElements( elementCount, sourceArrayA, sourceArrayB )
{
  // Initialize the final output string accumulator
  let resultingText = "";

  // Iterate through the elements up to the given count
  for ( let currentIdx = 0; currentIdx < elementCount; currentIdx++ )
  {
    // Append the corresponding elements from both sources
    // to the accumulating result string.
    resultingText += sourceArrayA[currentIdx] + sourceArrayB[currentIdx];
  }

  // Return the complete combined string
  return resultingText;
}