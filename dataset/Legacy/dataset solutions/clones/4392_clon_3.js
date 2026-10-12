const rawDataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

class DataLineReader {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  fetchNextLine() {
    if (!this.canFetchMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const retrievedLine = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return retrievedLine;
  }

  canFetchMore() {
    return (this.currentLineIndex < this.totalLines);
  }
}

const inputReader = new DataLineReader(rawDataLines);

function retrieveNextLine() { return inputReader.fetchNextLine(); }
function retrieveNextInteger() { return dataConverter(retrieveNextLine(), 1); }
function retrieveNextStringArray() { return dataConverter(retrieveNextLine(), 2); }
function retrieveNextIntegerArray() { return dataConverter(retrieveNextLine(), 4); }
function retrieveNextCharacterArray() { return dataConverter(retrieveNextLine(), 6); }
function hasMoreLines() { return inputReader.canFetchMore(); }
function printResult(content) { console.log(content); }
function printError(content) { console.error(content); }

const conversionStrategies = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map((a) => Number(a))],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map((a) => Number(a))],
  [8, (val) => val.join(" ")],
  [9, (val) => val.join("\n")],
  [0, (val) => val.join("")],
]);

function dataConverter(inputVal, conversionType) {
  try {
    const strategy = conversionStrategies.get(conversionType);
    if (strategy) {
      return strategy(inputVal);
    }
    return inputVal;
  } catch (e) {
    return inputVal;
  }
}

calculateCost();

function calculateCost() {
  const firstLineValues = retrieveNextIntegerArray();
  const [quarterLiterCost, halfLiterCost, singleLiterCost, doubleLiterCost] = firstLineValues;
  const totalLiters = retrieveNextInteger();

  const costPerTwoLitersQ = quarterLiterCost * 8;
  const costPerTwoLitersH = halfLiterCost * 4;
  const costPerTwoLitersS = singleLiterCost * 2;

  let finalCalculatedCost = 0;

  const twoLiterCostOptions = [costPerTwoLitersQ, costPerTwoLitersH, costPerTwoLitersS, doubleLiterCost];
  const minCostPerTwoLiters = Math.min.apply(null, twoLiterCostOptions);

  const numberOfTwoLiterUnits = Math.floor(totalLiters / 2);
  finalCalculatedCost = minCostPerTwoLiters * numberOfTwoLiterUnits;

  if (totalLiters % 2 === 1) {
    const costForOneLiterQ = quarterLiterCost * 4;
    const costForOneLiterH = halfLiterCost * 2;
    
    finalCalculatedCost += Math.min(costForOneLiterQ, costForOneLiterH, singleLiterCost);
  }

  printResult(finalCalculatedCost);
}
