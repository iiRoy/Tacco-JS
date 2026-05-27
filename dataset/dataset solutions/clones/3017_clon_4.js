class InputSource {
  constructor(inputString) {
    this.lines = inputString.trim().split('\n');
    this.linePointer = 0;
    this.tokenBuffer = [];
  }

  #primeTokenBuffer() {
    if (this.tokenBuffer.length === 0 && this.linePointer < this.lines.length) {
      this.tokenBuffer = this.lines[this.linePointer++].split(' ');
    }
  }

  extractSingle(asString) {
    this.#primeTokenBuffer();
    if (this.tokenBuffer.length === 0) {
      return undefined;
    }
    const value = this.tokenBuffer.shift();
    return asString ? value : Number(value);
  }

  extractLine(asString) {
    this.tokenBuffer = [];
    if (this.linePointer >= this.lines.length) {
      return undefined;
    }
    const currentLine = this.lines[this.linePointer++];
    const tokens = currentLine.split(' ');
    return asString ? tokens : tokens.map(Number);
  }

  extractMatrix(rowCount, asString) {
    this.tokenBuffer = [];
    const resultMatrix = [];
    for (let i = 0; i < rowCount; i++) {
      if (this.linePointer >= this.lines.length) {
        break;
      }
      const currentLine = this.lines[this.linePointer++];
      const tokens = currentLine.split(' ');
      resultMatrix.push(asString ? tokens : tokens.map(Number));
    }
    return resultMatrix;
  }

  extractRawLines(rowCount, asString) {
    this.tokenBuffer = [];
    const startIndex = this.linePointer;
    const endIndex = Math.min(this.linePointer + rowCount, this.lines.length);
    const rawLines = this.lines.slice(startIndex, endIndex);
    this.linePointer = endIndex;
    return asString ? rawLines : rawLines.map(Number);
  }
}

const createInputReader = (inputStr) => new InputSource(inputStr);

const generateMultiArray = (fillValue, ...dimensions) => {
  const createRecursive = (dims) => {
    if (dims.length === 0) {
      return fillValue;
    }
    const currentDimension = dims[0];
    return Array.from({ length: currentDimension }, () => createRecursive(dims.slice(1)));
  };
  return createRecursive(dimensions);
};

const calculateMinTransformations = () => {
  const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

  const sequenceLength = inputReader.extractSingle();
  const charSequence = inputReader.extractSingle(true);

  const totalDotsInSequence = charSequence.split('').filter(c => c === '.').length;

  let hashesCountLeft = 0;
  let dotsCountLeft = 0;

  const transformationCosts = Array.from({ length: sequenceLength + 1 }, (_, splitPointIndex) => {
    const currentTransformationCost = hashesCountLeft + (totalDotsInSequence - dotsCountLeft);

    if (splitPointIndex < sequenceLength) {
      if (charSequence[splitPointIndex] === '#') {
        hashesCountLeft++;
      } else {
        dotsCountLeft++;
      }
    }
    return currentTransformationCost;
  });

  return Math.min(...transformationCosts);
};

console.log(calculateMinTransformations());
