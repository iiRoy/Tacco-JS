const fileSystemModule = require("fs");

class InputLineStream {
  #lineBuffer;
  #readCursor;
  #totalLines;

  constructor(rawText) {
    if (typeof rawText !== 'string' || rawText === null) {
      console.warn("InputLineStream received non-string or null rawText. Initializing with empty buffer.");
      this.#lineBuffer = [];
    } else {
      this.#lineBuffer = rawText.trim().split(/\r?\n/).filter(line => line.length > 0);
    }
    this.#readCursor = 0;
    this.#totalLines = this.#lineBuffer.length;
  }

  canReadNext() {
    return this.#readCursor < this.#totalLines;
  }

  advanceAndGet() {
    if (!this.canReadNext()) {
      throw new Error("EndOfStreamError: No further elements are available in the input stream.");
    }
    const extractedLine = this.#lineBuffer[this.#readCursor];
    this.#readCursor++;
    return extractedLine;
  }

  peekLine() {
    if (!this.canReadNext()) {
      return null;
    }
    return this.#lineBuffer[this.#readCursor];
  }

  resetStream() {
    this.#readCursor = 0;
  }
}

const systemInput = new InputLineStream(
  fileSystemModule.readFileSync("/dev/stdin", "utf8")
);

function getNextLine() {
  return systemInput.advanceAndGet();
}

function hasMoreLines() {
  return systemInput.canReadNext();
}

function dataConverter(sourceData, conversionCode) {
  if (sourceData === null || sourceData === undefined) {
    console.warn("dataConverter received null/undefined sourceData. Returning as is.");
    return sourceData;
  }

  const conversionMap = new Map([
    [1, (s) => parseInt(s, 10)],
    [2, (s) => s.split(" ")],
    [4, (s) => s.split(" ").map(val => Number(val))],
    [6, (s) => s.split("")],
    [7, (s) => s.split("").map(val => Number(val))],
    [8, (arr) => Array.isArray(arr) ? arr.join(" ") : String(arr)],
    [9, (arr) => Array.isArray(arr) ? arr.join("\n") : String(arr)],
    [0, (arr) => Array.isArray(arr) ? arr.join("") : String(arr)],
    [10, (s) => s.split(" ").map(val => parseFloat(val))]
  ]);

  const convertFunc = conversionMap.get(conversionCode);

  if (convertFunc) {
    try {
      return convertFunc(sourceData);
    } catch (error) {
      console.error(`Error during data conversion (code ${conversionCode}):`, error);
      return sourceData;
    }
  } else {
    console.warn(`Unknown conversion code: ${conversionCode}. Returning sourceData unmodified.`);
    return sourceData;
  }
}

function readInteger() {
  return dataConverter(getNextLine(), 1);
}

function readStringTokens() {
  return dataConverter(getNextLine(), 2);
}

function readIntegerTokens() {
  return dataConverter(getNextLine(), 4);
}

function readCharacterArray() {
  return dataConverter(getNextLine(), 6);
}

function printLine(outputValue) {
  console.log(outputValue);
}

function logErrorMsg(errorMessage) {
  console.error(errorMessage);
}

class DisjointSetUnion {
  #parentOrSize;

  constructor(numElements) {
    if (!Number.isInteger(numElements) || numElements < 0) {
      throw new Error("Invalid number of elements for DSU initialization. Must be a non-negative integer.");
    }
    this.#parentOrSize = new Array(numElements).fill(-1);
  }

  #isValidNode(nodeIndex) {
    return nodeIndex >= 0 && nodeIndex < this.#parentOrSize.length;
  }

  findSetRepresentative(nodeIdentifier) {
    if (!this.#isValidNode(nodeIdentifier)) {
      throw new Error(`Node identifier ${nodeIdentifier} is out of bounds.`);
    }

    if (this.#parentOrSize[nodeIdentifier] < 0) {
      return nodeIdentifier;
    }

    this.#parentOrSize[nodeIdentifier] = this.findSetRepresentative(this.#parentOrSize[nodeIdentifier]);
    return this.#parentOrSize[nodeIdentifier];
  }

  uniteSets(elementA, elementB) {
    const repA = this.findSetRepresentative(elementA);
    const repB = this.findSetRepresentative(elementB);

    if (repA === repB) {
      return false;
    }

    const sizeA = -this.#parentOrSize[repA];
    const sizeB = -this.#parentOrSize[repB];

    if (sizeA >= sizeB) {
      this.#parentOrSize[repA] -= sizeB;
      this.#parentOrSize[repB] = repA;
    } else {
      this.#parentOrSize[repB] -= sizeA;
      this.#parentOrSize[repA] = repB;
    }
    return true;
  }

  areElementsConnected(elementA, elementB) {
    return this.findSetRepresentative(elementA) === this.findSetRepresentative(elementB);
  }

  getSetSize(nodeIdentifier) {
    const root = this.findSetRepresentative(nodeIdentifier);
    return -this.#parentOrSize[root];
  }
}

function executeSolution() {
  try {
    console.time("SolutionExecution");

    const initialConfiguration = readIntegerTokens();
    const nodeCount = initialConfiguration[0];
    const queryCount = initialConfiguration[1];

    if (nodeCount <= 0 || queryCount < 0) {
      logErrorMsg(`Invalid initial parameters: Node count must be positive (${nodeCount}), Query count must be non-negative (${queryCount}).`);
      return;
    }
    if (nodeCount > 1000000 || queryCount > 500000) {
      console.warn(`Large input detected: N=${nodeCount}, Q=${queryCount}. Performance might be affected.`);
    }

    const groupManager = new DisjointSetUnion(nodeCount);

    const resultsBuffer = [];

    const QUERY_TYPE_UNITE = 0;
    const QUERY_TYPE_CHECK = 1;

    for (let qIdx = 0; qIdx < queryCount; qIdx++) {
      const currentOperation = readIntegerTokens();

      if (currentOperation.length < 3) {
        logErrorMsg(`Skipping malformed query at index ${qIdx}: ${currentOperation.join(' ')}`);
        continue;
      }

      const operationType = currentOperation[0];
      const elem1 = currentOperation[1];
      const elem2 = currentOperation[2];

      switch (operationType) {
        case QUERY_TYPE_UNITE:
          groupManager.uniteSets(elem1, elem2);
          break;
        case QUERY_TYPE_CHECK:
          if (groupManager.areElementsConnected(elem1, elem2)) {
            resultsBuffer.push("Affirmative");
          } else {
            resultsBuffer.push("Negative");
          }
          break;
        default:
          logErrorMsg(`Unknown query type encountered: ${operationType} at index ${qIdx}. Skipping.`);
          break;
      }
    }

    printLine(dataConverter(resultsBuffer, 9));

  } catch (error) {
    logErrorMsg(`An unhandled error occurred during program execution: ${error.message}`);
  } finally {
    console.timeEnd("SolutionExecution");
  }
}

executeSolution();