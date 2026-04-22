'use strict'

function extractNumbers(lineString) {
    return lineString.match(/-?\d+/g).map(Number);
}

// Recursive binary search (equivalent to lower_bound)
function seekBoundary(collection, targetValue, initialLow, initialHigh) {
    let currentLow = initialLow;
    let currentHigh = initialHigh;
    while (currentLow < currentHigh) {
        const mid = Math.floor((currentLow + currentHigh) / 2);
        if (collection[mid].moment < targetValue) {
            currentLow = mid + 1;
        } else {
            currentHigh = mid;
        }
    }
    return currentLow;
}

let nextUnassigned; // Disjoint Set Union (DSU) parent array for skipping assigned queries

function findUnassigned(idx) {
    if (nextUnassigned[idx] === idx) {
        return idx;
    }
    return nextUnassigned[idx] = findUnassigned(nextUnassigned[idx]); // Path compression
}

function processInputAndCompute(sourceContent) {
    const rawLines = sourceContent.trim().split('\n');
    let lineCursor = 0;

    const [segmentCount, queryCount] = extractNumbers(rawLines[lineCursor++]);

    const journeySegments = [];
    for (let i = 0; i < segmentCount; i++) {
        const [startPoint, endPoint, tollValue] = extractNumbers(rawLines[lineCursor++]);
        journeySegments.push({ begin: startPoint, finish: endPoint, levy: tollValue });
    }

    const dayQueries = [];
    for (let i = 0; i < queryCount; i++) {
        const dayValue = Number(rawLines[lineCursor++]);
        dayQueries.push({ moment: dayValue, originalPos: i });
    }

    // Sort journey segments by toll in ascending order.
    // This ensures that the first toll assigned to a query day will be the minimum.
    journeySegments.sort((a, b) => a.levy - b.levy);

    // Sort day queries by day value. This is crucial for binary search and efficient range processing.
    dayQueries.sort((a, b) => a.moment - b.moment);

    const finalTolls = new Array(queryCount).fill(-1);
    
    // Initialize DSU: nextUnassigned[i] stores the next available index >= i.
    // An index is 'available' if its query hasn't been assigned a toll yet.
    // We use queryCount + 1 to simplify boundary conditions (nextUnassigned[queryCount] points to queryCount).
    nextUnassigned = Array.from({ length: queryCount + 1 }, (_, i) => i);

    for (const segment of journeySegments) {
        const effectiveStartDay = segment.begin - segment.levy;
        const effectiveEndDay = segment.finish - segment.levy;

        // Find the range of sorted query indices that this segment covers
        let currentSortedQIdx = seekBoundary(dayQueries, effectiveStartDay, 0, queryCount);
        const endSortedQIdx = seekBoundary(dayQueries, effectiveEndDay + 1, currentSortedQIdx, queryCount); // +1 to make it an exclusive upper bound

        // Iterate through the relevant query indices using the DSU.
        // `findUnassigned(currentSortedQIdx)` efficiently skips over queries that have already been assigned a toll.
        for (let k = findUnassigned(currentSortedQIdx); k < endSortedQIdx; k = findUnassigned(k + 1)) {
            const queryObj = dayQueries[k];
            
            // Assign the toll. Since segments are sorted by levy ascending, this will be the minimum levy.
            finalTolls[queryObj.originalPos] = segment.levy;
            
            // Mark this index as 'processed' in the DSU by pointing it to the next available index.
            nextUnassigned[k] = findUnassigned(k + 1);
        }
    }

    return finalTolls.join('\n');
}

function ProcessTripData(sourceData) {
    return processInputAndCompute(sourceData);
}

ProcessTripData(require("fs").readFileSync("/dev/stdin", "utf8"));