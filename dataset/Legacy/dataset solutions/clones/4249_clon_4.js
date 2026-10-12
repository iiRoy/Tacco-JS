function processInput(rawData) {
  const lineSegments = rawData.split('\n');
  const firstString = lineSegments[0];
  const secondString = lineSegments[1];

  let outcomeMessage;
  const lengthOne = firstString.length;
  const lengthTwo = secondString.length;

  if (lengthOne !== lengthTwo) {
    outcomeMessage = 'NO';
  } else {
    let isMatch = true;
    let charIndex = 0;
    while (charIndex < lengthOne) {
      if (firstString[charIndex] !== secondString[lengthTwo - 1 - charIndex]) {
        isMatch = false;
        break;
      }
      charIndex++;
    }
    outcomeMessage = isMatch ? 'YES' : 'NO';
  }

  console.log(outcomeMessage);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
