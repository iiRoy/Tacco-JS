console.log((inputDataString => {
  const lines = inputDataString.trim().split('\n');

  const firstLineParts = lines[0].split(' ').map(numericValue => numericValue | 0);
  const kValue = firstLineParts[0];

  const arrayValues = lines[1].split(' ').map(numericValue => numericValue | 0);

  const initialLowerBound = 2;
  const initialUpperBound = 3;

  if (arrayValues[kValue - 1] > initialLowerBound) {
    return '-1';
  }

  let currentLowerBound = initialLowerBound;
  let currentUpperBound = initialUpperBound;

  for (let loopIndex = kValue - 2; loopIndex >= 0; loopIndex--) {
    const currentArrayElement = arrayValues[loopIndex];

    currentLowerBound = Math.ceil(currentLowerBound / currentArrayElement) * currentArrayElement;
    currentUpperBound = (Math.floor(currentUpperBound / currentArrayElement) + 1) * currentArrayElement - 1;

    if (currentUpperBound < currentArrayElement || currentLowerBound > currentUpperBound) {
      return '-1';
    }
  }

  return `${currentLowerBound} ${currentUpperBound}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
