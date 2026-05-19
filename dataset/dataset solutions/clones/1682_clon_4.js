function Main(input) {
    const dataLines = input.trim().split("\n").map(function(x) { return x.split(" ")});

    const findBoundaryIndex = (sortedBoundaries, targetValue) => {
        let low = 0, high = sortedBoundaries.length - 1, mid;
        while (low <= high) {
            mid = 0 | ((low + high) / 2);
            if (sortedBoundaries[mid] < targetValue) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    };

    let currentLineIndex = 1;
    while (true) {
        if (dataLines[currentLineIndex] == null) {
            break;
        }

        const N = parseInt(dataLines[currentLineIndex][0], 10);
        let baseAccumulator = 0;
        const variableGainItems = [];
        const uniqueKPrimeValues = new Set();

        for (let i = 0; i < N; i++) {
            const currentEntry = dataLines[currentLineIndex + i + 1].map(e => parseInt(e, 10));
            const K = currentEntry[0];
            const L = currentEntry[1];
            const R = currentEntry[2];

            if (K === N || L === R) {
                baseAccumulator += L;
            } else if (L > R) {
                variableGainItems.push({
                    targetKPrime: K - 1,
                    potentialGain: L - R,
                    category: 1 // Corresponds to original arr_KLR1
                });
                uniqueKPrimeValues.add(K - 1);
            } else { // L < R
                variableGainItems.push({
                    targetKPrime: N - K - 1,
                    potentialGain: R - L,
                    category: 2 // Corresponds to original arr_KLR2
                });
                uniqueKPrimeValues.add(N - K - 1);
            }
        }

        const sortedBoundaries = Array.from(uniqueKPrimeValues).sort((a, b) => a - b);

        const segmentCapacities = new Map();
        let lastBoundary = -1;
        for (const boundary of sortedBoundaries) {
            segmentCapacities.set(boundary, { total: boundary - lastBoundary, used: 0 });
            lastBoundary = boundary;
        }

        const kPrimeLookupTable = [];
        if (sortedBoundaries.length > 0) {
            const maxKPrime = sortedBoundaries[sortedBoundaries.length - 1];
            for (let k = 0; k <= maxKPrime; k++) {
                kPrimeLookupTable.push(findBoundaryIndex(sortedBoundaries, k));
            }
        }

        let totalResult = baseAccumulator;

        // Sort items to replicate original processing order: category 1 then category 2, then by targetKPrime
        variableGainItems.sort((itemA, itemB) => {
            if (itemA.category !== itemB.category) {
                return itemA.category - itemB.category;
            }
            return itemA.targetKPrime - itemB.targetKPrime;
        });

        for (const item of variableGainItems) {
            let currentSegmentIdx = kPrimeLookupTable[item.targetKPrime];
            
            // Search for an available slot by moving to earlier segments
            while (currentSegmentIdx >= 0) {
                const boundaryK = sortedBoundaries[currentSegmentIdx];
                const segment = segmentCapacities.get(boundaryK);
                
                if (segment.used < segment.total) {
                    segment.used++;
                    totalResult += item.potentialGain;
                    break;
                }
                currentSegmentIdx--;
            }
        }

        console.log(totalResult);

        currentLineIndex += N + 1;
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
