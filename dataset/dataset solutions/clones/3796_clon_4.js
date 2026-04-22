const processInput = (rawData) => {
  const targetSequence = rawData.split('\n')[1];
  const sequenceLength = targetSequence.length;

  let lowestTally = 3 * Math.pow(10, 5); // Matches original's initial minimum value

  if (sequenceLength === 0) {
    console.log(lowestTally);
    return;
  }

  // Calculate prefix sums for deviations from 'E'
  // `leftSideDeviations[k]` stores the count of non-'E' characters in `targetSequence[0...k-1]`
  const leftSideDeviations = new Array(sequenceLength + 1).fill(0);
  for (let k = 0; k < sequenceLength; k++) {
    leftSideDeviations[k + 1] = leftSideDeviations[k] + (targetSequence[k] === 'E' ? 0 : 1);
  }

  // Calculate suffix sums for deviations from 'W'
  // `rightSideDeviations[k]` stores the count of non-'W' characters in `targetSequence[k+1...sequenceLength-1]`
  const rightSideDeviations = new Array(sequenceLength).fill(0);
  for (let k = sequenceLength - 2; k >= 0; k--) {
    rightSideDeviations[k] = rightSideDeviations[k + 1] + (targetSequence[k + 1] === 'W' ? 0 : 1);
  }

  // Combine prefix and suffix sums to find the total deviation for each potential split point
  for (let segmentIndex = 0; segmentIndex < sequenceLength; segmentIndex++) {
    const currentTally = leftSideDeviations[segmentIndex] + rightSideDeviations[segmentIndex];
    if (currentTally < lowestTally) {
      lowestTally = currentTally;
    }
  }

  console.log(lowestTally);
};

const acquireData = () => require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
processInput(acquireData());