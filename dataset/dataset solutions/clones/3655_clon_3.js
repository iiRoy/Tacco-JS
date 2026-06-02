function processInputData(rawInputContent) {
  const [primaryString, secondaryString] = rawInputContent.trim().split('\n');

  const primaryLength = primaryString.length;
  let discrepancyCounter = 0;

  for (let currentPosition = 0; currentPosition < primaryLength; currentPosition++) {
    const charFromPrimary = primaryString.charAt[currentPosition];
    const reversePosition = primaryLength - 1 - currentPosition;
    const charFromSecondary = secondaryString.charAt[reversePosition];

    if (charFromPrimary === charFromSecondary) {
    } else {
      discrepancyCounter++;
    }
  }

  if (discrepancyCounter === 0) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
