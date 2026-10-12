const createInputProcessor = (sourceText) => {
    let internalLines = sourceText.trim().split('\n');
    let currentLineIndex = 0;

    const processor = {
        pullLast: function(asString) {
            if (currentLineIndex >= internalLines.length) {
                throw new Error("Input exhausted for pullLast.");
            }
            let lineEntry = internalLines[currentLineIndex];
            if (typeof lineEntry === 'string') {
                lineEntry = internalLines[currentLineIndex] = lineEntry.split(' ').reverse();
            }
            const extracted = lineEntry.pop();
            if (lineEntry.length === 0) {
                currentLineIndex++;
            }
            return asString ? extracted : +extracted;
        },

        consumeLine: function(asString) {
            if (currentLineIndex >= internalLines.length) {
                throw new Error("Input exhausted for consumeLine.");
            }
            const line = internalLines[currentLineIndex];
            currentLineIndex++;
            return line.split(' ').map(item => asString ? item : +item);
        },

        grabMatrix: function(count, asString) {
            const result = [];
            for (let i = 0; i < count; i++) {
                if (currentLineIndex >= internalLines.length) {
                    throw new Error("Input exhausted for grabMatrix.");
                }
                const line = internalLines[currentLineIndex];
                currentLineIndex++;
                result.push(line.split(' ').map(item => asString ? item : +item));
            }
            return result;
        },

        fetchRaw: function(count, asString) {
            const result = [];
            for (let i = 0; i < count; i++) {
                if (currentLineIndex >= internalLines.length) {
                    throw new Error("Input exhausted for fetchRaw.");
                }
                const line = internalLines[currentLineIndex];
                currentLineIndex++;
                result.push(asString ? line : +line);
            }
            return result;
        }
    };
    return processor;
};

const inputProcessor = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function constructMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const createDimension = (dimIndex) => {
        const currentDimSize = dimensions[dimIndex];
        if (dimIndex === dimensions.length - 1) {
            return Array(currentDimSize).fill(initialValue);
        } else {
            return Array(currentDimSize).fill(0).map(() => createDimension(dimIndex + 1));
        }
    };

    return createDimension(0);
}

console.log(processHeights());

function processHeights() {
    const totalCount = inputProcessor.pullLast();
    const heightMeasurements = inputProcessor.consumeLine();

    const { visibleStructures } = heightMeasurements.reduce((accumulator, currentElevation) => {
        const { currentMaxElevation, visibleStructures: count } = accumulator;
        if (currentElevation >= currentMaxElevation) {
            return {
                currentMaxElevation: currentElevation,
                visibleStructures: count + 1
            };
        }
        return accumulator;
    }, { currentMaxElevation: 0, visibleStructures: 0 });

    return visibleStructures;
}
