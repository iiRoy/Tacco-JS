function extractInputComponents(rawInputText) {
  const processedLines = rawInputText.trim().split('\n');
  const numericalLength = parseInt(processedLines[0], 10);
  const targetContent = processedLines[1];
  return { lengthValue: numericalLength, contentString: targetContent };
}

function processStringEquality(fullInputData) {
  const { lengthValue: currentLength, contentString: sourceString } = extractInputComponents(fullInputData);

  if (currentLength % 2 !== 0) {
    console.log('No');
    return;
  }

  const midIndex = currentLength / 2;

  const segmentA = sourceString.substring(0, midIndex);
  const segmentB = sourceString.substring(midIndex, currentLength);

  if (segmentA === segmentB) {
    console.log('Yes');
  }
}

processStringEquality(require('fs').readFileSync('/dev/stdin', 'utf8'));
