function reverseString(inputStr) {
  const charArray = inputStr.split('');
  const reversedArray = charArray.reverse();
  const resultString = reversedArray.join('');
  return resultString;
}

function processAndCompare(sourceData) {
  const cleanedInput = sourceData.trim();

  const lineSegmentsArray = cleanedInput.split('\n');
  const joinedLineString = lineSegmentsArray.join(',');

  const reversedCleanedInput = reverseString(cleanedInput);

  if (joinedLineString === reversedCleanedInput) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

processAndCompare(require('fs').readFileSync('/dev/stdin', 'utf8'));
