"use strict";

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const tokens = rawInput.split(/\s+/).filter(Boolean);
let tokenPointer = 0;

const retrieveNextNumber = () => Number(tokens[tokenPointer++]);

function processData() {
  const count = retrieveNextNumber();

  const valueCollection = Array(count + 1);
  valueCollection[0] = 0;
  for (let k = 1; k <= count; k++) {
    valueCollection[k] = retrieveNextNumber();
  }

  const finalValueCollection = Array.from({ length: count }, (_, idx) => count - idx)
    .reduceRight((currentValues, currentDivisor) => {
      const multipleIndices = Array.from(
        { length: Math.floor(count / currentDivisor) },
        (_, k) => (k + 1) * currentDivisor
      );

      const currentTotal = multipleIndices.reduce((accumulator, index) => accumulator + currentValues[index], 0);

      if (currentTotal < 0) {
        const nextValues = [...currentValues];
        multipleIndices.forEach(index => {
          nextValues[index] = 0;
        });
        return nextValues;
      } else {
        return currentValues;
      }
    }, valueCollection);

  return finalValueCollection.reduce((total, val) => total + val, 0);
}

const result = processData();
if (result !== undefined) {
  console.log(String(result));
}
