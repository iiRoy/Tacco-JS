const createLineIterator = (initialContent) => {
    const contentLines = initialContent.split("\n");
    let currentPosition = 0;
    return {
        next: () => {
            if (currentPosition < contentLines.length) {
                return { value: contentLines[currentPosition++], done: false };
            } else {
                return { value: undefined, done: true };
            }
        }
    };
};

const charProcessor = (originalLabel) => {
    const vowelRecognizer = /[aiueo]/;
    return Array.from(originalLabel).reduce((accumulator, currentSymbol) => {
        let currentOutput = accumulator.output;
        let shouldCaptureNext = accumulator.shouldCapture;

        if (shouldCaptureNext) {
            currentOutput += currentSymbol;
            shouldCaptureNext = false;
        }

        if (vowelRecognizer.test(currentSymbol)) {
            shouldCaptureNext = true;
        }

        return { output: currentOutput, shouldCapture: shouldCaptureNext };
    }, { output: '', shouldCapture: true }).output;
};

const commonSegmentLocator = (firstString, secondString, blockDimension) => {
    const shortestLength = Math.min(firstString.length, secondString.length);

    for (let comparisonIndex = 0; comparisonIndex < blockDimension; ++comparisonIndex) {
        if (firstString[comparisonIndex] !== secondString[comparisonIndex]) {
            return comparisonIndex;
        }
    }

    if (firstString.length === secondString.length) {
        return -1;
    }
    return shortestLength;
};

const processInputBlocks = (lineIterator) => {
    const collectedOutputs = [];

    let currentBlockSize;
    while (true) {
        const nextContentLine = lineIterator.next().value;
        if (nextContentLine === undefined) {
             break;
        }
        currentBlockSize = Number(nextContentLine);
        if (currentBlockSize === 0) {
            break;
        }

        const initialLabels = Array.from({ length: currentBlockSize }, () => lineIterator.next().value);

        const transformedAndSortedLabels = initialLabels
            .map(charProcessor)
            .sort();

        const { finalMaxOverlap } = transformedAndSortedLabels.slice(1).reduce((accumulator, currentLabel, index) => {
            if (accumulator.hasTerminatedEarly) {
                return accumulator;
            }

            const currentFullIndex = index + 1;
            const previousLabelForComparison = transformedAndSortedLabels[currentFullIndex - 1];
            const currentLabelForComparison = transformedAndSortedLabels[currentFullIndex];

            const calculatedOverlap = commonSegmentLocator(
                previousLabelForComparison,
                currentLabelForComparison,
                currentBlockSize
            );

            if (calculatedOverlap === -1) {
                return { finalMaxOverlap: -2, hasTerminatedEarly: true };
            }

            return {
                finalMaxOverlap: Math.max(accumulator.finalMaxOverlap, calculatedOverlap),
                hasTerminatedEarly: false
            };
        }, { finalMaxOverlap: 0, hasTerminatedEarly: false });

        collectedOutputs.push(finalMaxOverlap + 1);
    }
    return collectedOutputs.join("\n");
};

const rawTextContent = require("fs").readFileSync("/dev/stdin", "utf8");
const lineSupply = createLineIterator(rawTextContent);
const finalResultString = processInputBlocks(lineSupply);
console.log(finalResultString);