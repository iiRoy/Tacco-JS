function checkOppositeSequence(primaryText, secondaryText) {
  const primaryLength = primaryText.length;
  const secondaryLength = secondaryText.length;

  if (primaryLength !== secondaryLength) {
    return false;
  }

  for (let idx = 0; idx < primaryLength; idx++) {
    if (primaryText[idx] !== secondaryText[primaryLength - 1 - idx]) {
      return false;
    }
  }

  return true;
}

function processInputData(rawStreamContent) {
  const contentLines = rawStreamContent.split('\n');
  const initialString = contentLines[0];
  const comparisonString = contentLines[1];

  let finalVerdict;
  if (checkOppositeSequence(initialString, comparisonString)) {
    finalVerdict = 'YES';
  } else {
    finalVerdict = 'NO';
  }

  console.log(finalVerdict);
}

const textInputSource = require('fs');
const inputBuffer = textInputSource.readFileSync('/dev/stdin', 'utf8');

processInputData(inputBuffer);