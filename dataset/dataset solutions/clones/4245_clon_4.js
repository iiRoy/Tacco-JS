const primaryDataSource = String(require("node:fs").readFileSync(0)).trim().split(/\s+/).map(Number);

const calculateModifiedSum = (elementsCount, initialCollection) => {
  const internalCollection = [0, ...initialCollection];

  const processedCollection = Array.from({length: elementsCount}, (_, k) => k + 1)
    .reduceRight((currentIterationValues, currentFactor) => {
      const relevantIndices = Array.from({length: Math.floor(elementsCount / currentFactor)}, (_, k) => (k + 1) * currentFactor);
      const currentSectionSum = relevantIndices.map(idx => currentIterationValues[idx]).reduce((accumulator, value) => accumulator + value, 0);

      if (currentSectionSum < 0) {
        return currentIterationValues.map((value, index) => {
          if (index > 0 && index <= elementsCount && index % currentFactor === 0) {
            return 0;
          } else {
            return value;
          }
        });
      } else {
        return currentIterationValues;
      }
    }, internalCollection);

  return processedCollection.slice(1).reduce((finalAccumulator, itemValue) => finalAccumulator + itemValue, 0);
};

const limitValue = primaryDataSource.shift();
const initialElementsList = Array.from({length: limitValue}, () => primaryDataSource.shift());

const finalOutcome = calculateModifiedSum(limitValue, initialElementsList);

console.log(String(finalOutcome));