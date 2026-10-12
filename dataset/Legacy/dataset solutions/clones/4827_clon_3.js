function strReverse(inputStr) {
  return inputStr.split('').reverse().join('');
}

function canFormString(originalString) {
  const reversedTargets = ['remard', 'maerd', 'resare', 'esare']; // Pre-reversed target words
  let remainingReversed = strReverse(originalString);

  while (remainingReversed.length > 0) {
    let matchFoundInIteration = false;
    for (const currentTarget of reversedTargets) {
      if (remainingReversed.startsWith(currentTarget)) {
        const matchedSegmentLength = currentTarget.length;
        remainingReversed = remainingReversed.substring(matchedSegmentLength);
        matchFoundInIteration = true;
        break; // Found a match, exit inner loop to continue with the next segment
      }
    }
    if (!matchFoundInIteration) {
      return false; // No target word matched the beginning of the remaining string
    }
  }
  return true; // Successfully decomposed the entire string
}

function processInput(rawData) {
  const isDecomposable = canFormString(rawData);
  if (isDecomposable) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
