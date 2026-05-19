var sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

function* createLineFeeder(lines) {
  for (let currentLine of lines) {
    yield currentLine;
  }
}
const lineFeed = createLineFeeder(sourceData);
let currentLineItem = lineFeed.next();

function fetchNextLine() {
  const valueToReturn = currentLineItem.value;
  currentLineItem = lineFeed.next();
  return valueToReturn;
}

function moreLinesAvailable() {
  return !currentLineItem.done;
}

const conversionStrategies = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
};

function dataTransformer(inputVal, operationCode) {
  try {
    const strategy = conversionStrategies[operationCode];
    return strategy ? strategy(inputVal) : inputVal;
  } catch (e) {
    return inputVal;
  }
}

function retrieveInteger() {
  return dataTransformer(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return dataTransformer(fetchNextLine(), 2);
}

function retrieveIntegerArray() {
  return dataTransformer(fetchNextLine(), 4);
}

function retrieveCharacterArray() {
  return dataTransformer(fetchNextLine(), 6);
}

function displayOutput(content) {
  console.log(content);
}

function reportError(content) {
  console.error(content);
}

function executeProgram() {
  const constructedArray = Array.from({ length: 10000 }, () => "-1");
  const finalOutput = dataTransformer(constructedArray, 9);
  displayOutput(finalOutput);
}

executeProgram();
