function processInput(rawText) {
  const singleChar = rawText.trim();
  let outputValue;
  const isValidSingleLowerAlpha = (singleChar.length === 1 && singleChar >= 'a' && singleChar <= 'z');

  if (!isValidSingleLowerAlpha) {
    outputValue = 'a';
  } else if (singleChar === 'z') {
    outputValue = undefined;
  } else {
    outputValue = String.fromCharCode(singleChar.charCodeAt(0) + 1);
  }

  console.log(outputValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
