const fileSystem = require("fs");

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8").trim();
const sourceLines = Object.freeze(rawInputContent.split("\n"));

const createInputIterator = (linesCollection) => {
  let currentPosition = 0;
  return Object.freeze({
    advanceAndRetrieve: () => {
      if (currentPosition >= linesCollection.length) {
        throw "NoSuchElementException:次に要素は無いよ";
      }
      return linesCollection[currentPosition++];
    },
    checkIfMoreAvailable: () => currentPosition < linesCollection.length,
  });
};

const inputSource = createInputIterator(sourceLines);

const dataTransformers = Object.freeze(new Map([
  [1, (val) => parseInt(val, 10)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (arr) => arr.join(" ")],
  [9, (arr) => arr.join("\n")],
  [0, (arr) => arr.join("")],
]));

const applyTransformation = (valueToTransform, transformationKey) => {
  try {
    const transformer = dataTransformers.get(transformationKey);
    return transformer ? transformer(valueToTransform) : valueToTransform;
  } catch (e) {
    return valueToTransform;
  }
};

const obtainNextLine = () => inputSource.advanceAndRetrieve();
const obtainNextInteger = () => applyTransformation(obtainNextLine(), 1);
const obtainNextStringArray = () => applyTransformation(obtainNextLine(), 2);
const obtainNextIntegerArray = () => applyTransformation(obtainNextLine(), 4);
const obtainNextCharacterArray = () => applyTransformation(obtainNextLine(), 6);
const hasMoreInput = () => inputSource.checkIfMoreAvailable();

const displayOutput = (content) => console.log(content);
const displayError = (content) => console.error(content);

const generateDivisors = (targetNumber) => {
  const foundDivisors = new Set();
  Array.from({ length: Math.floor(Math.sqrt(targetNumber)) }, (_, index) => index + 1)
    .forEach(candidateFactor => {
      if (targetNumber % candidateFactor === 0) {
        foundDivisors.add(candidateFactor);
        foundDivisors.add(targetNumber / candidateFactor);
      }
    });
  return Array.from(foundDivisors).sort((a, b) => a - b);
};

const performMainCalculation = () => {
  const initialNumber = obtainNextInteger();
  const allDivisors = generateDivisors(initialNumber);

  const sortedDescending = allDivisors.sort((a, b) => b - a);

  const halfCount = Math.floor(sortedDescending.length / 2);

  const finalAccumulation = sortedDescending
    .slice(0, halfCount)
    .reduce((currentSum, currentElement) => currentSum + (currentElement - 1), 0);

  displayOutput(finalAccumulation);
};

performMainCalculation();
