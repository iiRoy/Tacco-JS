function processData(rawInputString) {
  const splitInputLines = rawInputString.split('\n');
  const numericValues = splitInputLines[1].split(' ').map(Number);

  let numbersWithDivisors = 0;
  const totalElements = numericValues.length;

  for (let primaryIdx = 0; primaryIdx < totalElements; primaryIdx++) {
    const currentVal = numericValues[primaryIdx];
    let foundDivisor = false;

    for (let secondaryIdx = 0; secondaryIdx < totalElements; secondaryIdx++) {
      const otherVal = numericValues[secondaryIdx];
      const isDifferentElement = primaryIdx !== secondaryIdx;
      const isDivisible = currentVal % otherVal === 0;

      if (isDifferentElement && isDivisible) {
        foundDivisor = true;
        break;
      }
    }

    if (foundDivisor) {
      numbersWithDivisors++;
    }
  }

  const finalResult = totalElements - numbersWithDivisors;
  console.log(finalResult);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processData(fileContent);
