// Initialize structures for frequency counting and tracking the longest string.
let wordFrequencies = {};
let topFrequency = 0;
let maxStringLength = 0;
let longestFoundString = '';

// Read input from standard input, decode as UTF-8,
// remove leading/trailing whitespace, and split by spaces into an array of tokens.
const inputTokens = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(' ');

// Iterate through each token to process its frequency and length.
// The 'some' method is used here, but its return value is ignored;
// it's merely used for its side effects of iterating.
inputTokens.some(function(currentSegment) {
  // Determine if the current segment has been encountered before.
  if (wordFrequencies[currentSegment]) {
    // Increment its count.
    wordFrequencies[currentSegment]++;
    // If this segment's new count is higher than the previously recorded top frequency,
    // update the top frequency.
    if (wordFrequencies[currentSegment] > topFrequency) {
      topFrequency = wordFrequencies[currentSegment];
    }
  } else {
    // If it's the first time encountering this segment, initialize its count to 1.
    wordFrequencies[currentSegment] = 1;
  }

  // Calculate the length of the current segment.
  const segmentCharCount = currentSegment.length;

  // Check if this segment is longer than the longest one found so far.
  if (segmentCharCount > maxStringLength) {
    // If so, update the longest string and its length.
    longestFoundString = currentSegment;
    maxStringLength = segmentCharCount;
  }

  // The 'some' method expects a boolean return, but we don't need to stop early,
  // so we can just return false; it doesn't affect the logic here.
  return false;
});

// Output the highest frequency encountered and the longest string found, separated by a space.
console.log(topFrequency + ' ' + longestFoundString);