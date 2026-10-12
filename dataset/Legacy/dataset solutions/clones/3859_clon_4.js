console.log((inputData => {
  function checkPrime(val) {
    if (val < 2) return false;
    if (val === 2 || val === 3) return true;
    if (val % 2 === 0 || val % 3 === 0) return false;
    let k = 5;
    while (k * k <= val) {
      if (val % k === 0 || val % (k + 2) === 0) return false;
      k += 6;
    }
    return true;
  }

  const desiredCount = inputData | 0;
  const collectedNumbers = [];
  let currentCandidate = 2;
  const searchUpperLimit = 55555;

  while (collectedNumbers.length < desiredCount && currentCandidate < searchUpperLimit) {
    if (checkPrime(currentCandidate) && currentCandidate % 5 === 1) {
      collectedNumbers.push(currentCandidate);
    }
    currentCandidate++;
  }

  return collectedNumbers.join` `;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
