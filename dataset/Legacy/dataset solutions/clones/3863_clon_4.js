class DataParser {
  #lineBuffer;
  #currentLineWords = [];
  #lineIndex = 0;

  constructor(rawInput) {
    this.#lineBuffer = rawInput.trim().split("\n");
  }

  #prepareCurrentLineWords() {
    if (this.#lineIndex < this.#lineBuffer.length) {
      this.#currentLineWords = this.#lineBuffer[this.#lineIndex++].split(" ").reverse();
    } else {
      this.#currentLineWords = [];
    }
  }

  fetchRightmostValue(asStringOutput = false) {
    if (this.#currentLineWords.length === 0) {
      this.#prepareCurrentLineWords();
    }
    const extractedItem = this.#currentLineWords.pop();
    return asStringOutput ? extractedItem : Number(extractedItem);
  }

  retrieveLineValues(asStringArray = false) {
    const lineContent = this.#lineBuffer[this.#lineIndex++];
    const parts = lineContent.split(" ");
    return asStringArray ? parts : parts.map(Number);
  }

  getNumericGrid(rowCount) {
    const gridData = [];
    for (let i = 0; i < rowCount; i++) {
      gridData.push(this.retrieveLineValues());
    }
    return gridData;
  }

  getNumericBlock(rowCount) {
    const blockData = [];
    for (let i = 0; i < rowCount; i++) {
      blockData.push(Number(this.#lineBuffer[this.#lineIndex++]));
    }
    return blockData;
  }
}

const InputHandler = (inputString) => new DataParser(inputString);

console.log(calculateZeroSumSubarrays());

function calculateZeroSumSubarrays() {
  const dataReader = InputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

  const sequenceLength = dataReader.fetchRightmostValue();
  const numericSequence = dataReader.retrieveLineValues();

  const { prefixCounts } = numericSequence.reduce((accumulator, currentNumber) => {
    accumulator.currentRunningSum += currentNumber;
    accumulator.prefixCounts.set(
      accumulator.currentRunningSum,
      (accumulator.prefixCounts.get(accumulator.currentRunningSum) || 0) + 1
    );
    return accumulator;
  }, { currentRunningSum: 0, prefixCounts: new Map([[0, 1]]) });

  const totalCombinations = Array.from(prefixCounts.values()).reduce((sum, count) => {
    return sum + (count * (count - 1) / 2);
  }, 0);

  return totalCombinations;
}
