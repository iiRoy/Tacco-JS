function getInputData(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(outputValue){
  console.log(outputValue);
}

const convertStringArrayToNumberArray = (stringArray) => stringArray.map((strItem) => Number(strItem));

const inputConversionStrategies = {
  0: (data) => data,
  1: (data) => parseInt(data, 10),
  2: (data) => data.split(" "),
  3: (data) => data.split("\n"),
  4: (data) => convertStringArrayToNumberArray(data.split(" ")),
  5: (data) => convertStringArrayToNumberArray(data.split("\n")),
  6: (data) => data.split(""),
  7: (data) => convertStringArrayToNumberArray(data.split("")),
};

function processInputString(inputString, conversionType){
  const converter = inputConversionStrategies[conversionType];
  if (converter === undefined) {
    throw new Error(`Unsupported conversion type: ${conversionType}`);
  }
  return converter(inputString);
}

function executeLogic(rawInputContent) {
  const inputLines = processInputString(rawInputContent, 3);
  const arraySize = processInputString(inputLines[0], 1);
  const originalNumbers = processInputString(inputLines[1], 4);

  const matchFlags = originalNumbers.map((numValue, index) => (numValue === index + 1 ? 1 : 0));

  let finalResultCount = 0;

  if (arraySize > 1) {
    const flagForIndexZero = matchFlags[0];
    const flagForIndexOne = matchFlags[1];
    if (flagForIndexZero === 1 || flagForIndexOne === 1) {
      finalResultCount++;
    }
  }

  for (let currentIdx = 2; currentIdx < arraySize; currentIdx++) {
    const previousFlag = matchFlags[currentIdx - 1];
    const currentFlag = matchFlags[currentIdx];
    if (previousFlag === 0 && currentFlag === 1) {
      finalResultCount++;
    }
  }

  displayOutput(finalResultCount);
}

executeLogic(getInputData());
