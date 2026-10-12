'use strict';

function acquireInputData() {
  return require('fs').readFileSync('/dev/stdin', 'utf8');
}

function containsAllRequiredDigits(numericValue) {
  const encounteredDigits = new Set();
  let workingNumber = numericValue;

  if (workingNumber === 0) {
    encounteredDigits.add('0');
  } else {
    while (workingNumber > 0) {
      encounteredDigits.add(String(workingNumber % 10));
      workingNumber = Math.floor(workingNumber / 10);
    }
  }
  return encounteredDigits.has('3') && encounteredDigits.has('5') && encounteredDigits.has('7');
}

function processShichiGoSanCount(rawInputText) {
  const upperLimit = Number(rawInputText.trim());
  let totalValidCount = 0;
  const numberGenerationQueue = [];

  if (3 <= upperLimit) {
    numberGenerationQueue.push(3);
  }
  if (5 <= upperLimit) {
    numberGenerationQueue.push(5);
  }
  if (7 <= upperLimit) {
    numberGenerationQueue.push(7);
  }

  let queueReadPointer = 0;

  while (queueReadPointer < numberGenerationQueue.length) {
    const currentCandidateNumber = numberGenerationQueue[queueReadPointer++];

    if (containsAllRequiredDigits(currentCandidateNumber)) {
      totalValidCount++;
    }

    const nextCandidateEndingIn3 = currentCandidateNumber * 10 + 3;
    const nextCandidateEndingIn5 = currentCandidateNumber * 10 + 5;
    const nextCandidateEndingIn7 = currentCandidateNumber * 10 + 7;

    if (nextCandidateEndingIn3 <= upperLimit) {
      numberGenerationQueue.push(nextCandidateEndingIn3);
    }
    if (nextCandidateEndingIn5 <= upperLimit) {
      numberGenerationQueue.push(nextCandidateEndingIn5);
    }
    if (nextCandidateEndingIn7 <= upperLimit) {
      numberGenerationQueue.push(nextCandidateEndingIn7);
    }
  }

  console.log(totalValidCount);
}

processShichiGoSanCount(acquireInputData());
