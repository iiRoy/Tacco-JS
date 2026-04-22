const processInput = (rawText) => {
  const referencePhrase = 'keyence';
  const queryPhrase = rawText.split('\n')[0];
  let outcome = false;

  for (let splitPoint = 0; splitPoint <= referencePhrase.length; splitPoint++) {
    const initialPart = referencePhrase.substring(0, splitPoint);
    const finalPart = referencePhrase.substring(splitPoint);

    if (queryPhrase.startsWith(initialPart) && queryPhrase.endsWith(finalPart)) {
      if (initialPart.length + finalPart.length <= queryPhrase.length) {
        outcome = true;
        break;
      }
    }
  }

  console.log(outcome ? 'YES' : 'NO');
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));