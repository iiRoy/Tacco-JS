function* inputLineGenerator() {
  const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
  const inputLines = rawInputContent.split("\n");
  for (const currentLine of inputLines) {
    yield currentLine;
  }
}

const lineIterator = inputLineGenerator();

function obtainNextLine() {
  const { value: nextValue, done: isDone } = lineIterator.next();
  if (isDone) {
    return "";
  }
  return nextValue;
}

const transformationHandlers = new Map([
  [1, (data) => Number.parseInt(data)],
  [2, (data) => data.split(" ")],
  [4, (data) => data.split(" ").map(Number)],
  [6, (data) => data.split("")],
  [7, (data) => data.split("").map(Number)],
  [8, (data) => data.join(" ")],
  [9, (data) => data.join("\n")],
  [0, (data) => data.join("")],
]);

function processInputFragment(fragmentData, transformationType) {
  try {
    const handlerFunction = transformationHandlers.get(transformationType);
    return handlerFunction ? handlerFunction(fragmentData) : fragmentData;
  } catch (error) {
    return fragmentData;
  }
}

function getIntegerFromLine() { return processInputFragment(obtainNextLine(), 1); }
function getStringArrayFromLine() { return processInputFragment(obtainNextLine(), 2); }
function getIntegerArrayFromLine() { return processInputFragment(obtainNextLine(), 4); }
function getCharacterArrayFromLine() { return processInputFragment(obtainNextLine(), 6); }

function printResult(content) { console.log(content); }
function printError(content) { console.error(content); }

function performCalculation() {
  const [requiredX, requiredY, valA, valB, valC] = getIntegerArrayFromLine();

  const primaryList = getIntegerArrayFromLine();
  const secondaryList = getIntegerArrayFromLine();
  const tertiaryList = getIntegerArrayFromLine();

  const sortedPrimary = primaryList.sort((p1, p2) => p2 - p1);
  const sortedSecondary = secondaryList.sort((s1, s2) => s2 - s1);

  const selectedPrimary = sortedPrimary.slice(0, requiredX);
  const selectedSecondary = sortedSecondary.slice(0, requiredY);

  const combinedElements = [...selectedPrimary, ...selectedSecondary, ...tertiaryList];

  const finalSortedElements = combinedElements.sort((e1, e2) => e2 - e1);

  const totalSum = finalSortedElements
    .slice(0, requiredX + requiredY)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  printResult(totalSum);
}

performCalculation();
