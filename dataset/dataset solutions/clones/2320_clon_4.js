const computeOutcome = (sourceText) => {
  const lineSegments = sourceText
    .split(/\r?\n/)
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);

  const [valA, valB] = lineSegments.slice(0, 2).map(Number);

  const finalResult = 6 - (valA + valB);
  return finalResult;
};

console.log(computeOutcome(require('fs').readFileSync('/dev/stdin', 'utf8')));
