function processInput(rawData) {
  const lineOneSegments = rawData[0].split(" ");
  const numItems = parseInt(lineOneSegments[0], 10);
  const maxValue = parseInt(lineOneSegments[1], 10);

  const rawValuesString = rawData[1].split(" ");
  const halfValues = rawValuesString.map(valStr => parseFloat(valStr) / 2);

  const commonMultiple = calculateLCM(halfValues);

  const termOneResult = Math.trunc(maxValue / commonMultiple);
  const termTwoResult = Math.trunc(maxValue / (commonMultiple * 2));
  const finalOutput = termOneResult - termTwoResult;

  console.log(finalOutput);
}

function findGCD(valA, valB) {
    let currentA = Math.abs(valA);
    let currentB = Math.abs(valB);
    while (currentB) {
        let temporary = currentB;
        currentB = currentA % currentB;
        currentA = temporary;
    }
    return currentA;
}

function findLCMOfTwo(valA, valB) {
    if (valA === 0 || valB === 0) {
        return 0;
    }
    const product = Math.abs(valA * valB);
    const gcdResult = findGCD(valA, valB);
    return product / gcdResult;
}

function calculateLCM(numbersArray) {
    if (numbersArray.length === 0) {
        // This case would cause an error in the original code (accessing a[0])
        // and in reduce without an initial value. Preserving behavior.
        throw new TypeError("Reduce of empty array with no initial value");
    }

    const finalLCM = numbersArray.reduce((accumulator, currentValue) => {
        return findLCMOfTwo(accumulator, currentValue);
    });

    return finalLCM;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");
processInput(inputLines);
