function ComputeEnclosingCircleRadius(problemInputData) {
    // Validate the input data to ensure it's a non-empty string.
    if (typeof problemInputData !== 'string' || problemInputData.trim() === '') {
        console.error("Input data is invalid or empty. Cannot proceed with computation.");
        return 0.0;
    }

    // Split the entire input string into individual lines for processing.
    const dataLines = problemInputData.split("\n");

    // Attempt to parse the first line, which should contain the total number of points.
    let numberOfPoints;
    try {
        numberOfPoints = parseInt(dataLines[0], 10);
        // Ensure the parsed number is a valid positive integer.
        if (isNaN(numberOfPoints) || numberOfPoints < 0) {
            console.error("Invalid point count specified. Expected a non-negative integer.");
            return 0.0;
        }
    } catch (parseErr) {
        console.error("Failed to parse the number of points from input:", parseErr);
        return 0.0;
    }

    // Extract coordinate data from the subsequent lines.
    // We take 'numberOfPoints' lines starting from the second line (index 1).
    const coordinateDataStrings = dataLines.slice(1, numberOfPoints + 1);

    // Convert string representations of coordinates into an array of [x, y] number pairs.
    // Malformed lines or non-numeric coordinates will be filtered out.
    const pointCoordinates = coordinateDataStrings.map(lineStr => {
        const coords = lineStr.split(" ").map(Number); // Convert to numbers directly
        // Validate that we have exactly two numeric coordinates.
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            return coords; // Valid point [x, y]
        }
        console.warn(`Skipping malformed coordinate line: '${lineStr}'`);
        return null; // Mark as invalid
    }).filter(p => p !== null); // Remove all null entries (invalid points).

    // Adjust the `numberOfPoints` if some input lines were malformed.
    if (pointCoordinates.length !== numberOfPoints) {
        console.warn(`Initial point count was ${numberOfPoints}, but only ${pointCoordinates.length} valid points were found.`);
        numberOfPoints = pointCoordinates.length;
    }

    let resultRadius = 0.0; // Variable to store the computed minimum enclosing circle's radius.
    const numericalTolerance = 1e-6; // A small epsilon for floating-point comparisons.

    // Helper function to calculate the squared Euclidean distance between two points.
    const computeSquaredDistance = (pA, pB) => {
        const deltaX = pA[0] - pB[0];
        const deltaY = pA[1] - pB[1];
        return (deltaX * deltaX) + (deltaY * deltaY);
    };

    // Helper function to verify if all points are contained within a candidate circle.
    const verifyAllPointsEnclosed = (allPointsArray, circleCenter, circleRadiusSquared) => {
        for (let ptIdx = 0; ptIdx < allPointsArray.length; ptIdx++) {
            const currentPoint = allPointsArray[ptIdx];
            const distSqFromCenter = computeSquaredDistance(currentPoint, circleCenter);
            // If any point is outside the circle (considering tolerance), the circle is not valid.
            if (distSqFromCenter > circleRadiusSquared + numericalTolerance) {
                return false;
            }
        }
        return true;
    };

    // Handle edge cases for very few points.
    if (numberOfPoints === 0) {
        resultRadius = 0.0; // No points, radius is zero.
    } else if (numberOfPoints === 1) {
        resultRadius = 0.0; // One point, radius is zero (the point itself is the circle).
    } else if (numberOfPoints === 2) {
        // For two points, the minimum enclosing circle has these points as its diameter.
        const pointOne = pointCoordinates[0];
        const pointTwo = pointCoordinates[1];
        const diameterSquared = computeSquaredDistance(pointOne, pointTwo);
        const radiusSquared = diameterSquared / 4.0; // r^2 = (d/2)^2 = d^2 / 4
        resultRadius = Math.sqrt(radiusSquared);
    } else {
        // General case for three or more points.
        // The original code finds *a* valid enclosing circle and stops.
        // This behavior is preserved for Type III cloning.
        let solutionFoundAndSet = false;

        // Iterate through all unique combinations of three points (i, j, k).
        for (let idxA = 0; idxA < numberOfPoints; idxA++) {
            for (let idxB = idxA + 1; idxB < numberOfPoints; idxB++) {
                for (let idxC = idxB + 1; idxC < numberOfPoints; idxC++) {
                    const p1 = pointCoordinates[idxA];
                    const p2 = pointCoordinates[idxB];
                    const p3 = pointCoordinates[idxC];

                    // Calculate squared lengths of the sides of the triangle formed by p1, p2, p3.
                    // Store them along with an index to identify the corresponding edge.
                    const triangleSideInfo = [
                        { lengthSq: computeSquaredDistance(p1, p2), edgeId: 0 }, // Edge P1-P2
                        { lengthSq: computeSquaredDistance(p1, p3), edgeId: 1 }, // Edge P1-P3
                        { lengthSq: computeSquaredDistance(p2, p3), edgeId: 2 }  // Edge P2-P3
                    ];

                    // Sort the sides by their squared lengths in descending order.
                    triangleSideInfo.sort((s_a, s_b) => s_b.lengthSq - s_a.lengthSq);

                    let candidateCircleCenterX, candidateCircleCenterY, candidateCircleRadiusSquared;

                    // Check if the triangle is obtuse or right-angled.
                    // If the square of the longest side is greater than the sum of the squares of the other two sides (Pythagorean inequality),
                    // then the minimum enclosing circle's diameter is the longest side of this triangle.
                    if (triangleSideInfo[0].lengthSq > triangleSideInfo[1].lengthSq + triangleSideInfo[2].lengthSq + numericalTolerance) {
                        // The longest side determines the diameter. Identify its endpoints.
                        let diamPoint1, diamPoint2;
                        switch (triangleSideInfo[0].edgeId) {
                            case 0: diamPoint1 = p1; diamPoint2 = p2; break;
                            case 1: diamPoint1 = p1; diamPoint2 = p3; break;
                            case 2: diamPoint1 = p2; diamPoint2 = p3; break;
                        }
                        // Center is the midpoint of the diameter. Radius is half the diameter.
                        candidateCircleCenterX = (diamPoint1[0] + diamPoint2[0]) / 2.0;
                        candidateCircleCenterY = (diamPoint1[1] + diamPoint2[1]) / 2.0;
                        candidateCircleRadiusSquared = computeSquaredDistance(diamPoint1, [candidateCircleCenterX, candidateCircleCenterY]);
                    } else {
                        // The triangle is acute or right-angled (not obtuse).
                        // The circumcircle of the three points is the candidate minimum enclosing circle.
                        // Calculate the circumcenter (cx, cy) and circumradius.

                        // Denominator for the circumcenter formula (2 * (Ax(By - Cy) + Bx(Cy - Ay) + Cx(Ay - By)))
                        const determinant = 2 * (p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]));

                        // Check for collinear points or numerical instability (determinant close to zero).
                        // If points are collinear, the circumcircle is undefined or infinitely large.
                        // In this case, the MEC for these three points is defined by the two outermost points.
                        if (Math.abs(determinant) < numericalTolerance) {
                            // Points are effectively collinear. Use the longest segment among them as diameter.
                            let outermostP1, outermostP2;
                            switch (triangleSideInfo[0].edgeId) {
                                case 0: outermostP1 = p1; outermostP2 = p2; break;
                                case 1: outermostP1 = p1; outermostP2 = p3; break;
                                case 2: outermostP1 = p2; outermostP2 = p3; break;
                            }
                            candidateCircleCenterX = (outermostP1[0] + outermostP2[0]) / 2.0;
                            candidateCircleCenterY = (outermostP1[1] + outermostP2[1]) / 2.0;
                            candidateCircleRadiusSquared = computeSquaredDistance(outermostP1, [candidateCircleCenterX, candidateCircleCenterY]);
                        } else {
                            // Calculate terms involving squared magnitudes of points from origin.
                            const p1_magSq = computeSquaredDistance([0, 0], p1);
                            const p2_magSq = computeSquaredDistance([0, 0], p2);
                            const p3_magSq = computeSquaredDistance([0, 0], p3);

                            // Circumcenter coordinates calculation.
                            candidateCircleCenterX = (p1_magSq * (p2[1] - p3[1]) + p2_magSq * (p3[1] - p1[1]) + p3_magSq * (p1[1] - p2[1])) / determinant;
                            candidateCircleCenterY = (p1_magSq * (p3[0] - p2[0]) + p2_magSq * (p1[0] - p3[0]) + p3_magSq * (p2[0] - p1[0])) / determinant;
                            candidateCircleRadiusSquared = computeSquaredDistance(p1, [candidateCircleCenterX, candidateCircleCenterY]);
                        }
                    }

                    // After determining a candidate circle based on three points (or two if obtuse/collinear),
                    // check if this circle actually encloses *all* points in the original input set.
                    if (verifyAllPointsEnclosed(pointCoordinates, [candidateCircleCenterX, candidateCircleCenterY], candidateCircleRadiusSquared)) {
                        resultRadius = Math.sqrt(candidateCircleRadiusSquared);
                        solutionFoundAndSet = true;
                        break; // Exit the innermost loop (k).
                    }
                }
                if (solutionFoundAndSet) {
                    break; // Exit the middle loop (j).
                }
            }
            if (solutionFoundAndSet) {
                break; // Exit the outermost loop (i).
            }
        }
    }

    // Output the calculated radius to the console, formatted for precision.
    console.log(resultRadius.toFixed(10));
    return resultRadius;
}

