function createInputParser(rawText) {
    let lineBuffer = rawText.trim().split('\n');
    let lineCursor = 0;
    let currentLineTokens = [];
    let tokenCursor = 0;

    function ensureLineTokens() {
        if (tokenCursor >= currentLineTokens.length) {
            if (lineCursor < lineBuffer.length) {
                currentLineTokens = lineBuffer[lineCursor].split(' ');
                tokenCursor = 0;
            } else {
                currentLineTokens = [];
            }
        }
    }

    return {
        grabToken: function(asString) {
            ensureLineTokens();
            if (tokenCursor < currentLineTokens.length) {
                let tokenValue = currentLineTokens[tokenCursor];
                tokenCursor++;
                if (tokenCursor === currentLineTokens.length) {
                    lineCursor++;
                    tokenCursor = 0;
                    currentLineTokens = [];
                }
                return asString ? tokenValue : +tokenValue;
            }
            return undefined;
        },
        grabLine: function(asString) {
            if (lineCursor >= lineBuffer.length) return undefined;
            currentLineTokens = [];
            tokenCursor = 0;
            let lineContent = lineBuffer[lineCursor];
            lineCursor++;
            return asString ? lineContent.split(' ') : lineContent.split(' ').map(Number);
        },
        grabBlock: function(count, asString) {
            let collectedBlocks = [];
            for (let i = 0; i < count; i++) {
                collectedBlocks.push(this.grabLine(asString));
            }
            return collectedBlocks;
        },
        grabRawLines: function(count, asString) {
            let collectedLines = [];
            for (let i = 0; i < count; i++) {
                if (lineCursor >= lineBuffer.length) break;
                let lineContent = lineBuffer[lineCursor];
                lineCursor++;
                currentLineTokens = [];
                tokenCursor = 0;
                collectedLines.push(asString ? lineContent : +lineContent);
            }
            return collectedLines;
        }
    };
}

const inputSource = createInputParser(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(solveProblem());

function solveProblem(){
  const affirmativeResponse = "Yes";
  const negativeResponse = "No";

  const totalElementsCount = inputSource.grabToken();
  const numberSequence = inputSource.grabLine();

  const remainderClassifierMap = new Map([
      [0, 'multipleOfFour'],
      [1, 'odd'],
      [2, 'evenNotFour'],
      [3, 'odd']
  ]);

  const categoryCounts = numberSequence.reduce((accumulator, currentNumber) => {
      const remainderResult = currentNumber % 4;
      const categoryKey = remainderClassifierMap.get(remainderResult);
      accumulator[categoryKey]++;
      return accumulator;
  }, { odd: 0, evenNotFour: 0, multipleOfFour: 0 });

  const { odd, evenNotFour, multipleOfFour } = categoryCounts;

  if (totalElementsCount === evenNotFour) {
      return affirmativeResponse;
  }

  const adjustedOddCount = odd + 1;

  if (multipleOfFour > 0 && adjustedOddCount <= multipleOfFour + 1) {
      return affirmativeResponse;
  }

  return negativeResponse;
}
