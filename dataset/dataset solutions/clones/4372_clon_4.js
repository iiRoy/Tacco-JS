const textSource = require("fs").readFileSync("/dev/stdin", "utf8");

const calculateUniqueOccurrences = (rawText) => {
    const segments = rawText.split('\n');
    const dataSize = Number(segments[0]);

    const exclusiveElements = new Set();
    const repeatingElements = new Set();

    for (let currentIdx = 1; currentIdx <= dataSize; currentIdx++) {
        const currentSegment = segments[currentIdx];

        if (repeatingElements.has(currentSegment)) {
            // Element has already been seen multiple times, no change needed
        } else if (exclusiveElements.has(currentSegment)) {
            // Element was unique, but now it's a repeat
            exclusiveElements.delete(currentSegment);
            repeatingElements.add(currentSegment);
        } else {
            // First time seeing this element
            exclusiveElements.add(currentSegment);
        }
    }

    console.log(exclusiveElements.size);
};

calculateUniqueOccurrences(textSource);