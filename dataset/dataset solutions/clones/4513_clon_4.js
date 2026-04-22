class InputLineManager {
  constructor() {
    this.collectedSegments = [];
    this.currentSegmentIndex = 0;
  }

  acceptInputSegments(segments) {
    this.collectedSegments = segments;
    this.currentSegmentIndex = 0;
  }

  hasMoreSegments() {
    return this.currentSegmentIndex < this.collectedSegments.length;
  }

  retrieveNextSegment() {
    if (this.hasMoreSegments()) {
      return this.collectedSegments[this.currentSegmentIndex++];
    }
    throw new Error("No more input data!");
  }

  interpretAsNumericArray() {
    const rawSegment = this.retrieveNextSegment();
    return rawSegment.split(' ').map(Number);
  }
}

const globalInputHandler = new InputLineManager();

const calculationCache = new Map();

function calculateFactorialRecursive(valueIdentifier, modulusIdentifier) {
  if (valueIdentifier < 0) return 0;
  if (valueIdentifier === 0 || valueIdentifier === 1) return 1;

  const cacheKey = `${valueIdentifier}-${modulusIdentifier}`;
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey);
  }

  const partialResult = (valueIdentifier * calculateFactorialRecursive(valueIdentifier - 1, modulusIdentifier)) % modulusIdentifier;
  calculationCache.set(cacheKey, partialResult);
  return partialResult;
}

function showFinalOutcome(resultValue) {
  console.log(resultValue);
}

function performCoreCalculation() {
  const numericData = globalInputHandler.interpretAsNumericArray();
  const primaryNumber = numericData[0];
  const secondaryNumber = numericData[1];
  const fixedDivisor = 1000000007;

  const absoluteDifference = Math.abs(primaryNumber - secondaryNumber);

  if (absoluteDifference >= 2) {
    showFinalOutcome(0);
  } else {
    const factorialPrimary = calculateFactorialRecursive(primaryNumber, fixedDivisor);
    const factorialSecondary = calculateFactorialRecursive(secondaryNumber, fixedDivisor);

    let intermediateProduct = (factorialPrimary * factorialSecondary) % fixedDivisor;

    if (absoluteDifference === 0) {
      intermediateProduct = (intermediateProduct * 2) % fixedDivisor;
    }
    showFinalOutcome(intermediateProduct);
  }
}

const customStreamReader = (function() {
  let dataBuffer = '';
  const lineCallbacks = [];
  let closeCallback = null;

  process.stdin.on('data', (chunk) => {
    dataBuffer += chunk.toString();
    let newlineIndex;
    while ((newlineIndex = dataBuffer.indexOf('\n')) !== -1) {
      const line = dataBuffer.substring(0, newlineIndex).trim();
      dataBuffer = dataBuffer.substring(newlineIndex + 1);
      if (lineCallbacks.length > 0) {
        lineCallbacks.forEach(cb => cb(line));
      }
    }
  });

  process.stdin.on('end', () => {
    if (dataBuffer.length > 0) {
      const line = dataBuffer.trim();
      if (lineCallbacks.length > 0) {
        lineCallbacks.forEach(cb => cb(line));
      }
    }
    if (closeCallback) {
      closeCallback();
    }
  });

  return {
    onLine: (cb) => lineCallbacks.push(cb),
    onClose: (cb) => { closeCallback = cb; }
  };
})();

const receivedLines = [];

customStreamReader.onLine(line => {
  receivedLines.push(line);
});

customStreamReader.onClose(() => {
  globalInputHandler.acceptInputSegments(receivedLines);
  console.error('\n↑入力 ↓出力');
  performCoreCalculation();
});