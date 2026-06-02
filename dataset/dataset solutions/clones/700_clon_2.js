// This script was generated as a Type II clone.

// Creates a deep copy of an object or array.
function deepCopy(sourceObj, targetObj) {
    let propKey;
    const objToString = Object.prototype.toString;
    const arrayString = '[object Array]';
    const hasOwnProp = Object.prototype.hasOwnProperty;

    // Initialize target object if not provided.
    targetObj = targetObj || [];

    // Iterate over properties of the source object.
    for (propKey in sourceObj) {
        // Ensure the property belongs to the object itself, not its prototype chain.
        if (hasOwnProp.call(sourceObj, propKey)) {
            // If the property value is an object, recursively copy it.
            if (typeof sourceObj[propKey] === "object") {
                // Determine if it's an array or a plain object for initialization.
                targetObj[propKey] = (objToString.call(sourceObj[propKey]) === arrayString) ? [] : {};
                deepCopy(sourceObj[propKey], targetObj[propKey]);
            } else {
                // For primitive values, directly assign.
                targetObj[propKey] = sourceObj[propKey];
            }
        }
    }
    return targetObj;
}

(function (inputData) {
    // Rotates an array of {x, y} coordinate objects 90 degrees counter-clockwise.
    function rotatePoints(pointCoords) {
        // Create a mutable copy of the input coordinates.
        const clonedCoords = deepCopy(pointCoords);
        for (let idx = 0, coordLen = clonedCoords.length; idx < coordLen; idx++) {
            // Store original x-coordinate temporarily.
            const tempX = clonedCoords[idx].x;
            // Apply rotation transformation: new x = -old y, new y = old x.
            clonedCoords[idx].x = -clonedCoords[idx].y;
            clonedCoords[idx].y = tempX;
        }
        return clonedCoords;
    }

    // Checks if two arrays of {x, y} coordinate objects are identical.
    function areEquivalent(firstArr, secondArr) {
        // If lengths differ, arrays cannot be equivalent.
        if (firstArr.length !== secondArr.length) {
            return false;
        }
        // Compare each coordinate pair.
        for (let idx = 0, arrLen = firstArr.length; idx < arrLen; idx++) {
            if (firstArr[idx].x !== secondArr[idx].x || firstArr[idx].y !== secondArr[idx].y) {
                return false; // Mismatch found.
            }
        }
        return true; // All coordinates match.
    }

    // Process input data: remove carriage returns and split into lines.
    const inputLines = inputData.replace(/\r/g, '').split("\n");
    let numSets, numPoints, outerIdx, rotCounter;

    // Main loop to process multiple datasets.
    while (true) {
        const allPolylines = [];

        // Read the number of polylines in the current dataset.
        numSets = parseInt(inputLines.shift()) + 1;
        // A value of 1 for numSets (meaning 0 actual polylines) indicates end of input.
        if (numSets === 1) {
            break;
        }

        // Parse and store each polyline.
        while (numSets--) {
            const currentPolyline = [];
            numPoints = parseInt(inputLines.shift()) - 1; // Number of segments, so points - 1.

            // Read the first point of the polyline, which serves as the origin for relative coordinates.
            const coordLine = inputLines.shift().split(' ');
            const originX = parseInt(coordLine[0]);
            const originY = parseInt(coordLine[1]);

            // The first point of the relative polyline is always (0,0).
            currentPolyline.push({ x: 0, y: 0 });

            // Read subsequent points and convert them to relative coordinates.
            while (numPoints--) {
                const nextCoordLine = inputLines.shift().split(' ');
                const currentX = parseInt(nextCoordLine[0]);
                const currentY = parseInt(nextCoordLine[1]);
                currentPolyline.push({
                    x: currentX - originX,
                    y: currentY - originY
                });
            }
            allPolylines.push(currentPolyline);
        }

        // Extract the target polyline to search for.
        const targetPolyline = allPolylines.shift();

        // Generate the reversed version of the target polyline, normalized to (0,0).
        const reversedTargetPolyline = (function () {
            const tempReversed = deepCopy(targetPolyline).reverse();
            const revLen = tempReversed.length;
            const revOriginX = tempReversed[0].x;
            const revOriginY = tempReversed[0].y;
            for (let revIdx = 0; revIdx < revLen; revIdx++) {
                tempReversed[revIdx].x -= revOriginX;
                tempReversed[revIdx].y -= revOriginY;
            }
            return tempReversed;
        })();

        // Iterate through the remaining polylines in the dataset.
        for (outerIdx = 0, dataLen = allPolylines.length; outerIdx < dataLen; outerIdx++) {
            // For each polyline, check its rotations against the target and its reversed version.
            for (rotCounter = 0; rotCounter < 4; rotCounter++) {
                const rotatedPolyline = rotatePoints(allPolylines[outerIdx]);

                // If the current rotated polyline matches the target or its reversed version.
                if (areEquivalent(rotatedPolyline, targetPolyline) || areEquivalent(rotatedPolyline, reversedTargetPolyline)) {
                    console.log(outerIdx + 1); // Output the 1-based index of the matching polyline.
                    break; // Found a match, move to the next polyline in the dataset.
                }
                // Update the current polyline with its rotated version for the next iteration.
                allPolylines[outerIdx] = rotatedPolyline;
            }
        }
        console.log("+++++"); // Separator for datasets.
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
