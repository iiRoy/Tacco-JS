var createDataExtractor = (() => {
    function createInstance(sourceText) {
        const lineIterator = sourceText.trim().split('\n')[Symbol.iterator]();
        let currentLineTokens = [];
        let currentLineTokenIndex = -1;

        const advanceLineInternal = () => {
            const { value, done } = lineIterator.next();
            if (done) {
                currentLineTokens = [];
                currentLineTokenIndex = -1;
                return false;
            }
            currentLineTokens = value.split(' ');
            currentLineTokenIndex = currentLineTokens.length - 1;
            return true;
        };

        const pullValue = (asString = false) => {
            if (currentLineTokenIndex < 0) {
                if (!advanceLineInternal()) {
                    throw new Error("No more input for single value extraction.");
                }
            }
            const extractedVal = currentLineTokens[currentLineTokenIndex--];
            return asString ? extractedVal : Number(extractedVal);
        };

        const pullLine = (asStrings = false) => {
            const { value, done } = lineIterator.next();
            if (done) {
                throw new Error("No more input for line extraction.");
            }
            currentLineTokens = [];
            currentLineTokenIndex = -1;
            const tokens = value.split(' ');
            return asStrings ? tokens : tokens.map(Number);
        };

        const pullMatrix = (count, asStrings = false) => {
            const matrixResult = [];
            for (let i = 0; i < count; i++) {
                matrixResult.push(pullLine(asStrings));
            }
            return matrixResult;
        };

        const pullRows = (count, asStrings = false) => {
            const rowResult = [];
            for (let i = 0; i < count; i++) {
                const { value, done } = lineIterator.next();
                if (done) {
                    throw new Error("Not enough input for row extraction.");
                }
                currentLineTokens = [];
                currentLineTokenIndex = -1;
                rowResult.push(asStrings ? value : Number(value));
            }
            return rowResult;
        };

        return {
            pullValue: pullValue,
            pullLine: pullLine,
            pullMatrix: pullMatrix,
            pullRows: pullRows
        };
    }
    return createInstance;
})();

var inputSource = createDataExtractor(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(processMainLogic());

function processMainLogic(){
  var elementCount = inputSource.pullValue();
  var valueArray = inputSource.pullLine();

  const { dominantValue, dominantIndex } = valueArray.reduce((accumulator, currentElement, currentIndex) => {
      if (Math.abs(accumulator.dominantValue) < Math.abs(currentElement)) {
          return { dominantValue: currentElement, dominantIndex: currentIndex + 1 };
      }
      return accumulator;
  }, { dominantValue: 0, dominantIndex: 0 });

  if (dominantValue === 0) return 0;

  const generateNegativeDominantOps = (arr, domIdx) => {
      const initialPairs = [`${domIdx} 1`, `${domIdx} 1`];
      const subsequentPairs = arr.slice(1).flatMap((val, currentRelativeIdx) => {
          const actualIdx = currentRelativeIdx + 1;
          return val < 0 ? [`1 ${actualIdx + 1}`, `1 1`] : [`1 1`, `1 ${actualIdx + 1}`];
      });
      return [...initialPairs, ...subsequentPairs];
  };

  const generatePositiveDominantOps = (arr, domIdx, arrLength) => {
      const initialPairs = [`${domIdx} ${arrLength}`, `${domIdx} ${arrLength}`];
      const subsequentPairs = arr.slice(0, arrLength - 1).flatMap((val, currentRelativeIdx) => {
          const actualIdx = currentRelativeIdx;
          return val < 0 ? [`${arrLength} ${arrLength}`, `${arrLength} ${actualIdx + 1}`] : [`${arrLength} ${actualIdx + 1}`, `${arrLength} ${arrLength}`];
      });
      return [...initialPairs, ...subsequentPairs];
  };

  const operationSequence = dominantValue < 0
      ? generateNegativeDominantOps(valueArray, dominantIndex)
      : generatePositiveDominantOps(valueArray, dominantIndex, elementCount);

  console.log(2 * elementCount);
  return operationSequence.join('\n');
}
