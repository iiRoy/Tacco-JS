"use strict";
function I(sourceText, parserFunction) {
    const valueParser = parserFunction || Number;
    
    const lineGenerator = (function* () {
        const lines = sourceText.split("\n");
        let currentLineIndex = 0;
        while (currentLineIndex < lines.length) {
            yield lines[currentLineIndex++];
        }
    })();

    let tokenBuffer = [];
    let bufferPosition = 0;
    let currentFullLine = null;

    const advanceToNextLine = () => {
        const nextLineResult = lineGenerator.next();
        if (nextLineResult.done) {
            tokenBuffer = [];
            currentFullLine = null;
            return false;
        }
        currentFullLine = nextLineResult.value;
        tokenBuffer = currentFullLine.trim().split(" ");
        bufferPosition = 0;
        return true;
    };

    advanceToNextLine();

    this.a = function() {
        if (bufferPosition >= tokenBuffer.length) {
            if (!advanceToNextLine()) {
                return;
            }
        }
        const tokenValue = tokenBuffer[bufferPosition];
        bufferPosition++;
        return valueParser(tokenValue);
    };

    this.l = function() {
        if (currentFullLine === null) return;

        const lineToProcess = currentFullLine;
        advanceToNextLine();

        return lineToProcess.split(" ").map(valueParser);
    };
}
module.exports = I;

function processInputAndCalculate(inputData) {
  const dataReader = new I(inputData);
  
  const sequenceLength = dataReader.a();

  const numberSequence = Array.from({ length: sequenceLength }, () => dataReader.a());

  const finalMinimumCosts = numberSequence.reduce((previousCosts, currentElement) => {
      const costForEven = currentElement === 0 ? 2 : currentElement % 2;
      const costForOdd = (currentElement + 1) % 2;

      const currentIterationCosts = Array(5);

      currentIterationCosts[0] = previousCosts[0] + currentElement;
      currentIterationCosts[1] = Math.min(previousCosts[0], previousCosts[1]) + costForEven;
      currentIterationCosts[2] = Math.min(previousCosts[0], previousCosts[1], previousCosts[2]) + costForOdd;
      currentIterationCosts[3] = Math.min(previousCosts[2], previousCosts[3]) + costForEven;
      currentIterationCosts[4] = Math.min(...previousCosts) + currentElement;

      return currentIterationCosts;
  }, [0, 0, 0, 0, 0]);

  console.log(Math.min(...finalMinimumCosts));
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