// --- Debugging and Local Testing Utility ---

// This auxiliary function facilitates testing by mimicking a front-end environment
// where input and output elements might exist.
function evaluateTestScenario(scenarioIdentifier) {
    // Mock DOM elements for environments without a real document object (e.g., Node.js).
    // In a browser, `document.getElementById` would be used.
    const mockDomElements = {
        "input1": { value: "3\n0 0\n1 0\n0 1" }, // Example: Right triangle
        "output1": { value: "0.7071067812" },
        "input2": { value: "2\n-1 -1\n1 1" }, // Example: Two points
        "output2": { value: "1.4142135624" },
        "input3": { value: "4\n0 0\n10 0\n0 10\n1 1" }, // Example: Four points, MEC by 3
        "output3": { value: "7.0710678119" },
        "input4": { value: "5\n0 0\n1 0\n2 0\n3 0\n4 0" }, // Example: Collinear points
        "output4": { value: "2.0000000000" },
    };

    const getElementValue = (id) => (typeof document !== 'undefined' && document.getElementById(id)) ? document.getElementById(id).value : (mockDomElements[id] ? mockDomElements[id].value : null);
    const setElementHtml = (id, htmlContent) => {
        if (typeof document !== 'undefined' && document.getElementById(id)) {
            document.getElementById(id).innerHTML = htmlContent;
        } else {
            // For Node.js, just log the mock update.
            console.log(`[Mock DOM Update] Element ID '${id}': ${htmlContent}`);
        }
    };

    const testInputString = getElementValue("input" + scenarioIdentifier);
    const expectedOutputString = getElementValue("output" + scenarioIdentifier);

    if (!testInputString || !expectedOutputString) {
        console.error(`Test scenario '${scenarioIdentifier}' is missing input or expected output.`);
        setElementHtml("result" + scenarioIdentifier, "ERROR: Missing Data");
        return;
    }

    // Execute the main algorithm with the test input.
    const actualComputedResult = ComputeEnclosingCircleRadius(testInputString);

    // Compare the computed result with the expected output, allowing for floating point precision.
    const expectedNumericResult = parseFloat(expectedOutputString.split("\n")[0]);
    const comparisonEpsilon = 1e-9; // A tighter tolerance for comparison.

    let testOutcome = "WA"; // Default to Wrong Answer.
    if (Math.abs(actualComputedResult - expectedNumericResult) < comparisonEpsilon) {
        testOutcome = "AC"; // Accepted if within tolerance.
    }

    // Update the UI (or mock UI) with the test outcome.
    setElementHtml("result" + scenarioIdentifier, testOutcome);
    console.log(`Test Scenario ${scenarioIdentifier} Result: ${testOutcome}`);
}

// Entry point for the script when executed in a Node.js environment (e.g., via `node script.js`).
// This block reads input from standard input, typically a file redirected to /dev/stdin.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        const fileSystem = require("fs");
        const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        ComputeEnclosingCircleRadius(stdInputContent);
    } catch (error) {
        console.error("Error reading from /dev/stdin:", error);
        // Optionally, run a default test case if stdin fails.
        // evaluateTestScenario(1);
    }
}