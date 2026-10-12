const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputData.split('\n');

const valuePairs = lineSegments.slice(1).map(segment => {
  const numericComponents = segment.split(' ');
  return {
    valA: Number(numericComponents[0]),
    valB: Number(numericComponents[1])
  };
});

let accumulatedOffset = 0;

for (let currentIdx = valuePairs.length - 1; currentIdx >= 0; currentIdx--) {
  const currentPair = valuePairs[currentIdx];
  const firstComponent = currentPair.valA;
  const secondComponent = currentPair.valB;

  const effectiveValue = firstComponent + accumulatedOffset;
  const moduloResult = effectiveValue % secondComponent;

  if (moduloResult > 0) {
    accumulatedOffset += (secondComponent - moduloResult);
  }
}

console.log(accumulatedOffset);
