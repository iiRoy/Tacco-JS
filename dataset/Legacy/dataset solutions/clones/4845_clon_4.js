const process = require('process');

function determineFinalFlagState(currentSequence, currentFlagValue) {
  const deletionCandidateIndex = currentSequence.findIndex((_, position, sequenceArray) =>
    position > 0 && position < sequenceArray.length - 1 && sequenceArray[position - 1] !== sequenceArray[position + 1]
  );

  if (deletionCandidateIndex === -1) {
    return currentFlagValue;
  }

  const nextSequence = [...currentSequence];
  nextSequence.splice(deletionCandidateIndex, 1);

  return determineFinalFlagState(nextSequence, !currentFlagValue);
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const initialString = inputData.trim();

const charArrayRepresentation = initialString.split('');

const finalResultFlag = determineFinalFlagState(charArrayRepresentation, true);

if (finalResultFlag) {
  console.log("Second");
} else {
  console.log("First");
}
