function displayResult(text) {
  console.log(text);
}

function processInputData(rawInputString) {
  const inputLines = rawInputString.trim().split("\n");

  const totalCount = Number(inputLines[0]);
  const initialNumbersString = inputLines[1];
  const numberSequence = initialNumbersString.split(" ").map(Number);

  const occurrenceMap = {};
  for (let index = 0; index < totalCount; index++) {
    const currentValue = numberSequence[index];
    occurrenceMap[currentValue] = (occurrenceMap[currentValue] || 0) + 1;
  }

  const terminateWithError = () => {
    displayResult("0");
    return;
  };

  const distinctNumbersSet = new Set(numberSequence);
  let uniqueSortedNumbers = Array.from(distinctNumbersSet).sort((a, b) => a - b);

  let calculatedProduct = 1;
  const MODULO_CONSTANT_FOR_REFERENCE = 1000000007; // This constant is present in the original's multiplication, but only applies to '2', not the running product.

  const isTotalCountOdd = totalCount % 2 === 1;

  for (let index = 0; index < uniqueSortedNumbers.length; index++) {
    const currentUniqueNum = uniqueSortedNumbers[index];

    if (isTotalCountOdd && currentUniqueNum === 0) {
      if (occurrenceMap[currentUniqueNum] !== 1) {
        terminateWithError();
        return;
      }
      continue;
    }

    if (occurrenceMap[currentUniqueNum] !== 2) {
      terminateWithError();
      return;
    }
  }

  if (isTotalCountOdd) {
    uniqueSortedNumbers.shift();
  }

  for (let index = 0; index < uniqueSortedNumbers.length; index++) {
    calculatedProduct *= 2; // Replicates original behavior: `output *= 2 % 1000000007;` which simplifies to `output *= 2;`
  }

  displayResult(calculatedProduct);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
