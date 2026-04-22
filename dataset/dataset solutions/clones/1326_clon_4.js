const fileSystem = require('fs');

const circularShift = (baseSequence, displacementValue) => {
  if (baseSequence.length === 0) {
    return '';
  }
  // The original implementation using substr(h) + substr(0, h)
  // results in no change if h is greater than or equal to the string's length.
  if (displacementValue >= baseSequence.length) {
    return baseSequence;
  }
  
  const characterElements = Array.from(baseSequence);
  const displacedSection = characterElements.splice(0, displacementValue);
  return characterElements.concat(displacedSection).join('');
};

const processSegmentsRecursively = (remainingFragments, collectedOutcomes) => {
  if (remainingFragments[0] === '-') {
    return collectedOutcomes;
  }

  let currentMainSequence = remainingFragments[0];
  let operationCount = parseInt(remainingFragments[1], 10);

  const applySeriesOfShifts = (sequenceState, shiftsRemaining, shiftValuePointer) => {
    if (shiftsRemaining === 0) {
      return sequenceState;
    }
    const specificShiftValue = parseInt(remainingFragments[shiftValuePointer], 10);
    const nextSequenceState = circularShift(sequenceState, specificShiftValue);
    return applySeriesOfShifts(nextSequenceState, shiftsRemaining - 1, shiftValuePointer + 1);
  };

  const finalStateForThisSegment = applySeriesOfShifts(currentMainSequence, operationCount, 2);

  const nextFragmentsStart = 2 + operationCount;
  const nextRemainingFragments = remainingFragments.slice(nextFragmentsStart);

  return processSegmentsRecursively(nextRemainingFragments, collectedOutcomes.concat(finalStateForThisSegment));
};

const acquiredContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const allInputLines = acquiredContent.trim().split('\n');

const finalOutcomes = processSegmentsRecursively(allInputLines, []);

process.stdout.write(finalOutcomes.join('\n') + '\n');