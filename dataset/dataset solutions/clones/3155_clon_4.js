function processInput(rawInput) {
  const [firstNumStr, secondNumStr, rankStr] = rawInput.split(' ');
  const firstNum = Number(firstNumStr);
  const secondNum = Number(secondNumStr);
  const rank = Number(rankStr);

  const smallerVal = Math.min(firstNum, secondNum);
  const largerVal = Math.max(firstNum, secondNum);

  const commonDivisorCollection = [];
  for (let currentCandidate = smallerVal; currentCandidate >= 1; currentCandidate--) {
    if (largerVal % currentCandidate === 0 && smallerVal % currentCandidate === 0) {
      commonDivisorCollection.push(currentCandidate);
    }
  }

  const targetDivisor = commonDivisorCollection[rank - 1];
  console.log(targetDivisor);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
