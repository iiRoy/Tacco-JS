const fileUtility = require("fs");

const inputContent = fileUtility.readFileSync("/dev/stdin", "utf8");

const frequencyRegistry = new Map();
let peakOccurrence = 0;

inputContent.split('\n')
  .map(line => Number(line))
  .filter(val => val > 0 && Number.isInteger(val))
  .forEach(validNumber => {
    const existingCount = frequencyRegistry.get(validNumber) || 0;
    const updatedCount = existingCount + 1;
    frequencyRegistry.set(validNumber, updatedCount);
    if (updatedCount > peakOccurrence) {
      peakOccurrence = updatedCount;
    }
  });

const frequentValues = Array.from(frequencyRegistry.entries())
  .filter(([valueKey, countValue]) => countValue === peakOccurrence)
  .map(([valueKey, countValue]) => valueKey)
  .sort((first, second) => first - second);

frequentValues.forEach(resultItem => console.log(resultItem));