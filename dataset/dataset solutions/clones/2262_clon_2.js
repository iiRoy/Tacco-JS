function ProcessCoordinates(rawData) {
    // This part handles the initial parsing of the input string data.
    rawData = rawData.split("\n");

    // Retrieve the total count of data points from the first line.
    var numPoints = parseInt(rawData[0]);

    // Discard the first line as its information (numPoints) has been extracted.
    rawData.shift();

    // Trim the input array to only include the actual coordinate data, up to the specified number of points.
    rawData.splice(numPoints, rawData.length);

    // Transform the array of string lines into a nested array of integer coordinate pairs.
    var coordsArray = rawData.map(
        lineStr => lineStr.split(" ").map(
            valStr => parseInt(valStr)
        )
    );

    // Initialize the variable that will hold the computed smallest enclosing circle radius.
    var resultRadius = 0;

    // Special handling for the case where only two points are provided.
    if (coordsArray.length == 2) {
        // The smallest enclosing circle for two points has its center at their midpoint
        // and its radius is half the distance between them.
        var squaredDistance = Math.pow(coordsArray[0][0] - coordsArray[1][0], 2) + Math.pow(coordsArray[0][1] - coordsArray[1][1], 2);
        resultRadius = Math.sqrt(squaredDistance) / 2;
    }
    // General case for three or more points: iterate through all possible triplets.
    else {
        // Iterate through distinct combinations of three points (idxA, idxB, idxC) from the dataset.
        for (var idxA = 0; idxA < numPoints; idxA++) {
            for (var idxB = idxA + 1; idxB < numPoints; idxB++) {
                for (var idxC = idxB + 1; idxC < numPoints; idxC++) {
                    // An array to store the squared lengths of the triangle's sides,
                    // along with an identifier for which pair of points forms the side.
                    var tripletSides = [];

                    // Calculate squared Euclidean distances for each side of the triangle (pA, pB, pC).
                    tripletSides.push([
                        Math.pow(coordsArray[idxA][0] - coordsArray[idxB][0], 2) + Math.pow(coordsArray[idxA][1] - coordsArray[idxB][1], 2), // pA-pB
                        0
                    ]);
                    tripletSides.push([
                        Math.pow(coordsArray[idxA][0] - coordsArray[idxC][0], 2) + Math.pow(coordsArray[idxA][1] - coordsArray[idxC][1], 2), // pA-pC
                        1
                    ]);
                    tripletSides.push([
                        Math.pow(coordsArray[idxC][0] - coordsArray[idxB][0], 2) + Math.pow(coordsArray[idxC][1] - coordsArray[idxB][1], 2), // pC-pB
                        2
                    ]);

                    // Sort the sides in descending order based on their squared lengths.
                    tripletSides.sort(function(firstSide, secondSide) {
                        return secondSide[0] - firstSide[0];
                    });

                    var currentCenterX, currentCenterY;   // Candidate circle's center coordinates.
                    var currentRadSquared;                // Candidate circle's squared radius.

                    // Check if the triangle is obtuse or right-angled.
                    // If the longest side's squared length is greater than the sum of the other two squared lengths.
                    if (tripletSides[0][0] > tripletSides[1][0] + tripletSides[2][0]) {
                        // For obtuse/right triangles, the smallest enclosing circle is determined by the two points
                        // forming the longest side. Its center is the midpoint of that side.
                        if (tripletSides[0][1] == 0) { // Longest side is pA-pB
                            currentCenterX = (coordsArray[idxA][0] + coordsArray[idxB][0]) / 2;
                            currentCenterY = (coordsArray[idxA][1] + coordsArray[idxB][1]) / 2;
                            currentRadSquared = Math.pow(coordsArray[idxA][0] - currentCenterX, 2) + Math.pow(coordsArray[idxA][1] - currentCenterY, 2);
                        } else if (tripletSides[0][1] == 1) { // Longest side is pA-pC
                            currentCenterX = (coordsArray[idxA][0] + coordsArray[idxC][0]) / 2;
                            currentCenterY = (coordsArray[idxA][1] + coordsArray[idxC][1]) / 2;
                            currentRadSquared = Math.pow(coordsArray[idxA][0] - currentCenterX, 2) + Math.pow(coordsArray[idxA][1] - currentCenterY, 2);
                        } else { // Longest side is pB-pC
                            currentCenterX = (coordsArray[idxB][0] + coordsArray[idxC][0]) / 2;
                            currentCenterY = (coordsArray[idxB][1] + coordsArray[idxC][1]) / 2;
                            currentRadSquared = Math.pow(coordsArray[idxB][0] - currentCenterX, 2) + Math.pow(coordsArray[idxB][1] - currentCenterY, 2);
                        }
                    }
                    // If the triangle is acute, the smallest enclosing circle is its circumcircle.
                    else {
                        // Calculate the circumcenter (currentCenterX, currentCenterY) using algebraic formulas.
                        // These formulas are derived from the intersection of perpendicular bisectors.
                        currentCenterY = ((coordsArray[idxC][0] - coordsArray[idxA][0]) * (Math.pow(coordsArray[idxA][0], 2) + Math.pow(coordsArray[idxA][1], 2) - Math.pow(coordsArray[idxB][0], 2) - Math.pow(coordsArray[idxB][1], 2)) - (coordsArray[idxB][0] - coordsArray[idxA][0]) * (Math.pow(coordsArray[idxA][0], 2) + Math.pow(coordsArray[idxA][1], 2) - Math.pow(coordsArray[idxC][0], 2) - Math.pow(coordsArray[idxC][1], 2))) / (2 * (coordsArray[idxC][0] - coordsArray[idxA][0]) * (coordsArray[idxA][1] - coordsArray[idxB][1]) - 2 * (coordsArray[idxB][0] - coordsArray[idxA][0]) * (coordsArray[idxA][1] - coordsArray[idxC][1]));
                        if (coordsArray[idxA][0] != coordsArray[idxB][0]) {
                            currentCenterX = ((2 * coordsArray[idxA][1] - coordsArray[idxB][1]) * currentCenterY - Math.pow(coordsArray[idxA][0], 2) - Math.pow(coordsArray[idxA][1], 2) + Math.pow(coordsArray[idxB][0], 2) + Math.pow(coordsArray[idxB][1], 2)) / (2 * (coordsArray[idxB][0] - coordsArray[idxA][0]));
                        } else {
                            // Fallback if the line segment (idxA, idxB) is vertical; use (idxA, idxC) instead.
                            currentCenterX = ((2 * coordsArray[idxA][1] - coordsArray[idxC][1]) * currentCenterY - Math.pow(coordsArray[idxA][0], 2) - Math.pow(coordsArray[idxA][1], 2) + Math.pow(coordsArray[idxC][0], 2) + Math.pow(coordsArray[idxC][1], 2)) / (2 * (coordsArray[idxC][0] - coordsArray[idxA][0]));
                        }
                        // Calculate the squared radius from one of the points to the circumcenter.
                        currentRadSquared = Math.pow(coordsArray[idxA][0] - currentCenterX, 2) + Math.pow(coordsArray[idxA][1] - currentCenterY, 2);
                    }

                    // After determining a candidate circle (center and radius), verify if it encloses ALL N points.
                    var allInside = 0; // Flag: 0 means all points are inside/on, 1 means at least one point is outside.
                    for (var checkIdx = 0; checkIdx < numPoints; checkIdx++) {
                        // If any point is found to be outside the current candidate circle.
                        if (Math.pow(coordsArray[checkIdx][0] - currentCenterX, 2) + Math.pow(coordsArray[checkIdx][1] - currentCenterY, 2) > currentRadSquared) {
                            allInside = 1; // Set flag to indicate that this circle is not valid.
                            break;         // No need to check other points for this circle.
                        }
                    }

                    // If the current circle successfully encloses all N points.
                    if (allInside == 0) {
                        resultRadius = Math.sqrt(currentRadSquared); // This is the smallest enclosing circle's radius.
                        break; // Exit the innermost loop (idxC) as the answer is found for this combination.
                    }
                }
                // If the result has been found, break from the middle loop (idxB).
                if (resultRadius != 0) {
                    break;
                }
            }
            // If the result has been found, break from the outermost loop (idxA).
            if (resultRadius != 0) {
                break;
            }
        }
    }

    // Output the final calculated radius to the console.
    console.log('%s', resultRadius);
    return resultRadius; // Return the computed radius.
}

// A helper function for testing the solution in a web browser environment.
function testSolution(testNumber) {
    // Retrieve input data from a specific HTML element using its ID.
    var testInput = webPageDOM.getElementById("input" + testNumber).value;
    // Execute the main coordinate processing function with the test input.
    var actualResult = ProcessCoordinates(testInput);
    var comparisonResult = "WA"; // Default to "Wrong Answer".

    // Compare the actual computed result with the expected output from another HTML element.
    if (actualResult == webPageDOM.getElementById("output" + testNumber).value.split("\n")[0]) {
        comparisonResult = "AC"; // Mark as "Accepted" if results match.
    }
    // Display the comparison result in a designated HTML element.
    webPageDOM.getElementById("result" + testNumber).innerHTML = comparisonResult;
}

// Global reference for DOM manipulation, typically 'document' in a browser.
var webPageDOM = typeof document !== 'undefined' ? document : {};

// Entry point for execution, typically in a Node.js environment for competitive programming.
// Reads input from standard input (e.g., a file) and passes it to the main processing function.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));