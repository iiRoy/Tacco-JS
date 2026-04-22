const processText = (dataBlock) => {
    const segments = dataBlock.split('\n');
    const firstSequence = segments[0].split('');
    const secondSequence = segments[1].split('');

    const comparisonExtent = firstSequence.length;

    const matchedPositionsCount = Array.from({ length: comparisonExtent }, (_, positionIndex) => positionIndex)
        .reduce((currentAccumulator, currentPosition) => {
            if (firstSequence[currentPosition] === secondSequence[currentPosition]) {
                return currentAccumulator + 1;
            }
            return currentAccumulator;
        }, 0);

    console.log(matchedPositionsCount);
};

processText(require("fs").readFileSync("/dev/stdin", "utf8"));