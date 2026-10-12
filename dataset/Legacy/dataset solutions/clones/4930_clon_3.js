function calculateMismatches(arrayOne, arrayTwo) {
  let currentMismatchCount = 0;
  const limit = Math.min(arrayOne.length, arrayTwo.length);

  for (let k = 0; k < limit; k++) {
    if (arrayOne[k] !== arrayTwo[k]) {
      currentMismatchCount++;
    }
  }
  return currentMismatchCount;
}

function processInputData(rawInputContent) {
  const REFERENCE_STRING_VALUE = 'CODEFESTIVAL2016';

  const inputLinesArray = rawInputContent.split('\n');

  const firstInputLine = inputLinesArray[0];

  const relevantInputSegment = firstInputLine.substring(0, REFERENCE_STRING_VALUE.length);

  const inputCharacterArray = relevantInputSegment.split('');

  const referenceCharacterArray = REFERENCE_STRING_VALUE.split('');

  const totalMismatches = calculateMismatches(inputCharacterArray, referenceCharacterArray);

  console.log(totalMismatches);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
