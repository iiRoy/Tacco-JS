function processStringData(sourceString) {
  const stringLength = sourceString.length;
  let pOccurrences = 0;

  const TARGET_CHAR_VALUE = "p";

  const countSpecificChar = (textToScan, charToLocate) => {
    let currentCount = 0;
    for (let charIndex = 0; charIndex < textToScan.length; charIndex++) {
      if (textToScan[charIndex] === charToLocate) {
        currentCount++;
      }
    }
    return currentCount;
  };

  pOccurrences = countSpecificChar(sourceString, TARGET_CHAR_VALUE);

  const halfLengthValue = stringLength / 2;
  const intermediateCalculation = halfLengthValue - pOccurrences;
  const finalComputedResult = Math.floor(intermediateCalculation);

  console.log(finalComputedResult);
}

processStringData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
