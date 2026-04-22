const initialValue = process.argv[2];
const numericValue = Number(initialValue);
const originalReference = numericValue;

let currentRemainder = numericValue;
const factorCollection = [];

const repeatedlyExtract = (val, div, collector) => {
  if (val % div === 0) {
    collector.push(div);
    return repeatedlyExtract(val / div, div, collector);
  }
  return val;
};

const upperLimit = Math.floor(originalReference / 2);
const divisorRangeLength = upperLimit >= 2 ? (upperLimit - 2 + 1) : 0;

Array.from({ length: divisorRangeLength }, (_, idx) => idx + 2)
  .forEach(possibleDivisor => {
    currentRemainder = repeatedlyExtract(currentRemainder, possibleDivisor, factorCollection);
  });

console.log(`${originalReference}: ${factorCollection.join(' ')}`);