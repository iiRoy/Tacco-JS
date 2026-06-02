const inputProcessor = (function() {
    function createParser(sourceText) {
        let inputLines = sourceText.trim().split('\n');
        let linePointer = 0;
        let tokenCache = [];

        const refillTokens = () => {
            if (tokenCache.length === 0 && linePointer < inputLines.length) {
                tokenCache = inputLines[linePointer++].split(' ').reverse();
            }
        };

        return {
            grabValue: function(isString) {
                refillTokens();
                if (tokenCache.length === 0) return undefined;
                let val = tokenCache.pop();
                return isString ? val : Number(val);
            },
            fetchLine: function(isString) {
                if (linePointer >= inputLines.length) return [];
                let line = inputLines[linePointer++].split(' ');
                return isString ? line : line.map(Number);
            },
            scanGrid: function(numRows, isString) {
                let grid = [];
                for (let i = 0; i < numRows; i++) {
                    if (linePointer >= inputLines.length) break;
                    let row = inputLines[linePointer++].split(' ');
                    grid.push(isString ? row : row.map(Number));
                }
                return grid;
            },
            pullBlocks: function(numRows, isString) {
                let blocks = [];
                for (let i = 0; i < numRows; i++) {
                    if (linePointer >= inputLines.length) break;
                    let block = inputLines[linePointer++];
                    blocks.push(isString ? block : Number(block));
                }
                return blocks;
            }
        };
    }
    return createParser;
})();

function findRemovalSequence(initialArr) {
    const searchStack = [{ currentArrayState: [...initialArr], removedElements: [] }];

    while (searchStack.length > 0) {
        const { currentArrayState, removedElements } = searchStack.pop();

        if (currentArrayState.length === 0) {
            return removedElements;
        }

        for (let idx = currentArrayState.length - 1; idx >= 0; idx--) {
            if (currentArrayState[idx] === idx + 1) {
                const nextArrayState = [
                    ...currentArrayState.slice(0, idx),
                    ...currentArrayState.slice(idx + 1)
                ];
                const nextRemovedElements = [...removedElements, currentArrayState[idx]];

                searchStack.push({
                    currentArrayState: nextArrayState,
                    removedElements: nextRemovedElements
                });
                break;
            }
        }
    }

    return null;
}

function processSequence() {
    const dataReader = inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const countVal = dataReader.grabValue();
    const initialElements = dataReader.fetchLine();

    const solutionPath = findRemovalSequence(initialElements);

    if (solutionPath === null) {
        return -1;
    } else {
        return solutionPath.reverse().join("\n");
    }
}

console.log(processSequence());
