'use strict'

// Primary function to handle and dissect the incoming textual data.
function processInputData(sourceText) {
  // Initial parsing step:
  // 1. Remove leading/trailing whitespace from the entire input.
  // 2. Split the cleaned input into an array of lines.
  // 3. Focus on the second line (index 1) as per specific requirements.
  // 4. Attempt to find a distinct pattern consisting of one or more '#' followed by one or more '.'
  //    This pattern may repeat. The first full match is what we're interested in.
  let matchedSequence = sourceText.trim().split('\n')[1].match(/(\#+\.+)+/);

  // Determine the count of period symbols within the identified sequence.
  // If no sequence was matched, the count defaults to zero.
  const periodCount = matchedSequence
    ? matchedSequence[0].match(/\./g).length // Count all occurrences of '.' in the matched string.
    : 0;

  // Calculate the number of hash symbols.
  // This is derived by subtracting the period count from the total length of the matched sequence.
  const hashSymbolCount = matchedSequence
    ? matchedSequence[0].length - periodCount
    : 0;

  // Output the smaller value between the counted periods and hash symbols to the console.
  console.log(Math.min(periodCount, hashSymbolCount));
}

// Begin execution:
// 1. Utilize the 'fs' (file system) module to read content.
// 2. Specify the standard input stream ('/dev/stdin') as the source.
// 3. Ensure the content is decoded using UTF-8 encoding.
// 4. Store the entire file content in a dedicated variable.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the obtained file content.
processInputData(fileContent);