const obtainCommonElementCount = (firstCollection, secondCollection) =>
    new Set([...firstCollection].filter(item => secondCollection.has(item))).size;

const analyzeTextSegments = (sourceContent) => {
    const [lengthDescriptor, characterSequence] = sourceContent.trim().split('\n');

    const sequenceLengthValue = Number(lengthDescriptor);
    
    const partitionIndexes = Array.from({ length: sequenceLengthValue - 1 }, (_, idx) => idx + 1);

    const calculatedOverlapCounts = partitionIndexes.map(currentSplitPoint => {
        const initialSegment = characterSequence.slice(0, currentSplitPoint);
        const terminalSegment = characterSequence.slice(currentSplitPoint);

        const distinctInitialChars = new Set(initialSegment);
        const distinctTerminalChars = new Set(terminalSegment);

        return obtainCommonElementCount(distinctInitialChars, distinctTerminalChars);
    });

    const highestOverlap = calculatedOverlapCounts.length > 0
        ? Math.max(...calculatedOverlapCounts)
        : -Infinity;

    console.log(highestOverlap);
};

analyzeTextSegments(require("fs").readFileSync("/dev/stdin", "utf8"));