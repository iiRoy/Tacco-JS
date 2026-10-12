const fileSystem = require("fs");

const NO_SUCH_ELEMENT_ERROR_MESSAGE = "NoSuchElementException:次に要素は無いよ";

function createInputReader(sourceDataLines) {
  let currentLinePosition = 0;
  const totalAvailableLines = sourceDataLines.length;

  const checkHasMoreLines = () => currentLinePosition < totalAvailableLines;

  const retrieveNextLine = () => {
    if (!checkHasMoreLines()) {
      throw NO_SUCH_ELEMENT_ERROR_MESSAGE;
    }
    const lineContent = sourceDataLines[currentLinePosition];
    currentLinePosition++;
    return lineContent;
  };

  return {
    checkHasMoreLines,
    retrieveNextLine
  };
}

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");
const globalInputHandler = createInputReader(rawInputContent);

const parseStringAsInt = (strValue) => parseInt(strValue, 10);
const convertStringToNumber = (strValue) => Number(strValue);

function processDataConversion(inputValue, conversionMode) {
  const conversionStrategies = {
    1: (val) => parseStringAsInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(convertStringToNumber),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(convertStringToNumber),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join("")
  };

  try {
    const handler = conversionStrategies[conversionMode];
    if (typeof handler === 'function') {
      return handler(inputValue);
    }
    return inputValue;
  } catch (error) {
    return inputValue;
  }
}

function getNextInputLine() { return globalInputHandler.retrieveNextLine(); }
function readNextInteger() { return processDataConversion(getNextInputLine(), 1); }
function readNextStringArray() { return processDataConversion(getNextInputLine(), 2); }
function readNextIntegerArray() { return processDataConversion(getNextInputLine(), 4); }
function readNextCharacterArray() { return processDataConversion(getNextInputLine(), 6); }
function hasMoreInput() { return globalInputHandler.checkHasMoreLines(); }

function outputResult(data) { console.log(data); }
function outputError(data) { console.error(data); }

function calculateArrayMinimum(numericArray) {
  if (!Array.isArray(numericArray) || numericArray.length === 0) {
    return Infinity;
  }
  return Math.min(...numericArray);
}

function executeMainProgram() {
  const initialParameters = readNextIntegerArray();
  const countAItems = initialParameters[0];
  const countBItems = initialParameters[1];
  const numberOfDiscountOffers = initialParameters[2];

  const priceListForA = readNextIntegerArray();
  const priceListForB = readNextIntegerArray();

  const minPriceFromA = calculateArrayMinimum(priceListForA);
  const minPriceFromB = calculateArrayMinimum(priceListForB);

  let overallMinimumCost = minPriceFromA + minPriceFromB;

  if (numberOfDiscountOffers > 0) {
    for (let offerIndex = 0; offerIndex < numberOfDiscountOffers; offerIndex++) {
      const currentOfferDetails = readNextIntegerArray();
      const itemASelectionIndex = currentOfferDetails[0] - 1;
      const itemBSelectionIndex = currentOfferDetails[1] - 1;
      const discountValue = currentOfferDetails[2];

      const costWithCurrentOffer = priceListForA[itemASelectionIndex] + priceListForB[itemBSelectionIndex] - discountValue;

      overallMinimumCost = Math.min(costWithCurrentOffer, overallMinimumCost);
    }
  }

  outputResult(overallMinimumCost);
}

executeMainProgram();
