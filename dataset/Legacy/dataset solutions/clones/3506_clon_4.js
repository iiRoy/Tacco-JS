function processInput(rawText) {
  const initialNum = parseInt(rawText.split('\n')[0], 10);

  const checkHomogeneity = (numVal) => {
    const numTxt = String(numVal);
    if (numTxt.length === 0) return false;
    return numTxt === numTxt[0].repeat(numTxt.length);
  };

  function* homogeneousNumberSequence(startValue) {
    let currentCandidate = startValue;
    while (true) {
      if (checkHomogeneity(currentCandidate)) {
        yield currentCandidate;
        return;
      }
      currentCandidate++;
    }
  }

  const sequenceIterator = homogeneousNumberSequence(initialNum);
  const foundNumber = sequenceIterator.next().value;

  console.log(String(foundNumber));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
