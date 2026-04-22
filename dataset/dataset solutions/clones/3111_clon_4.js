class InputSource {
  #lines;
  #pointer;
  constructor(rawContent) {
    this.#lines = rawContent.trim().split('\n');
    this.#pointer = 0;
  }
  retrieveNextLine() {
    if (this.#pointer >= this.#lines.length) {
      return null;
    }
    return this.#lines[this.#pointer++];
  }
}

const dataStream = new InputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

const valueParser = {
  asInteger: () => parseInt(dataStream.retrieveNextLine()),
  asStringSplit: (sep = ' ') => dataStream.retrieveNextLine().split(sep),
  asNumericSplit: (sep = ' ') => dataStream.retrieveNextLine().split(sep).map(Number),
  asCharSplit: () => dataStream.retrieveNextLine().split('')
};

const outputFormatter = {
  convertToInteger: (val) => parseInt(val),
  splitByWhitespace: (val) => val.split(' '),
  splitNumericByWhitespace: (val) => val.split(' ').map(Number),
  splitIntoCharacters: (val) => val.split(''),
  joinWithSpaces: (arr) => arr.join(' '),
  joinWithNewlines: (arr) => arr.join('\n'),
  joinWithoutSeparator: (arr) => arr.join(''),
  passThrough: (val) => val
};

const formatDispatch = new Map([
  [1, outputFormatter.convertToInteger],
  [2, outputFormatter.splitByWhitespace],
  [4, outputFormatter.splitNumericByWhitespace],
  [6, outputFormatter.splitIntoCharacters],
  [7, (val) => outputFormatter.splitIntoCharacters(val).map(Number)],
  [8, outputFormatter.joinWithSpaces],
  [9, outputFormatter.joinWithNewlines],
  [0, outputFormatter.joinWithoutSeparator]
]);

function applyFormatting(data, code) {
  try {
    const handler = formatDispatch.get(code);
    if (handler) {
      return handler(data);
    }
    return outputFormatter.passThrough(data);
  } catch (e) {
    return outputFormatter.passThrough(data);
  }
}

function emitOutput(content) {
  console.log(content);
}

function signalError(content) {
  console.error(content);
}

function solveProblemRecursively(currentSequence, currentIndex, finalSequence) {
  if (currentSequence.length === 0) {
    return applyFormatting(finalSequence, 9);
  }

  if (currentIndex >= currentSequence.length) {
    return -1;
  }

  const currentValue = currentSequence[currentIndex];
  const expectedValue = currentIndex + 1;

  if (currentValue === expectedValue) {
    return solveProblemRecursively(currentSequence, currentIndex + 1, finalSequence);
  } else {
    if (currentValue < expectedValue) {
      let elementToExtract;
      let updatedSequence;

      if (currentIndex === 0) {
        // Mimic original's behavior: list[-1] is undefined, splice(-1,1) removes last element
        elementToExtract = undefined;
        updatedSequence = currentSequence.slice(0, currentSequence.length - 1);
      } else {
        elementToExtract = currentSequence[currentIndex - 1];
        updatedSequence = currentSequence.slice(0, currentIndex - 1).concat(currentSequence.slice(currentIndex));
      }
      const newFinalSequence = [elementToExtract, ...finalSequence];
      return solveProblemRecursively(updatedSequence, 0, newFinalSequence);
    } else {
      return -1;
    }
  }
}

function commenceProcessing() {
  const quantity = valueParser.asInteger();
  const initialData = valueParser.asNumericSplit();

  const isValidInitial = initialData.every((val, idx) => val <= idx + 1);

  if (!isValidInitial) {
    emitOutput(-1);
    return;
  }

  const solution = solveProblemRecursively(initialData, 0, []);

  if (solution === -1) {
    emitOutput(-1);
  } else {
    emitOutput(solution);
  }
}

commenceProcessing();