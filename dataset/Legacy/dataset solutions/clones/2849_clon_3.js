const createInputParser = (() => {
  function createParserInstance(sourceString) {
    return new InputDataParser(sourceString);
  }

  class InputDataParser {
    constructor(rawSource) {
      this.inputLines = rawSource.trim().split("\n");
      this.currentLineIdx = 0;
    }

    readNextValue(asString) {
      let lineData = this.inputLines[this.currentLineIdx];
      
      const convertToType = (val, isStringRequested) => isStringRequested ? val : +val;

      if (typeof lineData === "string") {
        this.inputLines[this.currentLineIdx] = lineData.split(" ").reverse();
      }
      
      const extractedValue = this.inputLines[this.currentLineIdx].pop();

      if (this.inputLines[this.currentLineIdx].length === 0) {
        this.currentLineIdx++;
      }
      
      return convertToType(extractedValue, asString);
    }

    readLineValues(asString) {
      const lineContent = this.inputLines[this.currentLineIdx++];
      const values = lineContent.split(" ");
      return asString ? values : values.map(val => +val);
    }

    readMatrixValues(numRows, asString) {
      const startIdx = this.currentLineIdx;
      this.currentLineIdx += numRows;
      const matrixRows = this.inputLines.slice(startIdx, this.currentLineIdx);
      
      return asString ? 
        matrixRows.map(row => row.split(" ")) : 
        matrixRows.map(row => row.split(" ").map(val => +val));
    }

    readNumericLines(numLines, asString) {
      const startIdx = this.currentLineIdx;
      this.currentLineIdx += numLines;
      const lines = this.inputLines.slice(startIdx, this.currentLineIdx);
      return asString ? lines : lines.map(line => +line);
    }
  }

  return createParserInstance;
})();

const dataParser = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(defaultValue) {
  const args = arguments;
  let argCount = args.length;
  let arrayCreationExpression = `Array(args[${--argCount}]).fill(0).map(x => { return ${defaultValue}; })`;
  while (--argCount) {
    arrayCreationExpression = `Array(args[${argCount}]).fill(0).map(x => ${arrayCreationExpression})`;
  }
  return eval(arrayCreationExpression);
}

console.log(runOptimizationProcess());

function runOptimizationProcess() {
  const initialResource = dataParser.readNextValue();
  const inputArrayA = dataParser.readLineValues();
  const inputArrayB = dataParser.readLineValues();

  const extractConditionalItems = (sourceArr1, sourceArr2, conditionPredicate) => {
    const costsCollection = [];
    const gainsCollection = [];
    for (let itemIndex = 0; itemIndex < 3; itemIndex++) {
      if (conditionPredicate(sourceArr1[itemIndex], sourceArr2[itemIndex])) {
        costsCollection.push(sourceArr1[itemIndex]);
        gainsCollection.push(sourceArr2[itemIndex]);
      }
    }
    return { costs: costsCollection, gains: gainsCollection };
  };

  let { costs: filteredCostsFirst, gains: filteredGainsFirst } = extractConditionalItems(
    inputArrayA,
    inputArrayB,
    (valA, valB) => valA < valB
  );
  
  const firstOptimizationResult = maximizeResourceValue(initialResource, filteredCostsFirst, filteredGainsFirst);

  let { costs: filteredCostsSecond, gains: filteredGainsSecond } = extractConditionalItems(
    inputArrayB,
    inputArrayA,
    (valB, valA) => valB < valA
  );
  
  return maximizeResourceValue(firstOptimizationResult, filteredCostsSecond, filteredGainsSecond);
}

function maximizeResourceValue(currentResource, itemCosts, itemGains) {
  const numItems = itemCosts.length;

  if (numItems === 0) {
    return currentResource;
  }
  if (numItems === 1) {
    const singleItemCost = itemCosts[0];
    const singleItemGain = itemGains[0];
    const maxPurchases = (currentResource / singleItemCost) | 0;
    currentResource -= maxPurchases * singleItemCost;
    currentResource += maxPurchases * singleItemGain;
    return currentResource;
  }

  const memoizationTable = new Array(currentResource + 1).fill(undefined);
  memoizationTable[0] = currentResource;

  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    const currentItemCost = itemCosts[itemIndex];
    const currentItemGain = itemGains[itemIndex];

    for (let currentBudget = currentItemCost; currentBudget <= currentResource; currentBudget++) {
      if (memoizationTable[currentBudget - currentItemCost] !== undefined) {
        const potentialNewValue = memoizationTable[currentBudget - currentItemCost] + currentItemGain - currentItemCost;
        
        if (memoizationTable[currentBudget] === undefined || potentialNewValue > memoizationTable[currentBudget]) {
          memoizationTable[currentBudget] = potentialNewValue;
        }
      }
    }
  }

  let finalMaxResource = currentResource;

  const DP_SEARCH_OFFSET = 5000;
  const searchRangeStart = Math.max(0, currentResource - DP_SEARCH_OFFSET);

  for (let budgetIndex = searchRangeStart; budgetIndex <= currentResource; budgetIndex++) {
    if (memoizationTable[budgetIndex] !== undefined) {
      if (finalMaxResource < memoizationTable[budgetIndex]) {
        finalMaxResource = memoizationTable[budgetIndex];
      }
    }
  }
  
  return finalMaxResource;
}
