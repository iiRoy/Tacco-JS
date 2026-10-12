const calculateHammingDistance = rawText => {
  const [firstSequence, secondSequence] = rawText.trim().split("\n").map(lineContent => Array.from(lineContent));
  
  const mismatchCount = firstSequence.reduce((currentMismatchTotal, charA, idx) => {
    return currentMismatchTotal + (charA !== secondSequence[idx] ? 1 : 0);
  }, 0);
  
  return mismatchCount;
};

console.log(calculateHammingDistance(require('fs').readFileSync('/dev/stdin', 'utf8')));
