function Main(rawInput) {
    const lines = rawInput.split("\n");
    let lineCursor = 0;

    while (true) {
        const nmData = lines[lineCursor++].split(" ");
        const currentHeightCount = parseInt(nmData[0], 10);
        const currentWidthCount = parseInt(nmData[1], 10);

        if (currentHeightCount === 0 && currentWidthCount === 0) {
            break;
        }

        const heightValues = Array.from({ length: currentHeightCount }, () => parseInt(lines[lineCursor++], 10));
        const widthValues = Array.from({ length: currentWidthCount }, () => parseInt(lines[lineCursor++], 10));

        const resultCount = calculateRectangles(heightValues, widthValues);
        console.log(resultCount);
    }
}

function calculateRectangles(heightsData, widthsData) {
    const heightAccumulatedSums = heightsData.reduce((accumulator, currentDimension) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentDimension);
        return accumulator;
    }, [0]);

    const widthAccumulatedSums = widthsData.reduce((accumulator, currentDimension) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentDimension);
        return accumulator;
    }, [0]);

    const allHeightSegmentsGenerated = heightAccumulatedSums.flatMap((initialSum, initialIndex, sumArray) =>
        sumArray.slice(initialIndex + 1).map(finalSum => finalSum - initialSum)
    );
    const heightSegmentFrequencyMap = allHeightSegmentsGenerated.reduce((frequencyMap, segmentLengthValue) =>
        frequencyMap.set(segmentLengthValue, (frequencyMap.get(segmentLengthValue) || 0) + 1), new Map()
    );

    const allWidthSegmentsGenerated = widthAccumulatedSums.flatMap((initialSum, initialIndex, sumArray) =>
        sumArray.slice(initialIndex + 1).map(finalSum => finalSum - initialSum)
    );
    const widthSegmentFrequencyMap = allWidthSegmentsGenerated.reduce((frequencyMap, segmentLengthValue) =>
        frequencyMap.set(segmentLengthValue, (frequencyMap.get(segmentLengthValue) || 0) + 1), new Map()
    );

    let totalMatchingRectanglePairs = 0;
    for (const [dimensionLength, heightOccurrences] of heightSegmentFrequencyMap.entries()) {
        const widthOccurrences = widthSegmentFrequencyMap.get(dimensionLength) || 0;
        totalMatchingRectanglePairs += heightOccurrences * widthOccurrences;
    }

    return totalMatchingRectanglePairs;
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));
