const processApplication = (inputData) => {
    const [configLineText, ...sequenceLines] = inputData.trim().split('\n');
    const [initialLength, allowedConversions] = configLineText.split(/\s+/).map(Number);
    const sourceSequence = sequenceLines[0].split('').map(Number);

    const segmentLengths = (() => {
        if (sourceSequence.length === 0) {
            return [0];
        }

        const firstElement = sourceSequence[0];
        const groupedSegments = sourceSequence.reduce((accumulator, currentItem) => {
            const lastSegment = accumulator[accumulator.length - 1];
            if (lastSegment && lastSegment.value === currentItem) {
                lastSegment.count++;
            } else {
                accumulator.push({ value: currentItem, count: 1 });
            }
            return accumulator;
        }, []);

        const extractedLengths = groupedSegments.map(segment => segment.count);

        if (firstElement === 0) {
            extractedLengths.unshift(0);
        }
        return extractedLengths;
    })(); // Immediately invoked function expression to encapsulate RLE logic

    const effectiveSliceLimit = Math.min(segmentLengths.length, allowedConversions * 2 + 1);
    
    const finalSum = segmentLengths.slice(0, effectiveSliceLimit).reduce((sumAccumulator, currentLength) => sumAccumulator + currentLength, 0);

    console.log(finalSum);
};

if (typeof globalThis.customWindow === "undefined") {
    const systemOperations = require("node:fs");
    processApplication(systemOperations.readFileSync("/dev/fd/0", { encoding: "utf8" }));
}