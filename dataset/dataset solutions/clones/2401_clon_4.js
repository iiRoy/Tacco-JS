function ExecutePathSolver(dataSource) {
    const linesOfInput = dataSource.split("\n");
    const [totalLength, maxLeap] = linesOfInput[0].split(" ").map(Number);
    const terrainFeatures = linesOfInput[1].split("");

    // --- Phase 1: Generate an initial sequence of movements using a generator ---
    // This replaces the first imperative while loop with a generator-based iteration.
    function* generateInitialMovements(startingPoint, maxDistance, totalSpan, mapData) {
        let currentPosition = startingPoint;
        while (currentPosition < totalSpan - 1) {
            let chosenStride = -1;
            for (let strideLength = 1; strideLength <= maxDistance; strideLength++) {
                const targetSpot = currentPosition + strideLength;
                if (targetSpot < totalSpan && mapData[targetSpot] === '0') {
                    chosenStride = strideLength;
                    break; // Found the shortest valid stride
                }
            }
            if (chosenStride === -1) {
                yield null; // Indicates an impassable route
                return;
            }
            yield chosenStride;
            currentPosition += chosenStride;
        }
    }

    let initialPathSegments = [];
    let pathIsViable = true;
    for (const segment of generateInitialMovements(0, maxLeap, totalLength, terrainFeatures)) {
        if (segment === null) {
            pathIsViable = false;
            break;
        }
        initialPathSegments.push(segment);
    }

    if (!pathIsViable) {
        console.log(-1);
        return;
    }

    // --- Phase 2: Refine the path segments by merging from right to left recursively ---
    // This replaces the second imperative while loop with a tail-recursive functional approach.
    // It uses a helper function that returns new arrays (via slice) to maintain immutability in recursion.

    // Helper to find a group of segments from the right that can be merged
    function buildMergedGroup(segmentList, maxCapacity) {
        if (segmentList.length === 0) {
            return { groupTotal: 0, remainingSegments: [] };
        }

        let currentSumForGroup = segmentList[segmentList.length - 1]; // Start with the rightmost element
        let checkIndex = segmentList.length - 2; // Pointer to the element before the rightmost

        while (checkIndex >= 0 && currentSumForGroup + segmentList[checkIndex] <= maxCapacity) {
            currentSumForGroup += segmentList[checkIndex];
            checkIndex--;
        }
        // `checkIndex` is now the index of the last element NOT included in the current group, or -1.
        return { groupTotal: currentSumForGroup, remainingSegments: segmentList.slice(0, checkIndex + 1) };
    }

    // Main recursive function to consolidate the path
    function consolidatePathRecursively(currentSegmentCollection, capacityLimit, finalConsolidatedPath) {
        if (currentSegmentCollection.length === 0) {
            return finalConsolidatedPath; // Base case: no more segments to process
        }

        const { groupTotal, remainingSegments } = buildMergedGroup(currentSegmentCollection, capacityLimit);
        
        // Prepend the new group to the accumulated path (maintains correct order)
        const updatedFinalPath = [groupTotal, ...finalConsolidatedPath];
        
        // Recursive call with the rest of the segments
        return consolidatePathRecursively(remainingSegments, capacityLimit, updatedFinalPath);
    }

    const finalOptimizedPath = consolidatePathRecursively(initialPathSegments, maxLeap, []);
    
    // Output the concatenated string of the optimized path segments
    console.log(finalOptimizedPath.join(""));
}

// Invoke the solver with input from stdin
ExecutePathSolver(require('fs').readFileSync('/dev/stdin','utf8'));