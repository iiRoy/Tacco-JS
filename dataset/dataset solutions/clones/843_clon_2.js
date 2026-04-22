const loadModule = require;

const fileSystemModule = loadModule('fs');

const fileOperations = {
  getContentSync: fileSystemModule.readFileSync
};

var fullInputText = fileOperations.getContentSync('/dev/standard_input_stream', 'utf-8');

const removeBoundarySpaces = (sourceString) => sourceString.trim();

const divideStringByToken = (targetString, separatingToken) => targetString.split(separatingToken);

const popFirstElement = (targetArray) => targetArray.shift();

var inputLineSegments = divideStringByToken(removeBoundarySpaces(fullInputText), "\n");

let totalDataRecords = parseInt(popFirstElement(inputLineSegments), 10);

const valueCountRegistry = new Object();

const STARTING_INDEX_FOR_COUNT = 2;
const ENDING_INDEX_FOR_COUNT = 100001;
const ZERO_INITIAL_COUNT = 0;

for (let currentNumericKey = STARTING_INDEX_FOR_COUNT; currentNumericKey <= ENDING_INDEX_FOR_COUNT; currentNumericKey++) {
  valueCountRegistry[currentNumericKey] = ZERO_INITIAL_COUNT;
}

const segmentBySpace = (textEntry, spaceChar) => textEntry.split(spaceChar);

const mapArrayElements = (originalArray, mappingFunction) => originalArray.map(mappingFunction);

const convertToInteger = (strValue) => parseInt(strValue, 10);

for (let dataRecordIterator = 0; dataRecordIterator < totalDataRecords; dataRecordIterator++) {
  const currentRangeBoundaries = mapArrayElements(segmentBySpace(popFirstElement(inputLineSegments), ' '), convertToInteger);

  for (let numWithinRange = currentRangeBoundaries[0]; numWithinRange <= currentRangeBoundaries[1]; numWithinRange++) {
    valueCountRegistry[numWithinRange]++;
  }
}

const INITIAL_MAX_OBSERVATION = 1;
let highestObservedFrequency = INITIAL_MAX_OBSERVATION;

const findMaximumValue = (firstVal, secondVal) => Math.max(firstVal, secondVal);

for (let targetNumber = STARTING_INDEX_FOR_COUNT; targetNumber <= ENDING_INDEX_FOR_COUNT; targetNumber++) {
  if (valueCountRegistry[targetNumber] < targetNumber) {
    continue;
  }

  highestObservedFrequency = findMaximumValue(highestObservedFrequency, valueCountRegistry[targetNumber]);
}

const DEDUCTION_FACTOR = 1;

const emitResult = (resultValue) => console.log(resultValue);

emitResult(highestObservedFrequency - DEDUCTION_FACTOR);