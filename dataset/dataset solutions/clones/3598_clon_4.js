function locateMiddleElement(dataArray) {
    dataArray.sort((val1, val2) => val1 - val2);
    return dataArray[Math.floor(dataArray.length / 2)];
}

function createInputProcessor(rawContent) {
    let sourceLines = rawContent.split("\n");
    let currentLineIndex = 0;
    let currentLineTokens = [];

    const refillTokensIfEmpty = () => {
        if (currentLineTokens.length === 0 && currentLineIndex < sourceLines.length) {
            currentLineTokens = sourceLines[currentLineIndex].split(" ");
            currentLineIndex++;
        }
    };

    return {
        extractNumericItem: function() {
            refillTokensIfEmpty();
            if (currentLineTokens.length === 0) {
                return undefined;
            }
            return Number(currentLineTokens.shift());
        },

        extractNumericRow: function() {
            if (currentLineIndex >= sourceLines.length) {
                return [];
            }
            const rowContent = sourceLines[currentLineIndex];
            currentLineIndex++;
            currentLineTokens = [];
            return rowContent.split(" ").map(Number);
        },

        extractNumericBlock: function(rowsCount) {
            const block = [];
            for (let i = 0; i < rowsCount; i++) {
                if (currentLineIndex < sourceLines.length) {
                    block.push(sourceLines[currentLineIndex].split(" ").map(Number));
                    currentLineIndex++;
                } else {
                    break;
                }
            }
            currentLineTokens = [];
            return block;
        }
    };
}

function performCalculation() {
    const inputHandler = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalCount = inputHandler.extractNumericItem();
    const initialSequence = inputHandler.extractNumericRow();

    if (totalCount <= 2) {
        return Math.max(...initialSequence);
    }

    const derivedSequence = Array.from({ length: totalCount - 1 }, (_, currentIdx) =>
        Math.max(initialSequence[currentIdx], initialSequence[currentIdx + 1])
    );

    const remainder = totalCount % 4;

    const strategyMap = new Map([
        [1, () => locateMiddleElement([...initialSequence, ...derivedSequence])],
        [2, () => locateMiddleElement([...initialSequence, ...derivedSequence])],
        [3, () => {
            const sortedDerivedCopy = [...derivedSequence].sort((val1, val2) => val1 - val2);
            const midOfInitial = locateMiddleElement([...initialSequence]);
            return locateMiddleElement([
                midOfInitial,
                midOfInitial,
                sortedDerivedCopy[Math.floor((totalCount - 1) / 2)],
                sortedDerivedCopy[Math.floor((totalCount - 2) / 2)]
            ]);
        }],
        [0, () => {
            const sortedInitialCopy = [...initialSequence].sort((val1, val2) => val1 - val2);
            const midOfDerived = locateMiddleElement([...derivedSequence]);
            return locateMiddleElement([
                midOfDerived,
                midOfDerived,
                sortedInitialCopy[Math.floor(totalCount / 2)],
                sortedInitialCopy[Math.floor((totalCount - 1) / 2)]
            ]);
        }]
    ]);

    const finalResult = strategyMap.get(remainder)();
    
    return finalResult;
}

console.log(performCalculation());