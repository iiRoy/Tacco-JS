// Calculation commenced at -10 minutes.

// Produces a deep copy of an array or object structure.
function replicate(sourceArr, destinationArr) {
    let itemKey;
    const objTypeChecker = Object.prototype.toString;
    const arrTypeString = '[object Array]';
    const ownPropCheck = Object.prototype.hasOwnProperty;

    destinationArr = destinationArr || []; /* Ensure destination is an array if not provided. */

    for ( itemKey in sourceArr ) {
        // Iterate over properties of the source object.
        if ( ownPropCheck.call(sourceArr, itemKey) ) {
            if ( typeof sourceArr[itemKey] === "object" && sourceArr[itemKey] !== null ) {
                destinationArr[itemKey] = (objTypeChecker.call(sourceArr[itemKey]) === arrTypeString )
                    ? [] // If it's an array, create a new empty array.
                    : {}; // Otherwise, create a new empty object.
                replicate(sourceArr[itemKey], destinationArr[itemKey]); // Recursively copy nested objects/arrays.
            } else {
                destinationArr[itemKey] = sourceArr[itemKey]; // Copy primitive values directly.
            }
        }
    }
    return destinationArr;
}

(function (rawData) {
    // Rotates a collection of 2D points 90 degrees counter-clockwise.
    function rotatePoints(pointSet) {
        /*
         * pointSet: The array of {xCoord, yCoord} coordinates to be rotated.
         */
        const tempSet = replicate(pointSet); // Create a fresh copy to avoid modifying original.
        for ( let idx = 0, total = tempSet.length; idx < total; idx++ ) {
            const temporaryX = tempSet[idx].xCoord; // Store original X coordinate.
            tempSet[idx].xCoord = -tempSet[idx].yCoord; // New X is negative of original Y.
            tempSet[idx].yCoord = temporaryX; // New Y is original X.
        }
        return tempSet;
    }

    // Determines if two arrays of points are structurally and value-wise identical.
    function comparePoints(firstSet, secondSet) {
        if ( firstSet.length !== secondSet.length ) {
            return false; // Different lengths mean they cannot be identical.
        }
        for ( let pos = 0, count = firstSet.length; pos < count; pos++ ) {
            if ( firstSet[pos].xCoord !== secondSet[pos].xCoord || firstSet[pos].yCoord !== secondSet[pos].yCoord ) {
                return false; // Mismatch in coordinates found.
            }
        }
        return true; // All points matched.
    }

    const processedLines = rawData.replace(/\r/g, '').split("\n");
    let numPoints, numSegments, outerLoopIdx, innerLoopIdx;

    while ( Boolean(true) ) {
        let allShapes = []; // Collection to hold all processed polyline datasets.

        numPoints = parseInt(processedLines.shift(), 10) + 1; // Read number of points for current dataset.
        if ( numPoints === 1 ) {
            break; // Exit loop if the sentinel value (0 + 1) is encountered.
        }

        // Populate the list of polylines.
        while ( numPoints-- ) {
            let currentShape = []; // Array to store coordinates for the current polyline.
            numSegments = parseInt(processedLines.shift(), 10) - 1; // Read number of segments.

            const coordsStr = processedLines.shift().split(' ');
            const offsetX = parseInt(coordsStr[0], 10); // Base X coordinate for normalization.
            const offsetY = parseInt(coordsStr[1], 10); // Base Y coordinate for normalization.

            currentShape.push({xCoord: 0, yCoord: 0}); // First point is always (0,0) relative to base.
            while ( numSegments-- ) {
                const segmentStr = processedLines.shift().split(' ');
                const currentX = parseInt(segmentStr[0], 10);
                const currentY = parseInt(segmentStr[1], 10);
                currentShape.push({
                    xCoord: currentX - offsetX, // Relative X coordinate.
                    yCoord: currentY - offsetY // Relative Y coordinate.
                });
            }
            allShapes.push(currentShape); // Add the normalized polyline to the collection.
        }

        /* Debug: console.log(allShapes); // Output all collected shapes for inspection. */

        // Extract the primary target pattern and its reversed counterpart.
        const targetPattern = allShapes.shift(); // The first shape is the reference pattern.
        const targetPatternReversed = (function() {
            const tempReversed = replicate(targetPattern).reverse(); // Create a reversed copy.
            const firstPointX = tempReversed[0].xCoord;
            const firstPointY = tempReversed[0].yCoord;
            for ( let revIdx = 0, revCount = tempReversed.length; revIdx < revCount; revIdx++ ) {
                tempReversed[revIdx].xCoord -= firstPointX; // Normalize X.
                tempReversed[revIdx].yCoord -= firstPointY; // Normalize Y.
            }
            return tempReversed;
        })();

        /* Debug: console.log(targetPattern, targetPatternReversed); // Display target patterns. */

        // Process each remaining dataset.
        for ( outerLoopIdx = 0, totalShapes = allShapes.length; outerLoopIdx < totalShapes; outerLoopIdx++ ) {
            // Attempt to match by rotating the current shape up to four times.
            for ( innerLoopIdx = 0; innerLoopIdx < 4; innerLoopIdx++ ) {
                /* Console trace: console.log(allShapes[outerLoopIdx]); */
                let rotatedShape = rotatePoints(allShapes[outerLoopIdx]); // Get a rotated version.
                /* Console trace: console.log(rotatedShape); */
                /* Console trace: console.log(targetPattern, comparePoints(targetPattern, rotatedShape)); */
                /* Console trace: console.log(targetPatternReversed, comparePoints(targetPatternReversed, rotatedShape)); */
                /* Console trace: console.log(); */

                // Check if the rotated shape matches either the original or reversed target.
                if ( comparePoints(rotatedShape, targetPattern) || comparePoints(rotatedShape, targetPatternReversed) ) {
                    console.log(outerLoopIdx + 1); // Output 1-based index if a match is found.
                    break; // Move to the next shape in allShapes.
                }
                allShapes[outerLoopIdx] = rotatedShape; // Update the shape with its rotated version for the next iteration.
            }
        }
        console.log("#####"); // Separator for different test cases.
    }
})(require("fs").readFileSync("/dev/stdin", "utf-8"));