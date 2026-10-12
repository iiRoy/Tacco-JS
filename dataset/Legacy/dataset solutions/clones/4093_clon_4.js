console.log((function() {
  const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const [firstLine, secondLine] = inputContent.trim().split('\n');

  const elementCount = parseInt(firstLine, 10);
  const divisorSequence = secondLine.split(' ').map(Number);

  if (divisorSequence[elementCount - 1] > 2) {
    return '-1';
  }

  const initialBounds = [2, 3];

  const processedBounds = divisorSequence.slice(0, elementCount - 1).reduceRight((currentRange, currentDivisor) => {
    if (currentRange === null) {
      return null;
    }

    const currentMinVal = currentRange[0];
    const currentMaxVal = currentRange[1];

    const nextMinVal = Math.ceil(currentMinVal / currentDivisor) * currentDivisor;
    const nextMaxVal = Math.floor(currentMaxVal / currentDivisor) * currentDivisor + currentDivisor - 1;

    if (nextMaxVal < currentDivisor || nextMinVal > nextMaxVal) {
      return null;
    }

    return [nextMinVal, nextMaxVal];
  }, initialBounds);

  if (processedBounds === null) {
    return '-1';
  } else {
    return `${processedBounds[0]} ${processedBounds[1]}`;
  }
})());
