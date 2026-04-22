// This function analyzes a given string sequence based on character patterns
function ProcessInputData(receivedContent)
{
  // Extract the first line from the input and convert it into an array of individual characters
  let charSequence = receivedContent.split('\n')[0].split('');

  // Evaluate initial conditions for the character sequence
  // If all characters are identical and the sequence has more than one character
  if ((new Set(charSequence)).size === 1 && charSequence.length > 1) {
    console.log("NO"); // Output negative determination
    return;
  }

  // If there are exactly two distinct characters and the sequence length is precisely two
  if ((new Set(charSequence)).size === 2 && charSequence.length === 2) {
    console.log("YES"); // Output positive determination
    return;
  }

  // If the sequence contains exactly three distinct characters
  if ((new Set(charSequence)).size === 3) {
    console.log("YES"); // Output positive determination
    return;
  }

  // Proceed with checks based on the sequence's total character count parity
  if (charSequence.length % 2 === 0) { // For sequences with an even number of elements
    // Define the first segment, excluding the last character of the first half
    let initialSegment = charSequence.slice(0, charSequence.length / 2 - 1);
    // Define the second segment as the first half, but reversed
    let reversedSecondSegment = charSequence.slice(0, charSequence.length / 2).reverse();

    // Compare the string representations of these two generated segments
    if (initialSegment.toString() === reversedSecondSegment.toString()) {
      // Re-assign segments as Set objects to easily check for unique character counts
      initialSegment = new Set(initialSegment);
      reversedSecondSegment = new Set(reversedSecondSegment);
      // If both segments, when treated as sets, contain only one unique character each
      if (initialSegment.size === 1 && reversedSecondSegment.size === 1) {
        console.log("NO"); // Output negative determination
        return;
      }
    }
  }
  else { // For sequences with an odd number of elements
    // Define the first segment up to the middle character (exclusive)
    let initialSegment = charSequence.slice(0, ((charSequence.length - 1) / 2));
    // Define the second segment starting after the middle character, then reverse it
    let reversedSecondSegment = charSequence.slice(((charSequence.length - 1) / 2) + 1).reverse();

    // Perform a string-based comparison between the two parts
    if (initialSegment.toString() === reversedSecondSegment.toString()) {
      // Convert the segments into Sets to count their unique elements
      initialSegment = new Set(initialSegment);
      reversedSecondSegment = new Set(reversedSecondSegment);
      // Check if both resulting sets each contain only one distinct item
      if (initialSegment.size === 1 && reversedSecondSegment.size === 1) {
        console.log("NO"); // Output negative determination
        return;
      }
    }
  }

  // If none of the preceding conditions resulted in an early exit, the outcome is positive
  console.log("YES");
  return; // Terminate function execution
}

// Call the main processing function with data obtained from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));