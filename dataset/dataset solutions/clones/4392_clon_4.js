class InputProcessor {
  #lineData;
  #currentPosition;

  constructor(sourceContent) {
    this.#lineData = sourceContent.trim().split('\n');
    this.#currentPosition = 0;
  }

  obtainNextItem() {
    if (!this.hasMoreItems()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    return this.#lineData[this.#currentPosition++];
  }

  hasMoreItems() {
    return this.#currentPosition < this.#lineData.length;
  }
}

const conversionRegistry = {
  1: (val) => Number.parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join("")
};

class DataTransformer {
  process(value, transformationType) {
    try {
      const operation = conversionRegistry[transformationType];
      return operation ? operation(value) : value;
    } catch (e) {
      return value;
    }
  }
}

let globalInputHandler;
let globalDataConverter;

function initializeEnvironment(rawData) {
  globalInputHandler = new InputProcessor(rawData);
  globalDataConverter = new DataTransformer();
}

function retrieveNextEntry() { return globalInputHandler.obtainNextItem(); }
function retrieveNextInteger() { return globalDataConverter.process(retrieveNextEntry(), 1); }
function retrieveNextStringArray() { return globalDataConverter.process(retrieveNextEntry(), 2); }
function retrieveNextIntegerArray() { return globalDataConverter.process(retrieveNextEntry(), 4); }
function retrieveNextCharacterArray() { return globalDataConverter.process(retrieveNextEntry(), 6); }
function checkInputAvailability() { return globalInputHandler.hasMoreItems(); }

function displayOutput(content) { console.log(content); }
function displayError(content) { console.error(content); }

function calculateOptimalLiquidCost(quarterPrice, halfPrice, singlePrice, doublePrice, totalLiters) {
  const determineVolumeCost = (volume, q, h, s, d) => {
    if (volume === 1) {
      return Math.min(q * 4, h * 2, s);
    } else if (volume === 2) {
      return Math.min(q * 8, h * 4, s * 2, d);
    }
    return Infinity;
  };

  const costForTwoLiters = determineVolumeCost(2, quarterPrice, halfPrice, singlePrice, doublePrice);
  const costForOneLiter = determineVolumeCost(1, quarterPrice, halfPrice, singlePrice, doublePrice);

  const numTwoLiterUnits = Math.floor(totalLiters / 2);
  const remainingLiters = totalLiters % 2;

  let totalExpense = numTwoLiterUnits * costForTwoLiters;
  if (remainingLiters === 1) {
    totalExpense += costForOneLiter;
  }
  return totalExpense;
}

function executeMainLogic() {
  const initialParameters = retrieveNextIntegerArray();
  const qVal = initialParameters[0];
  const hVal = initialParameters[1];
  const sVal = initialParameters[2];
  const dVal = initialParameters[3];
  const nVal = retrieveNextInteger();

  const finalResult = calculateOptimalLiquidCost(qVal, hVal, sVal, dVal, nVal);
  displayOutput(finalResult);
}

initializeEnvironment(require("fs").readFileSync("/dev/stdin", "utf8"));
executeMainLogic();
