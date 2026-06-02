function processInput(rawData) {
  const lines = rawData.split('\n');
  const numVal = parseInt(lines[0], 10);
  const digitSequence = lines[1].split('').map(Number);

  const generateDigitArray = (val) => {
    const paddedString = String(val).padStart(3, '0');
    return paddedString.split('').map(Number);
  };

  const potentialMatches = [];
  const maxCandidateValue = 1000;
  for (let idx = 0; idx < maxCandidateValue; idx++) {
    const currentCandidateDigits = generateDigitArray(idx);
    potentialMatches.push(currentCandidateDigits);
  }

  let matchCount = 0;
  const requiredMatchLength = 3;

  for (const currentCandidate of potentialMatches) {
    let candidateDigitIndex = 0;
    let candidateFoundInSequence = false;

    for (const currentDigit of digitSequence) {
      if (currentDigit !== currentCandidate[candidateDigitIndex]) {
        continue;
      }

      candidateDigitIndex++;

      if (candidateDigitIndex === requiredMatchLength) {
        candidateFoundInSequence = true;
        break;
      }
    }

    if (candidateFoundInSequence) {
      matchCount++;
    }
  }
  console.log(matchCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
