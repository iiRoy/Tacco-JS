'use strict'

function processFormation(inputData) {
  const lines = inputData.split('\n');
  const squadSize = Number.parseInt(lines[0], 10);
  const formation = lines[1];

  let totalEastbound = 0;
  for (let charIndex = 0; charIndex < squadSize; charIndex++) {
    if (formation[charIndex] === 'E') {
      totalEastbound++;
    }
  }

  let westboundLeft = 0;
  let leastDisruption = Number.MAX_SAFE_INTEGER;

  // The loop iterates through potential split points.
  // 'currentPosition' represents the index of the first character of the right segment.
  // So, the left segment is 'formation[0...currentPosition-1]'
  // and the right segment is 'formation[currentPosition...squadSize-1]'.
  // This covers 'squadSize' distinct split configurations, from splitting before the first character
  // to splitting before the last character.
  for (let currentPosition = 0; currentPosition < squadSize; currentPosition++) {
    // Calculate the cost for the current split point:
    // 'westboundLeft' holds the count of 'W's in the left segment (formation[0...currentPosition-1]).
    // 'totalEastbound' holds the count of 'E's in the right segment (formation[currentPosition...squadSize-1]).
    leastDisruption = Math.min(leastDisruption, westboundLeft + totalEastbound);

    // Update counts for the next iteration's split point (which will be before formation[currentPosition+1]).
    // The character at 'currentPosition' now moves from the right segment to the left segment.
    if (formation[currentPosition] === 'W') {
      westboundLeft++;
    } else { // 'E'
      totalEastbound--;
    }
  }

  console.log(leastDisruption);
}

processFormation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
