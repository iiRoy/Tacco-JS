const getParser = (function() {
    function createParser(inputString) {
        const lines = inputString.trim().split("\n");
        let currentLineIndex = 0;
        let currentLineTokens = null;
        let currentTokenIndex = 0;

        return {
            readToken: function(asString) {
                if (currentLineTokens === null || currentTokenIndex >= currentLineTokens.length) {
                    if (currentLineIndex >= lines.length) {
                        return asString ? "" : NaN;
                    }
                    currentLineTokens = lines[currentLineIndex].split(" ");
                    currentTokenIndex = 0;
                }

                const token = currentLineTokens[currentTokenIndex];
                currentTokenIndex++;

                if (currentTokenIndex >= currentLineTokens.length) {
                    currentLineIndex++;
                    currentLineTokens = null;
                }

                return asString ? token : +token;
            }
        };
    }
    return createParser;
})();

function createNestedArray(dimensions, initialValueFactory) {
    if (dimensions.length === 0) {
        return initialValueFactory();
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDimSize }, () => createNestedArray(remainingDims, initialValueFactory));
}

const boundaryRanges = createNestedArray([6], () => ({ min: Infinity, max: -Infinity }));
const uniqueValues = new Set([0]);

function updateBoundary(index, value) {
    boundaryRanges[index].min = Math.min(boundaryRanges[index].min, value);
    boundaryRanges[index].max = Math.max(boundaryRanges[index].max, value);
}

function findMaximum(...values) {
    const validValues = values.filter(v => !isNaN(v));
    if (validValues.length === 0) {
        return values.length > 0 ? values[0] : undefined;
    }
    return Math.max(...validValues);
}

function findMinimum(...values) {
    const validValues = values.filter(v => !isNaN(v));
    if (validValues.length === 0) {
        return values.length > 0 ? values[0] : undefined;
    }
    return Math.min(...validValues);
}

function populateUniqueValues(valA, valB, valC) {
    const term1 = findMaximum(0, (valC - valB) || 0, (valC - valA) / 2 || 0);
    const term2 = findMaximum(0, (valB - valA) || 0, (valC - valA) / 2 || 0);
    uniqueValues.add(term1);
    uniqueValues.add(term2);
}

const inputReader = getParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function processMainLogic() {
    const numOperations = inputReader.readToken();

    const directionHandlers = {
        "U": (xCoord, yCoord) => { updateBoundary(0, yCoord); updateBoundary(5, xCoord); },
        "R": (xCoord, yCoord) => { updateBoundary(1, xCoord); updateBoundary(4, yCoord); },
        "D": (xCoord, yCoord) => { updateBoundary(2, yCoord); updateBoundary(5, xCoord); },
        "L": (xCoord, yCoord) => { updateBoundary(3, xCoord); updateBoundary(4, yCoord); }
    };

    for (let opIdx = 0; opIdx < numOperations; opIdx++) {
        const currentX = inputReader.readToken();
        const currentY = inputReader.readToken();
        const directionChar = inputReader.readToken(true);
        directionHandlers[directionChar](currentX, currentY);
    }

    populateUniqueValues(boundaryRanges[0].max, boundaryRanges[4].max, boundaryRanges[2].max);
    populateUniqueValues(-boundaryRanges[2].min, -boundaryRanges[4].min, -boundaryRanges[0].min);
    populateUniqueValues(boundaryRanges[1].max, boundaryRanges[5].max, boundaryRanges[3].max);
    populateUniqueValues(-boundaryRanges[3].min, -boundaryRanges[5].min, -boundaryRanges[1].min);

    const minimumArea = Array.from(uniqueValues).reduce((currentMinArea, currentI) => {
        const upper = findMaximum(boundaryRanges[0].max + currentI, boundaryRanges[2].max - currentI, boundaryRanges[4].max);
        const lower = findMinimum(boundaryRanges[0].min + currentI, boundaryRanges[2].min - currentI, boundaryRanges[4].min);
        const right = findMaximum(boundaryRanges[1].max + currentI, boundaryRanges[3].max - currentI, boundaryRanges[5].max);
        const left = findMinimum(boundaryRanges[1].min + currentI, boundaryRanges[3].min - currentI, boundaryRanges[5].min);
        
        const currentArea = (upper - lower) * (right - left);
        return findMinimum(currentMinArea, currentArea);
    }, 1e18);

    return minimumArea;
}

console.log(processMainLogic());
