const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let currentLineIndex = 0;

const getLine = () => {
  if (currentLineIndex >= sourceLines.length) {
    throw new Error("NoSuchElementException:次に要素は無いよ");
  }
  return sourceLines[currentLineIndex++];
};

const hasMoreLines = () => currentLineIndex < sourceLines.length;

const inputTransformer = (dataItem, conversionType) => {
  const conversionMap = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join(""),
  };
  try {
    return conversionMap[conversionType] ? conversionMap[conversionType](dataItem) : dataItem;
  } catch (e) {
    return dataItem;
  }
};

const getInteger = () => inputTransformer(getLine(), 1);
const getStringArray = () => inputTransformer(getLine(), 2);
const getIntegerArray = () => inputTransformer(getLine(), 4);
const getCharacterArray = () => inputTransformer(getLine(), 6);

const displayOutput = (content) => console.log(content);
const displayError = (content) => console.error(content);

const combineArrays = (arrA, arrB) => arrA.map((val, idx) => [val, arrB[idx]]);

const executeProgram = () => {
  const elementCount = getInteger();
  const firstList = getIntegerArray();
  const secondList = getIntegerArray();

  const pairedElements = combineArrays(firstList, secondList);

  const finalAccumulation = pairedElements.reduce((currentTotal, [valA, valB]) => {
    let updatedTotal = currentTotal;
    if (valA < valB) {
      updatedTotal += Math.floor(valB - valA / 2);
    } else if (valA > valB) {
      updatedTotal -= (valA - valB);
    }
    return updatedTotal;
  }, 0);

  finalAccumulation >= 0 ? displayOutput("Yes") : displayOutput("No");
};

executeProgram();
