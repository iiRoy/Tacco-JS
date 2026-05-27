var inputSequence = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// This variable stores the very first character of the input string.
// Its value is not directly used in the main calculation logic.
var initialChar = inputSequence[0];

// Initialize a counter for consecutive '<' characters found in a segment.
var lessThanCount = 0;

// Initialize a counter for consecutive '>' characters found in a segment.
var greaterThanCount = 0;

// This variable will accumulate the final sum based on the pattern analysis.
var cumulativeSum = 0;

// Check if the input string begins with a '>' character.
// If it does, prepend a '<' to ensure the processing starts with a '<' segment.
if (inputSequence[0] === '>') {
  inputSequence = '<' + inputSequence;
}

// Begin iterating through the modified input sequence.
// The outer loop's increment is handled by the inner loops.
for (var idx = 0; idx < inputSequence.length; ) {
  // Inner loop to count consecutive '<' characters.
  // It continues as long as the current character is '<' and within bounds.
  for (; idx < inputSequence.length; idx++) {
    if (inputSequence[idx] !== '<') break; // Exit if a non-'<' character is encountered.
    lessThanCount += 1; // Increment the '<' counter.
  }

  // Inner loop to count consecutive '>' characters.
  // It continues as long as the current character is '>' and within bounds.
  for (; idx < inputSequence.length; idx++) {
    if (inputSequence[idx] !== '>') break; // Exit if a non-'>' character is encountered.
    greaterThanCount += 1; // Increment the '>' counter.
  }

  // Conditional logic to calculate the sum based on the comparison of the two counts.
  if (lessThanCount > greaterThanCount) {
    // If there are more '<' characters, sum from 0 up to and including 'lessThanCount'.
    for (var loopVar = 0; loopVar <= lessThanCount; loopVar++) cumulativeSum += loopVar;
    // Then, sum from 0 up to but not including 'greaterThanCount'.
    for (var loopVar = 0; loopVar < greaterThanCount; loopVar++) cumulativeSum += loopVar;
  } else {
    // If there are more or an equal number of '>' characters, sum from 0 up to but not including 'lessThanCount'.
    for (var loopVar = 0; loopVar < lessThanCount; loopVar++) cumulativeSum += loopVar;
    // Then, sum from 0 up to and including 'greaterThanCount'.
    for (var loopVar = 0; loopVar <= greaterThanCount; loopVar++) cumulativeSum += loopVar;
  }

  // Reset the segment counters for the next iteration of the outer loop.
  lessThanCount = 0;
  greaterThanCount = 0;
}

// Print the final calculated cumulative sum to the console.
console.log(cumulativeSum);
