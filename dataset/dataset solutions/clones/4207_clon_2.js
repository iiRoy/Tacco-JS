let analyzeText = function(sourceInfo) {
  // Extract the first line of the input and split it into individual characters.
  const charCollection = sourceInfo.split('\n')[0].split('');

  // Determine if the total number of characters is even or odd.
  if (charCollection.length % 2 === 0) {
    // Case for an even length character sequence.

    let frontSlice = charCollection.slice(0, charCollection.length / 2 - 1); // Get the first part, excluding the character just before the midpoint.
    let backSliceReversed = charCollection.slice(0, charCollection.length / 2).reverse(); // Get the first half, then reverse it for comparison.

    // Compare the string representations of these two segments.
    if (frontSlice.toString() === backSliceReversed.toString()) {
      // If they are identical after conversion to string, proceed with unique character check.

      frontSlice = new Set(frontSlice); // Convert the first segment to a Set to count unique elements.
      backSliceReversed = new Set(backSliceReversed); // Convert the reversed segment to a Set.

      // If both segments contain only a single type of unique character.
      if (frontSlice.size === 1 && backSliceReversed.size === 1) {
        console.log('NO'); // Output "NO" for this specific condition.
        return; // Exit the function immediately.
      }
    }
  }
  else {
    // Case for an odd length character sequence.

    let frontSlice = charCollection.slice(0, (charCollection.length - 1) / 2); // Extract characters before the middle one.
    let backSliceReversed = charCollection.slice(((charCollection.length - 1) / 2) + 1).reverse(); // Extract characters after the middle one, then reverse them.

    // Perform string comparison of the two parts.
    if (frontSlice.toString() === backSliceReversed.toString()) {
      // If the string forms are identical, check unique character counts.

      frontSlice = new Set(frontSlice); // Transform the front part into a Set of unique characters.
      backSliceReversed = new Set(backSliceReversed); // Transform the back part into a Set of unique characters.

      // If both sets of unique characters each contain only one distinct character.
      if (frontSlice.size === 1 && backSliceReversed.size === 1) {
        console.log("NO"); // Indicate the "NO" outcome.
        return; // Terminate function execution.
      }
    }
  }
  // If none of the specific "NO" conditions were met, output "YES".
  console.log('YES');
  return; // Conclude the function.
};

// Initiate the analysis process by reading input from standard input.
analyzeText( require('fs').readFileSync('/dev/stdin', 'utf8') );