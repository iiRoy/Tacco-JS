const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputSource;
const inputLinesBuffer = [];

inputReader.on('line', function(lineContent) { inputLinesBuffer.push(lineContent); });
inputReader.on('close', function() {
  inputSource = createInputIterator(inputLinesBuffer);
  console.error("\n");
  const startTime = Date.now();
  MainClone();
  const elapsedTime = Date.now() - startTime;
  logDebug("time : " + (elapsedTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopy(data) { return JSON.parse(JSON.stringify(data)); }
function acquireNumericInput() { return transformInput(fetchNextLine(), 1); }
function acquireStringArrayInput() { return transformInput(fetchNextLine(), 2); }
function acquireNumericArrayInput() { return transformInput(fetchNextLine(), 4); }
function acquireCharacterArrayInput() { return transformInput(fetchNextLine(), 6); }
function fetchNextLine() { return inputSource.getLine(); }
function hasMoreLines() { return inputSource.hasMore(); }

function createInputIterator(lines) {
  let currentIdx = 0;
  const totalLines = lines.length;
  return {
    getLine: function() {
      if (currentIdx < totalLines) {
        return lines[currentIdx++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    },
    hasMore: function() { return currentIdx < totalLines; }
  };
}

function emitResult(content) { console.log(content); }
function logDebug(message) { console.error("debug:" + require("util").inspect(message, false, null)); }

const inputTransformers = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
  default: (val) => val,
};

function transformInput(value, transformationType) {
  try {
    const transformer = inputTransformers[transformationType] || inputTransformers.default;
    return transformer(value);
  } catch (e) {
    return value;
  }
}

function MainClone() {
  const dataLength = acquireNumericInput();
  const valueSequence = acquireNumericArrayInput();
  const modulus = 1000000007;

  if (valueSequence[0] !== 0) {
    emitResult(0);
    return;
  }

  const initialTrackValues = [1, 0, 0]; // Represents R, B, G expected values

  const { finalProduct } = valueSequence.slice(1).reduce(
    (accumulator, currentElement) => {
      let { currentTrackValues, currentProduct } = accumulator;

      if (currentProduct === 0) {
        return accumulator; // If product is already zero, it remains zero.
      }

      // Identify all tracks that match the current element's value
      const matchingTrackIndices = currentTrackValues
        .map((val, idx) => (val === currentElement ? idx : -1))
        .filter((idx) => idx !== -1);

      const matchCount = matchingTrackIndices.length;

      if (matchCount === 0) {
        return {
          currentTrackValues: currentTrackValues, // Track states don't matter if product is 0
          currentProduct: 0,
        };
      }

      // Create a new array for the next state of track values
      let nextTrackValues = [...currentTrackValues];
      
      // Increment only the first matching track's value, preserving the R > B > G priority
      const firstMatchingTrackIndex = matchingTrackIndices[0];
      nextTrackValues[firstMatchingTrackIndex]++;

      // Update the product, applying modulo
      currentProduct = (currentProduct * matchCount) % modulus;

      return {
        currentTrackValues: nextTrackValues,
        currentProduct: currentProduct,
      };
    },
    { currentTrackValues: initialTrackValues, currentProduct: 3 } // Initial product is 3
  );

  emitResult(finalProduct);
}
