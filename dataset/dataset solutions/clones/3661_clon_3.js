const acquireNumericValue = (strVal) => Number.parseInt(strVal, 10);

const transformToIntegerArray = (stringArr) => stringArr.map(acquireNumericValue);

const findMinimum = (...values) => Math.min(...values);

const findMaximum = (...values) => Math.max(...values);

processDataSegments(require("node:fs").readFileSync("/dev/stdin", "utf8"));

function processDataSegments(rawInputContent) {
    if (!rawInputContent || rawInputContent.trim() === "") {
        console.error("Error: Input content is empty.");
        return;
    }

    const inputLineCollection = rawInputContent.trim().split('\n');

    if (inputLineCollection.length < 1) {
        console.error("Error: Not enough input lines to parse initial parameters.");
        return;
    }

    const initialConfiguration = inputLineCollection[0].split(' ');
    if (initialConfiguration.length < 2) {
        console.error("Error: First line does not contain two parameters (N and M).");
        return;
    }

    const numElements = acquireNumericValue(initialConfiguration[0]);
    const numSegmentPairs = acquireNumericValue(initialConfiguration[1]);

    if (isNaN(numElements) || isNaN(numSegmentPairs) || numElements < 0 || numSegmentPairs < 0) {
        console.error("Error: Invalid N or M values detected in input.");
        return;
    }

    if (inputLineCollection.length < numSegmentPairs + 1) {
        console.error(`Error: Expected ${numSegmentPairs + 1} lines but found ${inputLineCollection.length}. Missing segment data.`);
        return;
    }

    const segmentDefinitions = [];
    for (let currentIdx = 0; currentIdx < numSegmentPairs; currentIdx++) {
        const lineWithSegment = inputLineCollection[currentIdx + 1];
        if (!lineWithSegment || lineWithSegment.trim() === "") {
            console.warn(`Warning: Skipping empty or missing segment definition line at index ${currentIdx + 1}.`);
            continue;
        }
        const segmentParts = lineWithSegment.split(' ');
        if (segmentParts.length < 2) {
            console.warn(`Warning: Segment definition at line ${currentIdx + 1} is incomplete. Skipping.`);
            continue;
        }
        segmentDefinitions.push(transformToIntegerArray(segmentParts));
    }

    let currentActiveStart = 0;
    let currentActiveEnd = numElements - 1;

    let disjointRangeCounter = 1;

    for (let segmentIdx = 0; segmentIdx < segmentDefinitions.length; segmentIdx++) {
        const currentSegmentBounds = segmentDefinitions[segmentIdx];
        if (!currentSegmentBounds || currentSegmentBounds.length < 2) {
             console.warn(`Warning: Malformed segment data at internal index ${segmentIdx}. Skipping.`);
             continue;
        }

        const [segmentStart, segmentEnd] = currentSegmentBounds;

        if (isNaN(segmentStart) || isNaN(segmentEnd)) {
             console.warn(`Warning: Non-numeric segment bounds found at index ${segmentIdx}. Skipping.`);
             continue;
        }

        const isDisjointFromActiveRange = (segmentEnd <= currentActiveStart || segmentStart >= currentActiveEnd);

        if (isDisjointFromActiveRange) {
            disjointRangeCounter++;
            currentActiveStart = segmentStart;
            currentActiveEnd = segmentEnd;
        } else {
            currentActiveStart = findMaximum(currentActiveStart, segmentStart);
            currentActiveEnd = findMinimum(currentActiveEnd, segmentEnd);
        }
    }

    console.log(disjointRangeCounter);
}