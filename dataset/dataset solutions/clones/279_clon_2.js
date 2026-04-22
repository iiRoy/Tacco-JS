let processedWords = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .replace(/,/g, '')
  .trim()
  .split(/\s/);

let outputSegments = [];
let currentSegment = '';

for (let currentIdx = 0; currentIdx < processedWords.length; currentIdx++) {
  // Check if the word contains a dot
  if (processedWords[currentIdx].replace(/\./g, '').length < processedWords[currentIdx].length) {
    // If it contains a dot, check its length after dot removal
    if (
      processedWords[currentIdx].replace(/\./g, '').length >= 3 &&
      processedWords[currentIdx].replace(/\./g, '').length <= 6
    ) {
      // If the dot is at or near the end, finalize the segment
      if (processedWords[currentIdx].search(/\./) >= processedWords[currentIdx].length - 1) {
        currentSegment += processedWords[currentIdx].replace(/\./g, '');
        outputSegments.push(currentSegment);
      } else {
        // Otherwise, append the word as is
        currentSegment += processedWords[currentIdx];
      }
      // Reset the current segment builder
      currentSegment = '';
    } else {
      // If dot-removed length is out of range, push the current segment and reset
      outputSegments.push(currentSegment);
      currentSegment = '';
    }
  } else if (processedWords[currentIdx].length >= 3 && processedWords[currentIdx].length <= 6) {
    // If no dot and length is in range, append with a space
    currentSegment += processedWords[currentIdx] + ' ';
  }
}

// Display each collected segment
for (let resultIndex = 0; resultIndex < outputSegments.length; ) {
  console.log(outputSegments[resultIndex++]);
}