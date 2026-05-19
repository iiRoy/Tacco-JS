'use strict'

function extractAndCount(sourceString) {
  let currentSegment = '';
  let hashSequenceLength = 0;
  let dotSequenceLength = 0;
  let expectingHashBlock = true; // True if we are looking for a '#' sequence, false if looking for a '.' sequence
  let patternEstablished = false; // True once at least one complete '#+.+' block has been found

  for (let charIndex = 0; charIndex < sourceString.length; charIndex++) {
    const currentChar = sourceString[charIndex];

    if (expectingHashBlock) {
      if (currentChar === '#') {
        hashSequenceLength++;
        currentSegment += currentChar;
      } else if (hashSequenceLength > 0) { // Hash block ended, now expect a dot block
        expectingHashBlock = false;
        dotSequenceLength = 0; // Reset dot count for the new block
        if (currentChar === '.') {
          dotSequenceLength++;
          currentSegment += currentChar;
        } else { // Pattern broken by non-#, non-. char, or a '.' when not expected after a hash block
          if (patternEstablished) { // If we already had a valid '#+.+' sequence, stop and use it
            break;
          } else { // No valid pattern yet, reset and continue searching for a new pattern start
            currentSegment = '';
            hashSequenceLength = 0;
            dotSequenceLength = 0;
            expectingHashBlock = true;
          }
        }
      } else { // Not expecting hash, and char is not hash, and no hash count yet. Reset.
        currentSegment = '';
        hashSequenceLength = 0;
        dotSequenceLength = 0;
        expectingHashBlock = true;
      }
    } else { // Expecting dot block
      if (currentChar === '.') {
        dotSequenceLength++;
        currentSegment += currentChar;
      } else if (dotSequenceLength > 0) { // Dot block ended, now expect a hash block
        patternEstablished = true; // We've completed at least one '#+.+' block
        expectingHashBlock = true;
        hashSequenceLength = 0; // Reset hash count for the new block
        if (currentChar === '#') {
          hashSequenceLength++;
          currentSegment += currentChar;
        } else { // Pattern broken by non-#, non-. char, or a '#' when not expected after a dot block
          break; // Keep current segment, it's a valid match
        }
      } else { // Not expecting dot, and char is not dot, and no dot count yet. Reset.
        currentSegment = '';
        hashSequenceLength = 0;
        dotSequenceLength = 0;
        expectingHashBlock = true;
      }
    }
  }

  // Final check after the loop to ensure a complete '#+.+' pattern was established
  if (!patternEstablished && !(hashSequenceLength > 0 && dotSequenceLength > 0 && !expectingHashBlock)) {
    return { white: 0, black: 0 };
  }

  // Count characters in the extracted segment
  const dotCharacters = currentSegment.split('').filter(c => c === '.');
  const finalDotCount = dotCharacters.length;
  const finalHashCount = currentSegment.length - finalDotCount;

  return { white: finalDotCount, black: finalHashCount };
}

function main(inputData) {
  const lines = inputData.trim().split('\n');
  const counts = extractAndCount(lines[1]);
  console.log(Math.min(counts.white, counts.black));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
