const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let dataPointer = 0;

const fetchNextDataLine = () => {
  if (dataPointer >= sourceData.length) {
    throw new Error("NoMoreInputException: 次に要素は無いよ");
  }
  return sourceData[dataPointer++];
};

const inputTransformationMap = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  // Cases 8, 9, 0 from original `myconv` are for joining arrays, not parsing strings,
  // and are not used by the main logic for input processing.
  // Default behavior matches original `myconv` for unhandled types.
  default: (val) => val,
};

const applyInputConversion = (lineContent, conversionType) => {
  const converter = inputTransformationMap[conversionType] || inputTransformationMap.default;
  return converter(lineContent);
};

const retrieveLine = () => fetchNextDataLine();
const retrieveInteger = () => applyInputConversion(retrieveLine(), 1);
const retrieveStringArray = () => applyInputConversion(retrieveLine(), 2);
const retrieveIntegerArray = () => applyInputConversion(retrieveLine(), 4);
const retrieveCharacterArray = () => applyInputConversion(retrieveLine(), 6);

const emitOutput = (value) => console.log(value);
const emitError = (value) => console.error(value);

const performCoreCalculation = () => {
  const initialConfiguration = retrieveIntegerArray();
  const applianceACount = initialConfiguration[0];
  const applianceBCount = initialConfiguration[1];
  const discountOfferQuantity = initialConfiguration[2];

  const applianceAPriceList = retrieveIntegerArray();
  const applianceBPriceList = retrieveIntegerArray();

  // Determine the minimum individual prices using reduce for a different approach
  const minimumPriceA = applianceAPriceList.reduce((currentMin, price) => Math.min(currentMin, price), Infinity);
  const minimumPriceB = applianceBPriceList.reduce((currentMin, price) => Math.min(currentMin, price), Infinity);

  let overallLowestPrice = minimumPriceA + minimumPriceB;

  // Process discount offers using a functional iteration pattern
  overallLowestPrice = Array.from({ length: discountOfferQuantity }).reduce((accumulatedMinPrice, _, offerIndex) => {
    const currentOfferDetails = retrieveIntegerArray();
    const itemA_selectionIndex = currentOfferDetails[0] - 1;
    const itemB_selectionIndex = currentOfferDetails[1] - 1;
    const discountValue = currentOfferDetails[2];

    const priceWithCurrentOffer = applianceAPriceList[itemA_selectionIndex] + applianceBPriceList[itemB_selectionIndex] - discountValue;
    return Math.min(accumulatedMinPrice, priceWithCurrentOffer);
  }, overallLowestPrice); // Start reduction with the base lowest price

  emitOutput(overallLowestPrice);
};

performCoreCalculation();
