const acquireData = (function() {
    function createInputSource(rawTextContent) {
        const sourceLines = rawTextContent.trim().split('\n');
        let currentLinePointer = 0;
        let currentLineTokenBuffer = [];

        return {
            extractNextToken: (returnAsText) => {
                if (currentLinePointer >= sourceLines.length) {
                    return undefined;
                }

                if (currentLineTokenBuffer.length === 0) {
                    const lineContent = sourceLines[currentLinePointer];
                    currentLineTokenBuffer = lineContent.split(' ').reverse();
                }

                const tokenValue = currentLineTokenBuffer.pop();
                if (currentLineTokenBuffer.length === 0) {
                    currentLinePointer++;
                }
                return returnAsText ? tokenValue : Number(tokenValue);
            },
            readFullLine: (returnAsText) => {
                if (currentLinePointer >= sourceLines.length) {
                    return undefined;
                }
                currentLineTokenBuffer = [];
                const lineContent = sourceLines[currentLinePointer++];
                const tokens = lineContent.split(' ');
                return returnAsText ? tokens : tokens.map(Number);
            },
            readMatrix: (rowCount, returnAsText) => {
                const matrixResult = [];
                for (let i = 0; i < rowCount; i++) {
                    matrixResult.push(this.readFullLine(returnAsText));
                }
                return matrixResult;
            },
            readRawLines: (count, returnAsText) => {
                const linesResult = [];
                for (let i = 0; i < count; i++) {
                    if (currentLinePointer >= sourceLines.length) {
                        linesResult.push(undefined);
                    } else {
                        currentLineTokenBuffer = [];
                        const rawLine = sourceLines[currentLinePointer++];
                        linesResult.push(returnAsText ? rawLine : Number(rawLine));
                    }
                }
                return linesResult;
            }
        };
    }
    return createInputSource;
})();
const dataReader = acquireData(require("fs").readFileSync("/dev/stdin", "utf8"));

function evaluateInput() {
  const inputSequence = dataReader.extractNextToken(true);
  const sequenceChars = Array.from(inputSequence);

  const hasConsecutiveMatches = sequenceChars.slice(0, -1).some((char, idx) => {
    return char === sequenceChars[idx + 1];
  });

  return hasConsecutiveMatches ? "Bad" : "Good";
}

console.log(evaluateInput());
