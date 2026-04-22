function extractTextualData(locatorReference) {
  const resourceHandle = require('node:fs').openSync(locatorReference, 'r');
  const storageUnit = Buffer.alloc(1024);
  const dataByteCount = require('node:fs').readSync(resourceHandle, storageUnit, 0, storageUnit.length, 0);
  require('node:fs').closeSync(resourceHandle);
  return storageUnit.toString('utf8', 0, dataByteCount).trim();
}

function transformStringToValue(textualRepresentation) {
  let numericalResult = 0;
  let isNegativeFlag = false;
  let startingIndex = 0;

  if (textualRepresentation.charCodeAt(0) === '-'.charCodeAt(0)) {
    isNegativeFlag = true;
    startingIndex = 1;
  }

  for (let currentPos = startingIndex; currentPos < textualRepresentation.length; currentPos++) {
    const charSymbolCode = textualRepresentation.charCodeAt(currentPos);
    const digitEquivalent = charSymbolCode - '0'.charCodeAt(0);
    numericalResult = numericalResult * 10 + digitEquivalent;
  }
  return isNegativeFlag ? -numericalResult : numericalResult;
}

function performSubtractionRecursively(minuendArgument, subtrahendArgument) {
  if (subtrahendArgument === 0) {
    return minuendArgument;
  } else if (subtrahendArgument > 0) {
    return performSubtractionRecursively(minuendArgument - 1, subtrahendArgument - 1);
  } else { // subtrahendArgument < 0
    return performSubtractionRecursively(minuendArgument + 1, subtrahendArgument + 1);
  }
}

const entryProcedure = () => {
  const dataLocation = '/dev/stdin';
  const rawContentString = extractTextualData(dataLocation);
  const processedNumericValue = transformStringToValue(rawContentString);

  const fixedMinuend = new Array(49).length - 1;

  const finalComputedOutcome = performSubtractionRecursively(fixedMinuend, processedNumericValue);

  process.stdout.write(finalComputedOutcome.toString() + '\n');
};

entryProcedure();