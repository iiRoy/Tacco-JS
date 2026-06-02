const inputSource = (function() {
    function createReader(sourceString) {
        let currentLines = sourceString.trim().split("\n");
        let lineCursor = 0;
        let currentLineTokens = [];

        const advanceLine = () => {
            if (lineCursor < currentLines.length) {
                currentLineTokens = currentLines[lineCursor++].split(" ").reverse();
            } else {
                currentLineTokens = [];
            }
        };

        advanceLine();

        return {
            a: function(asString) {
                if (currentLineTokens.length === 0) {
                    advanceLine();
                }
                const token = currentLineTokens.pop();
                return asString ? token : Number(token);
            },
            l: function(asStrings) {
                const line = currentLines[lineCursor++];
                const tokens = line.split(" ");
                return asStrings ? tokens : tokens.map(Number);
            },
            m: function(numLines, asStrings) {
                const result = [];
                for (let i = 0; i < numLines; i++) {
                    const line = currentLines[lineCursor++];
                    const tokens = line.split(" ");
                    result.push(asStrings ? tokens : tokens.map(Number));
                }
                return result;
            },
            r: function(numLines, asStrings) {
                const result = [];
                for (let i = 0; i < numLines; i++) {
                    result.push(currentLines[lineCursor++]);
                }
                return asStrings ? result : result.map(Number);
            }
        };
    }
    return createReader;
})();
const inputReader = inputSource(require("fs").readFileSync("/dev/stdin","utf8"));

function createNestedArray(defaultValue, ...dimensions) {
    const generateLayer = (depth) => {
        if (depth === dimensions.length - 1) {
            return Array.from({ length: dimensions[depth] }, () => defaultValue);
        } else {
            return Array.from({ length: dimensions[depth] }, () => generateLayer(depth + 1));
        }
    };
    return generateLayer(0);
}

console.log(calculateMaximumSum());

function calculateMaximumSum(){
    const elementCount = inputReader.a();
    const valueArray = inputReader.l();
    const halfCount = elementCount >> 1;

    const overallMaximum = Array.from({ length: halfCount - 1 }, (_, index) => index + 1)
        .reduce((currentOverallMax, currentStride) => {
            const potentialPositions = Array.from({
                length: Math.floor((elementCount - 2 - currentStride) / currentStride) + 1
            }, (_, idx) => currentStride + idx * currentStride);

            const strideAccumulator = potentialPositions.reduce((acc, currentPosition) => {
                if (acc.shouldTerminate) {
                    return acc;
                }

                const symmetricPosition = elementCount - currentPosition - 1;

                if (acc.visitedPositions.has(currentPosition) ||
                    acc.visitedPositions.has(symmetricPosition) ||
                    currentPosition === symmetricPosition) {
                    return { ...acc, shouldTerminate: true };
                }

                const newCurrentSum = acc.currentSum + valueArray[currentPosition] + valueArray[symmetricPosition];
                acc.visitedPositions.add(currentPosition);
                acc.visitedPositions.add(symmetricPosition);

                const newMaxForStride = Math.max(acc.maxSumForStride, newCurrentSum);

                return {
                    currentSum: newCurrentSum,
                    visitedPositions: acc.visitedPositions,
                    maxSumForStride: newMaxForStride,
                    shouldTerminate: false,
                };
            }, {
                currentSum: 0,
                visitedPositions: new Set(),
                maxSumForStride: 0,
                shouldTerminate: false,
            });

            return Math.max(currentOverallMax, strideAccumulator.maxSumForStride);
        }, 0);

    return overallMaximum;
}
