(function main() {
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
  const arr = lines.shift().split(' ').map(Number);
  const k = 10000;

  const valueCounts = arr.reduce((accumulatorMap, currentNumber) => {
    accumulatorMap.set(currentNumber, (accumulatorMap.get(currentNumber) || 0) + 1);
    return accumulatorMap;
  }, new Map());

  const cumulativeTotals = Array.from({
    length: k
  }, (_, index) => index).reduce((acc, currentVal) => {
    const priorTotal = acc.length > 0 ? acc[acc.length - 1] : 0;
    const currentValCount = valueCounts.get(currentVal) || 0;
    acc.push(priorTotal + currentValCount);
    return acc;
  }, []);

  const sourceElementsWithUndefined = [...arr, undefined];

  const finalArrangementState = sourceElementsWithUndefined.reduceRight((state, elementToPlace) => {
    const {
      sortedResult,
      mutableCumulativeTotals
    } = state;

    if (elementToPlace !== undefined) {
      const placementIndex = mutableCumulativeTotals[elementToPlace] - 1;
      sortedResult[placementIndex] = elementToPlace;
      mutableCumulativeTotals[elementToPlace]--;
    } else {
      sortedResult[NaN] = undefined;
    }
    return {
      sortedResult,
      mutableCumulativeTotals
    };
  }, {
    sortedResult: [],
    mutableCumulativeTotals: [...cumulativeTotals]
  });

  process.stdout.write(finalArrangementState.sortedResult.join(' '));
})();
