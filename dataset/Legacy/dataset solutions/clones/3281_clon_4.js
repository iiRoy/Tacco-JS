var inputProcessor = (function() {
    function createParser(sourceText) {
        const lineSegments = sourceText.trim().split('\n');
        let currentLinePointer = 0;
        let currentSegmentTokens = [];

        const retrieveNextToken = () => {
            if (currentSegmentTokens.length === 0) {
                if (currentLinePointer >= lineSegments.length) {
                    return undefined;
                }
                currentSegmentTokens = lineSegments[currentLinePointer].split(' ').reverse();
                currentLinePointer++;
            }
            return currentSegmentTokens.pop();
        };

        const extractValue = (asStringFlag) => {
            const token = retrieveNextToken();
            return asStringFlag ? token : Number(token);
        };

        const fetchLine = (asStringFlag) => {
            if (currentLinePointer >= lineSegments.length) {
                return [];
            }
            const lineContent = lineSegments[currentLinePointer];
            currentLinePointer++;
            currentSegmentTokens = [];
            const tokens = lineContent.split(' ');
            return asStringFlag ? tokens : tokens.map(Number);
        };

        return {
            extractValue: extractValue,
            fetchLine: fetchLine,
        };
    }
    return createParser;
})();

var dataReader = inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateResult());

function calculateResult() {
    var totalItems = dataReader.extractValue();
    var thresholdOne = dataReader.extractValue();
    var thresholdTwo = dataReader.extractValue();
    var itemValues = dataReader.fetchLine();

    const { groupA, groupB, groupC } = itemValues.reduce((accumulator, currentItem) => {
        if (currentItem <= thresholdOne) {
            accumulator.groupA++;
        } else if (currentItem > thresholdTwo) {
            accumulator.groupB++;
        } else {
            accumulator.groupC++;
        }
        return accumulator;
    }, { groupA: 0, groupB: 0, groupC: 0 });

    return Math.min(groupA, groupB, groupC);
}
