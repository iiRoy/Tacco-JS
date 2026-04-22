class RangeSegmentTree {
    constructor(dimensionSize) {
        this.dimSize = dimensionSize;
        this.dataStore = new Array(4 * dimensionSize).fill(0);
        this.pendingUpdates = new Array(4 * dimensionSize).fill(0);
    }

    _propagate(nodeIndex, rangeStart, rangeEnd) {
        if (this.pendingUpdates[nodeIndex] !== 0) {
            this.dataStore[nodeIndex] += this.pendingUpdates[nodeIndex];
            if (rangeStart !== rangeEnd) {
                this.pendingUpdates[2 * nodeIndex] += this.pendingUpdates[nodeIndex];
                this.pendingUpdates[2 * nodeIndex + 1] += this.pendingUpdates[nodeIndex];
            }
            this.pendingUpdates[nodeIndex] = 0;
        }
    }

    updateRange(queryBegin, queryEnd, valueChange) {
        this._recursiveUpdate(1, 0, this.dimSize - 1, queryBegin, queryEnd, valueChange);
    }

    _recursiveUpdate(nodeIndex, rangeStart, rangeEnd, queryBegin, queryEnd, valueChange) {
        this._propagate(nodeIndex, rangeStart, rangeEnd);

        if (rangeStart > rangeEnd || rangeStart > queryEnd || rangeEnd < queryBegin) {
            return;
        }

        if (queryBegin <= rangeStart && rangeEnd <= queryEnd) {
            this.pendingUpdates[nodeIndex] += valueChange;
            this._propagate(nodeIndex, rangeStart, rangeEnd);
            return;
        }

        let midPoint = Math.floor((rangeStart + rangeEnd) / 2);
        this._recursiveUpdate(2 * nodeIndex, rangeStart, midPoint, queryBegin, queryEnd, valueChange);
        this._recursiveUpdate(2 * nodeIndex + 1, midPoint + 1, rangeEnd, queryBegin, queryEnd, valueChange);
        this.dataStore[nodeIndex] = Math.max(this.dataStore[2 * nodeIndex], this.dataStore[2 * nodeIndex + 1]);
    }

    fetchMax() {
        this._propagate(1, 0, this.dimSize - 1);
        return this.dataStore[1];
    }
}

function processWrappedIntervals(startVal, endVal, modulo) {
    startVal = (startVal % modulo + modulo) % modulo;
    endVal = (endVal % modulo + modulo) % modulo;

    if (startVal <= endVal) {
        return [[startVal, endVal + 1]]; // [start, end+1)
    } else {
        return [[startVal, modulo], [0, endVal + 1]];
    }
}

function clipAndFilterIntervals(intervals, maxCoordinate) {
    const validIntervals = [];
    for (const interval of intervals) {
        const clippedStart = Math.max(0, interval[0]);
        const clippedEnd = Math.min(maxCoordinate, interval[1]);
        if (clippedStart < clippedEnd) {
            validIntervals.push([clippedStart, clippedEnd]);
        }
    }
    return validIntervals;
}

function computeOptimalCount() {
    const allInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
    let currentLineIndex = 0;

    const parseNumericLine = () => allInputLines[currentLineIndex++].split(' ').map(Number);
    const parsePointData = (count) => {
        const pointCollection = [];
        for (let i = 0; i < count; ++i) {
            const parts = allInputLines[currentLineIndex++].split(' ');
            pointCollection.push([Number(parts[0]), Number(parts[1]), parts[2]]);
        }
        return pointCollection;
    };

    const firstLineData = parseNumericLine();
    const totalPoints = firstLineData[0];
    const kParameter = firstLineData[1];
    const kDouble = 2 * kParameter;

    const rawPoints = parsePointData(totalPoints);

    const adjustedPoints = rawPoints.map(item => {
        const originalX = item[0];
        const originalY = item[1];
        const pointType = item[2];
        return {
            adjustedX: (originalX + (pointType === 'B' ? kParameter : 0)) % kDouble,
            adjustedY: originalY % kDouble,
        };
    });

    const sweepEvents = []; // [x_position, y_start, y_end, delta]

    for (const currentPoint of adjustedPoints) {
        const pX = currentPoint.adjustedX;
        const pY = currentPoint.adjustedY;

        // Determine x-shift intervals for block 0 (x_rel < k)
        const x_intervals_block0 = processWrappedIntervals(pX - kParameter + 1, pX, kDouble);
        // Determine x-shift intervals for block 1 (x_rel >= k)
        const x_intervals_block1 = processWrappedIntervals(pX + 1, pX + kParameter, kDouble);

        // Determine y-shift intervals for block 0 (y_rel < k), then clip to [0, k-1]
        const y_intervals_block0_full = processWrappedIntervals(pY - kParameter + 1, pY, kDouble);
        const y_intervals_block0_clipped = clipAndFilterIntervals(y_intervals_block0_full, kParameter);

        // Determine y-shift intervals for block 1 (y_rel >= k), then clip to [0, k-1]
        const y_intervals_block1_full = processWrappedIntervals(pY + 1, pY + kParameter, kDouble);
        const y_intervals_block1_clipped = clipAndFilterIntervals(y_intervals_block1_full, kParameter);

        // Add events for (x_block=0, y_block=0) condition
        for (const x_int of x_intervals_block0) {
            for (const y_int of y_intervals_block0_clipped) {
                sweepEvents.push([x_int[0], y_int[0], y_int[1], 1]);
                sweepEvents.push([x_int[1], y_int[0], y_int[1], -1]);
            }
        }

        // Add events for (x_block=1, y_block=1) condition
        for (const x_int of x_intervals_block1) {
            for (const y_int of y_intervals_block1_clipped) {
                sweepEvents.push([x_int[0], y_int[0], y_int[1], 1]);
                sweepEvents.push([x_int[1], y_int[0], y_int[1], -1]);
            }
        }
    }

    sweepEvents.sort((a, b) => a[0] - b[0]);

    const yCoordSegmentTree = new RangeSegmentTree(kParameter);
    let overallMaxScore = 0;

    let eventCursor = 0;
    for (let currentXShift = 0; currentXShift < kDouble; ++currentXShift) {
        while (eventCursor < sweepEvents.length && sweepEvents[eventCursor][0] === currentXShift) {
            const [, y_start, y_end, value_change] = sweepEvents[eventCursor];
            if (y_start < y_end) {
                yCoordSegmentTree.updateRange(y_start, y_end - 1, value_change);
            }
            eventCursor++;
        }
        overallMaxScore = Math.max(overallMaxScore, yCoordSegmentTree.fetchMax());
    }
    return overallMaxScore;
}

console.log(computeOptimalCount());