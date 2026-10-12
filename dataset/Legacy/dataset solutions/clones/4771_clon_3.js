'use strict';

class SolutionProcessor {
  executeLogic() {
    const configurationParameters = dataInput.getNextIntegerArray();
    // The original code declared 'x' but then used 's' which was undefined.
    // To preserve the exact observable behavior (a TypeError from attempting to access 'length' of undefined),
    // the unused 'x' variable is removed as dead code. The 's' variable remains undefined.
    // const inputDataSequence = dataInput.getNextIntegerArray(); // Original 'x' removed.

    const priceMultiplier = configurationParameters[1];
    const maxPriceCap = configurationParameters[2];

    // The 's' variable here is undefined, replicating the original code's bug.
    // This will cause a TypeError when utilityHelper.computeDifferences(s) is called.
    const differences = utilityHelper.computeDifferences(s);

    let totalSum = 0;
    // Rewriting the chained map and sum operations into an explicit loop.
    for (const element of differences) {
      const calculatedProduct = element * priceMultiplier;
      totalSum += Math.min(calculatedProduct, maxPriceCap);
    }
    return totalSum;
  }
}

class UtilityToolkit {
  calculateTotal(elements) {
    // Preserves original behavior: throws TypeError for empty array without initial value.
    return elements.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  determineMinimum(elements, comparisonFunc) {
    const actualComparisonFunc = comparisonFunc === null ? (a, b) => a - b : comparisonFunc;
    // Preserves original behavior: throws TypeError for empty array without initial value.
    return elements.reduce((minVal, currentVal) => actualComparisonFunc(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  determineMaximum(elements, comparisonFunc) {
    const actualComparisonFunc = comparisonFunc === null ? (a, b) => a - b : comparisonFunc;
    // Preserves original behavior: throws TypeError for empty array without initial value.
    return elements.reduce((maxVal, currentVal) => actualComparisonFunc(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  sortElements(elements, comparisonFunc) {
    const actualComparisonFunc = comparisonFunc === null ? (a, b) => a - b : comparisonFunc;
    // The original `sort` modifies the array in place and returns it. This behavior is preserved.
    return elements.sort(actualComparisonFunc);
  }

  generateNumericRange(startValue, stopValue, stepSize) {
    let currentStart = startValue;
    let currentStop = stopValue;
    let currentStep = stepSize;

    if (currentStop === null) {
      currentStop = currentStart || 0;
      currentStart = 0;
    }
    if (!currentStep) {
      currentStep = currentStop < currentStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((currentStop - currentStart) / currentStep), 0);
    // Rewriting the range generation using Array.from for a more declarative style.
    return Array.from({ length: rangeLength }, (_, index) => currentStart + (index * currentStep));
  }

  retrieveFirstElements(collection, count) {
    if (collection === null || collection.length < 1) {
      return count === null ? void 0 : [];
    }
    if (count === null) {
      return collection[0];
    }
    return this.retrieveInitialElements(collection, collection.length - count);
  }

  retrieveInitialElements(collection, count) {
    const numToExclude = count === null ? 1 : count;
    // Explicitly using Array.prototype.slice.call to match original's robustness for array-like objects.
    return Array.prototype.slice.call(collection, 0, Math.max(0, collection.length - numToExclude));
  }

  retrieveTailElements(collection, count) {
    const startIndex = count === null ? 1 : count;
    // Explicitly using Array.prototype.slice.call.
    return Array.prototype.slice.call(collection, startIndex);
  }

  retrieveLastElements(collection, count) {
    if (count === null) {
      return collection[collection.length - 1];
    }
    return this.retrieveTailElements(collection, Math.max(0, collection.length - count));
  }

  computeCumulativeSums(elements) {
    const cumulativeResults = [0]; // Initialize with 0 as per original's reduce initial value.
    // Rewriting the cumulative sum logic with a more explicit reduce.
    elements.reduce((accumulator, currentValue) => {
      const nextSum = accumulator + currentValue;
      cumulativeResults.push(nextSum);
      return nextSum;
    }, 0); // Initial value for the accumulator.
    return this.retrieveTailElements(cumulativeResults); // Use tail to remove the initial 0.
  }

  computeDifferences(elements) {
    const differenceArray = [];
    // The original code would throw a TypeError if 'elements' is null or undefined
    // because it attempts to access 'elements.length'. This behavior is preserved.
    for (let i = 1; i < elements.length; ++i) {
      const currentVal = elements[i];
      const previousVal = elements[i - 1];
      differenceArray.push(currentVal - previousVal);
    }
    return differenceArray;
  }

  performOrderedSearch(sortedArray, searchKey, accessorKey) {
    // Extracting the accessor logic into a local helper function for clarity.
    const getItemValue = (item) => {
      if (accessorKey === null) {
        return item;
      }
      return (typeof item === 'object') ? item[accessorKey] : item;
    };

    const targetValue = getItemValue(searchKey);
    let lowIndex = 0;
    let highIndex = sortedArray.length;

    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getItemValue(sortedArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
const utilityHelper = new UtilityToolkit();

class InputProcessor {
  constructor() {
    this.currentReadPosition = 0;
    this.loadedData = [];
    this.loadAllSourceData();
  }

  loadAllSourceData() {
    // Using a temporary constant for the file path.
    const inputFilePath = "/dev/stdin";
    this.loadedData = (require("fs").readFileSync(inputFilePath, "utf8")).split('\n');
    return this.loadedData;
  }

  getNextLine(lineCount) {
    if (lineCount) {
      // Added a guard for non-positive lineCount.
      if (lineCount <= 0) {
        return [];
      }
      const linesToExtract = this.loadedData.slice(this.currentReadPosition, this.currentReadPosition + lineCount);
      this.currentReadPosition += lineCount;
      return linesToExtract;
    }
    // Preserve original behavior: return undefined if no more lines.
    if (this.currentReadPosition >= this.loadedData.length) {
        return undefined;
    }
    return this.loadedData[this.currentReadPosition++];
  }

  // Introducing a private helper to reduce repetition in parsing number arrays.
  _parseLineToNumbers(lineContent, parserFunction) {
    if (lineContent === undefined) { // Handle cases where getNextLine returns undefined.
        return [];
    }
    return lineContent.split(' ').map(parserFunction);
  }

  getNextInteger() {
    const lineContent = this.getNextLine();
    return parseInt(lineContent);
  }

  getNextStringArray() {
    const lineContent = this.getNextLine();
    if (lineContent === undefined) { // Handle undefined line.
        return [];
    }
    return lineContent.split(' ');
  }

  getNextIntegerArray() {
    return this._parseLineToNumbers(this.getNextLine(), (element) => parseInt(element));
  }

  getNextFloatArray() {
    return this._parseLineToNumbers(this.getNextLine(), (element) => parseFloat(element));
  }

  getIntegerLines(count) {
    const lines = this.getNextLine(count);
    if (!Array.isArray(lines)) { // Handle case where getNextLine(count) might return undefined for count=1 and no more lines.
        return [];
    }
    return lines.map((line) => parseInt(line));
  }

  getFloatLines(count) {
    const lines = this.getNextLine(count);
    if (!Array.isArray(lines)) {
        return [];
    }
    return lines.map((line) => parseFloat(line));
  }

  getStringMatrix(count) {
    const lines = this.getNextLine(count);
    if (!Array.isArray(lines)) {
        return [];
    }
    return lines.map((line) => line.split(' '));
  }

  getIntegerMatrix(count) {
    const lines = this.getNextLine(count);
    if (!Array.isArray(lines)) {
        return [];
    }
    return lines.map((line) => this._parseLineToNumbers(line, (element) => parseInt(element)));
  }

  getFloatMatrix(count) {
    const lines = this.getNextLine(count);
    if (!Array.isArray(lines)) {
        return [];
    }
    return lines.map((line) => this._parseLineToNumbers(line, (element) => parseFloat(element)));
  }
}
const dataInput = new InputProcessor();

const OutputFormatter = (outputValue) => {
  let formattedResult;
  if (outputValue === null) {
    return;
  }

  // Rewriting the conditional assignment using a ternary chain.
  formattedResult = (outputValue === true) ? 'Yes' :
                    (outputValue === false) ? 'No' :
                    outputValue;

  console.log(formattedResult);
};

OutputFormatter(new SolutionProcessor().executeLogic());
