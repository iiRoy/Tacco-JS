var getParser = (function() {
    function createInputProcessor(rawInputContent) {
        var allInputLines = rawInputContent.trim().split('\n');
        var currentLinePointer = 0;
        var currentLineTokensForGrabItem = [];
        var tokensRemainingForGrabItem = 0;

        function retrieveNextItemToken() {
            if (tokensRemainingForGrabItem === 0) {
                if (currentLinePointer >= allInputLines.length) {
                    throw new Error("Input exhausted for 'grabItem' method.");
                }
                currentLineTokensForGrabItem = allInputLines[currentLinePointer].split(' ').reverse();
                tokensRemainingForGrabItem = currentLineTokensForGrabItem.length;
                currentLinePointer++;
            }
            tokensRemainingForGrabItem--;
            return currentLineTokensForGrabItem.pop();
        }

        return {
            grabItem: function(returnAsString) {
                var token = retrieveNextItemToken();
                return returnAsString ? token : Number(token);
            },

            grabLine: function(returnAsString) {
                if (currentLinePointer >= allInputLines.length) {
                    throw new Error("Input exhausted for 'grabLine' method.");
                }
                var lineContent = allInputLines[currentLinePointer++];
                var tokens = lineContent.split(' ');
                return returnAsString ? tokens : tokens.map(function(val) { return Number(val); });
            },

            grabMatrix: function(lineCount, returnAsString) {
                if (currentLinePointer + lineCount > allInputLines.length) {
                    throw new Error("Not enough lines for 'grabMatrix' method.");
                }
                var matrixResult = [];
                for (var i = 0; i < lineCount; i++) {
                    var lineContent = allInputLines[currentLinePointer++];
                    var tokens = lineContent.split(' ');
                    matrixResult.push(returnAsString ? tokens : tokens.map(function(val) { return Number(val); }));
                }
                return matrixResult;
            },

            grabRawLines: function(lineCount, returnAsString) {
                if (currentLinePointer + lineCount > allInputLines.length) {
                    throw new Error("Not enough lines for 'grabRawLines' method.");
                }
                var rawLinesResult = allInputLines.slice(currentLinePointer, currentLinePointer + lineCount);
                currentLinePointer += lineCount;
                return returnAsString ? rawLinesResult : rawLinesResult.map(function(val) { return Number(val); });
            }
        };
    }
    return createInputProcessor;
})();

var inputReader = getParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    var bitCount = inputReader.grabItem();
    var startValue = inputReader.grabItem();
    var endValue = inputReader.grabItem();
    var totalSetBits = 0;

    for (var bitPosition = 0; bitPosition < bitCount; bitPosition++) {
        var currentBitMask = 1 << bitPosition;
        if (startValue & currentBitMask) totalSetBits++;
        if (endValue & currentBitMask) totalSetBits++;
    }

    if (totalSetBits % 2 === 0) return "NO";

    var pathSequence = Array(1 << bitCount);

    function generatePath(initialCurrentVal, initialTargetVal, initialFixedBitsMask, initialOutputIndex) {
        var callStack = [[initialCurrentVal, initialTargetVal, initialFixedBitsMask, initialOutputIndex]];

        while (callStack.length > 0) {
            var currentFrame = callStack.pop();
            var currentVal = currentFrame[0];
            var targetVal = currentFrame[1];
            var fixedBitsMask = currentFrame[2];
            var outputIndex = currentFrame[3];

            if (currentVal === targetVal) {
                pathSequence[outputIndex] = currentVal;
                continue;
            }

            var xorDifference = currentVal ^ targetVal;
            var intermediateY = currentVal;
            var intermediateZ = currentVal;
            var foundFirstCommonBit = false;
            var foundFirstDiffBit = false;
            var fixedBitCount = 0;
            var firstDiffBitMask = 0;

            for (var bitPosition = 0; bitPosition < bitCount; bitPosition++) {
                var currentBitMask = 1 << bitPosition;
                if (currentBitMask & fixedBitsMask) {
                    fixedBitCount++;
                    continue;
                }

                if ((xorDifference & currentBitMask) === 0) {
                    if (!foundFirstCommonBit) {
                        foundFirstCommonBit = true;
                        intermediateY ^= currentBitMask;
                        intermediateZ ^= currentBitMask;
                    }
                } else {
                    if (!foundFirstDiffBit) {
                        foundFirstDiffBit = true;
                        intermediateZ ^= currentBitMask;
                        firstDiffBitMask = currentBitMask;
                    }
                }
            }

            callStack.push([intermediateZ, targetVal, fixedBitsMask | firstDiffBitMask, outputIndex + (1 << (bitCount - fixedBitCount - 1))]);
            callStack.push([currentVal, intermediateY, fixedBitsMask, outputIndex]);
        }
    }

    generatePath(startValue, endValue, 0, 0);
    console.log("YES");
    return pathSequence.join(" ");
}
