const rawData = require("node:fs").readFileSync("/dev/stdin", "utf8");
const dataRows = rawData.split('\n');
const parameters = dataRows[0].split(' ').map(parseFloat);
const countElements = parameters[0];
const elementSpread = parameters[1];

const MAX_VALUE_LIMIT = 300000;
const segmentTreeContainer = new Array(4 * (MAX_VALUE_LIMIT + 1)).fill(0);
const pendingUpdates = new Array(4 * (MAX_VALUE_LIMIT + 1)).fill(0);

function transferPending(nodeIdx) {
    if (pendingUpdates[nodeIdx] !== 0) {
        segmentTreeContainer[nodeIdx * 2] = Math.max(segmentTreeContainer[nodeIdx * 2], pendingUpdates[nodeIdx]);
        pendingUpdates[nodeIdx * 2] = Math.max(pendingUpdates[nodeIdx * 2], pendingUpdates[nodeIdx]);

        segmentTreeContainer[nodeIdx * 2 + 1] = Math.max(segmentTreeContainer[nodeIdx * 2 + 1], pendingUpdates[nodeIdx]);
        pendingUpdates[nodeIdx * 2 + 1] = Math.max(pendingUpdates[nodeIdx * 2 + 1], pendingUpdates[nodeIdx]);

        pendingUpdates[nodeIdx] = 0;
    }
}

function updateValueRange(nodeIdx, currentLow, currentHigh, targetLow, targetHigh, newValue) {
    segmentTreeContainer[nodeIdx] = Math.max(segmentTreeContainer[nodeIdx], pendingUpdates[nodeIdx]);

    if (currentLow > targetHigh || currentHigh < targetLow) {
        return;
    }

    if (targetLow <= currentLow && currentHigh <= targetHigh) {
        segmentTreeContainer[nodeIdx] = Math.max(segmentTreeContainer[nodeIdx], newValue);
        pendingUpdates[nodeIdx] = Math.max(pendingUpdates[nodeIdx], newValue);
        return;
    }

    transferPending(nodeIdx);

    const mid = Math.floor((currentLow + currentHigh) / 2);
    updateValueRange(nodeIdx * 2, currentLow, mid, targetLow, targetHigh, newValue);
    updateValueRange(nodeIdx * 2 + 1, mid + 1, currentHigh, targetLow, targetHigh, newValue);

    segmentTreeContainer[nodeIdx] = Math.max(segmentTreeContainer[nodeIdx * 2], segmentTreeContainer[nodeIdx * 2 + 1]);
}

function retrievePointValue(nodeIdx, currentLow, currentHigh, searchPoint) {
    segmentTreeContainer[nodeIdx] = Math.max(segmentTreeContainer[nodeIdx], pendingUpdates[nodeIdx]);

    if (currentLow === currentHigh) {
        return segmentTreeContainer[nodeIdx];
    }

    transferPending(nodeIdx);

    const mid = Math.floor((currentLow + currentHigh) / 2);
    if (searchPoint <= mid) {
        return retrievePointValue(nodeIdx * 2, currentLow, mid, searchPoint);
    } else {
        return retrievePointValue(nodeIdx * 2 + 1, mid + 1, currentHigh, searchPoint);
    }
}

for (let elementIndex = 1; elementIndex <= countElements; elementIndex++) {
    const currentDatum = parseFloat(dataRows[elementIndex]);
    const maxPathBefore = retrievePointValue(1, 0, MAX_VALUE_LIMIT, currentDatum);

    const newPathLength = maxPathBefore + 1;

    const lowerLimit = Math.max(0, currentDatum - elementSpread);
    const upperLimit = currentDatum + elementSpread;

    updateValueRange(1, 0, MAX_VALUE_LIMIT, lowerLimit, upperLimit, newPathLength);
}

function obtainOverallMax(nodeIdx, currentLow, currentHigh) {
    segmentTreeContainer[nodeIdx] = Math.max(segmentTreeContainer[nodeIdx], pendingUpdates[nodeIdx]);

    if (currentLow === currentHigh) {
        return segmentTreeContainer[nodeIdx];
    }

    transferPending(nodeIdx);

    const mid = Math.floor((currentLow + currentHigh) / 2);
    const leftSegmentMax = obtainOverallMax(nodeIdx * 2, currentLow, mid);
    const rightSegmentMax = obtainOverallMax(nodeIdx * 2 + 1, mid + 1, currentHigh);
    return Math.max(leftSegmentMax, rightSegmentMax);
}

const finalResult = obtainOverallMax(1, 0, MAX_VALUE_LIMIT);
console.log(finalResult);