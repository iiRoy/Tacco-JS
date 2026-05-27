const createInputProcessor = (() => {
  return (rawText) => {
    let linesBuffer = rawText.trim().split('\n');
    let currentLineCursor = 0;
    let currentLineTokenCache = []; // Stores tokens for the current line if fetchNext is active

    // Helper to ensure currentLineTokenCache is populated for fetchNext
    const primeTokenCache = () => {
      if (currentLineTokenCache.length === 0 && currentLineCursor < linesBuffer.length) {
        currentLineTokenCache = linesBuffer[currentLineCursor].split(' ').reverse();
        // Do NOT increment currentLineCursor here. It's only incremented when currentLineTokenCache is exhausted by fetchNext.
      }
    };

    return {
      // Original `a` method clone: reads a single item, potentially from a partially consumed line.
      fetchNext: (asString) => {
        primeTokenCache();
        if (currentLineTokenCache.length === 0) return undefined; // No more input

        const value = currentLineTokenCache.pop();
        if (currentLineTokenCache.length === 0) {
          currentLineCursor++; // Line exhausted, move to next
        }
        return asString ? value : Number(value);
      },

      // Original `l` method clone: reads an entire line as a list.
      fetchLineAsList: (asStrings) => {
        // If `fetchNext` was used on the current line and didn't exhaust it,
        // `currentLineTokenCache` would be non-empty.
        // The original `l` uses `this._s[this._y++]`. If `_s[_y]` was modified by `a` to be an array, `split` would fail.
        // This implies `fetchNext` and `fetchLineAsList` are not meant to be interleaved on the same line.
        // Given the problem's `main` function usage (`o.a()` then `o.l()`), they operate on different lines.
        // So, `fetchLineAsList` can just consume the next line directly.
        // We must ensure `currentLineTokenCache` is cleared and `currentLineCursor` is correctly advanced.
        if (currentLineTokenCache.length > 0) {
          currentLineCursor++; // Skip the rest of the current line
          currentLineTokenCache = []; // Clear buffer
        }

        if (currentLineCursor >= linesBuffer.length) return undefined;

        const lineContent = linesBuffer[currentLineCursor++];
        return asStrings ? lineContent.split(' ') : lineContent.split(' ').map(Number);
      },

      // Original `m` method clone: reads multiple lines as a matrix.
      fetchMatrix: (count, asStrings) => {
        // These methods bypass currentLineTokenCache and fetchNext/fetchLineAsList logic.
        // They directly slice from the main linesBuffer.
        // If fetchNext was used and left tokens on the current line, this line will be skipped.
        if (currentLineTokenCache.length > 0) {
          currentLineCursor++; // Skip the rest of the current line
          currentLineTokenCache = []; // Clear buffer
        }

        const slicedLines = linesBuffer.slice(currentLineCursor, currentLineCursor + count);
        currentLineCursor += count; // Advance cursor by 'count' lines

        if (asStrings) {
          return slicedLines.map(line => line.split(' '));
        } else {
          return slicedLines.map(line => line.split(' ').map(Number));
        }
      },

      // Original `r` method clone: reads multiple raw lines.
      fetchRawLines: (count, asStrings) => {
        // Similar logic to fetchMatrix for skipping partially consumed lines and direct slicing.
        if (currentLineTokenCache.length > 0) {
          currentLineCursor++; // Skip the rest of the current line
          currentLineTokenCache = []; // Clear buffer
        }

        const slicedLines = linesBuffer.slice(currentLineCursor, currentLineCursor + count);
        currentLineCursor += count; // Advance cursor by 'count' lines

        return asStrings ? slicedLines : slicedLines.map(Number);
      }
    };
  };
})();

// Renamed 'o' to 'inputReader'
const inputReader = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// The original `xArray` function was unused in the provided `main` logic.
// As a Type IV transformation, unused code can be removed if it doesn't affect observable behavior.

// Renamed 'main' to 'calculateMaxPairSum'
function calculateMaxPairSum() {
  const totalElements = inputReader.fetchNext(); // Renamed n
  const elementValues = inputReader.fetchLineAsList(); // Renamed s
  let overallMaxSum = 0; // Renamed ans

  const halfCount = Math.floor(totalElements / 2); // Renamed m, using Math.floor

  // Outer loop: iterate `stepValue` from 1 up to `halfCount - 1`
  // Using Array.from and reduce for a functional style
  overallMaxSum = Array.from({ length: halfCount - 1 }, (_, index) => index + 1) // Generates [1, 2, ..., halfCount-1]
    .reduce((currentOverallMax, stepValue) => { // Renamed i
      let currentIterationSum = 0; // Renamed k
      const processedIndices = new Set(); // Renamed set

      let currentPosition = stepValue; // Renamed j
      while (currentPosition < totalElements) {
        const symmetricPosition = totalElements - currentPosition - 1;

        // Break condition: if either index is already visited or they are the same
        if (processedIndices.has(currentPosition) || processedIndices.has(symmetricPosition) || currentPosition === symmetricPosition) {
          break;
        }

        currentIterationSum += elementValues[currentPosition] + elementValues[symmetricPosition];
        processedIndices.add(currentPosition);
        processedIndices.add(symmetricPosition);

        currentPosition += stepValue; // Increment j
      }
      return Math.max(currentOverallMax, currentIterationSum); // Update overallMaxSum
    }, 0); // Initial value for reduce

  return overallMaxSum;
}

console.log(calculateMaxPairSum());
