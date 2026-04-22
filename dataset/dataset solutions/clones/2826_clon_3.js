/**
 * This JavaScript module processes input data representing a rectangle and a point within it.
 * Its primary function is to calculate specific area partitions derived from the point's coordinates
 * relative to the rectangle's dimensions and report a derived area along with a uniqueness indicator.
 */

/**
 * Orchestrates the primary logic for processing input and calculating area metrics.
 * It reads four space-separated numerical parameters: rectangle width (W), rectangle height (H),
 * and the X and Y coordinates (x, y) of a point. Based on the point's position, it computes
 * a maximum partition area and a count of ways to achieve it, then outputs a complementary area
 * and the count.
 *
 * @param {string} rawInputString - A space-separated string containing:
 *                                  1. Rectangle width (W)
 *                                  2. Rectangle height (H)
 *                                  3. Point X-coordinate (x)
 *                                  4. Point Y-coordinate (y)
 */
function processInputData(rawInputString) {
    // --- Input Parsing and Initial Validation ---

    // Clean and split the incoming string of numerical parameters by any whitespace.
    const parameterStrings = rawInputString.trim().split(/\s+/);

    // Guard clause: Ensure exactly four parameters are provided to avoid unexpected errors.
    if (parameterStrings.length !== 4) {
        console.error("Input error: Expected exactly 4 space-separated numeric parameters (W H x y).");
        return; // Exit function if input format is incorrect.
    }

    // Convert string parts to floating-point numeric values for rectangle dimensions and point coordinates.
    const rectangleWidth = parseFloat(parameterStrings[0]);
    const rectangleHeight = parseFloat(parameterStrings[1]);
    const coordinateX = parseFloat(parameterStrings[2]);
    const coordinateY = parseFloat(parameterStrings[3]);

    // Comprehensive validation for numerical integrity and bounds (new fragment for robustness).
    // Checks for NaN, non-positive dimensions, and ensures the point is within the rectangle boundaries.
    if (isNaN(rectangleWidth) || isNaN(rectangleHeight) || isNaN(coordinateX) || isNaN(coordinateY) ||
        rectangleWidth <= 0 || rectangleHeight <= 0 ||
        coordinateX < 0 || coordinateX > rectangleWidth ||
        coordinateY < 0 || coordinateY > rectangleHeight) {
        console.error("Error: Invalid or out-of-bounds dimensions/coordinates provided.");
        return; // Exit if any parameter is invalid.
    }

    // Initialize variables to store computational results.
    let maxCalculatedArea = 0.0; // Stores the largest area found when partitioning the rectangle.
    let waysToAchieveMax = 0;    // Counts how many distinct geometric configurations yield 'maxCalculatedArea'.

    // --- Core Logic: Determine Area Partition based on Point Location ---

    // Condition A: The point (coordinateX, coordinateY) is precisely at the geometric center of the rectangle.
    // Using multiplication (X*2 === W) instead of division (X === W/2) to minimize potential floating-point precision issues
    // when checking for exact equality.
    const isCentralXAxis = (coordinateX * 2 === rectangleWidth);
    const isCentralYAxis = (coordinateY * 2 === rectangleHeight);

    if (isCentralXAxis && isCentralYAxis) {
        // If the point is at the center, the maximum split area is exactly half the total rectangle area.
        maxCalculatedArea = (rectangleWidth * rectangleHeight) / 2.0;
        waysToAchieveMax = 1; // There's a unique way (any straight line through the center) to achieve this split.
    }
    // Condition B: The point is on an edge (x=W or y=H) or on a center line (x=W/2 or y=H/2),
    // but not the exact center point (already handled by Condition A).
    // This implies a split that often results in half the total area, but not necessarily a unique configuration.
    else if (coordinateX === rectangleWidth || coordinateY === rectangleHeight || isCentralXAxis || isCentralYAxis) {
        maxCalculatedArea = (rectangleWidth * rectangleHeight) / 2.0;
        // 'waysToAchieveMax' remains 0 in this scenario, indicating multiple ways or non-unique splits for the max area.
    }
    // Condition C: The point satisfies specific diagonal or quadratic relationships.
    // A guard `coordinateY !== 0` is added to prevent division by zero in the original expressions.
    else if (coordinateY !== 0 && (
        // Condition C1: The point lies on the main diagonal from (0,0) to (W,H).
        // `coordinateX / coordinateY === rectangleWidth / rectangleHeight` is rewritten as
        // `coordinateX * rectangleHeight === coordinateY * rectangleWidth` to avoid division and floating-point errors.
        (coordinateX * rectangleHeight === coordinateY * rectangleWidth) ||
        // Condition C2: The point satisfies a specific quadratic relationship (x^2 + y^2 = H*y).
        // The original `((x/y) * x + y) === H` is expanded by multiplying by `y` (assuming `y !== 0`).
        (Math.pow(coordinateX, 2) + Math.pow(coordinateY, 2) === rectangleHeight * coordinateY)
    )) {
        maxCalculatedArea = (rectangleWidth * rectangleHeight) / 2.0;
        waysToAchieveMax = 1; // This scenario also indicates a unique split for the max area.
    }
    // General Case: The point does not fall into any of the special conditions defined above.
    else {
        let derivedProportionalWidth = 0.0;  // Corresponds to 'minSquireX' in the original code.
        let derivedProportionalHeight = 0.0; // Corresponds to 'minSquireY' in the original code.
        let dynamicallyAdjustedArea = 0.0;   // Corresponds to 'minSquire' in the original code.

        // Calculate proportional dimensions, carefully guarding against division by zero.
        // If a coordinate is zero, the ratio becomes undefined or infinite.
        // Assigning `Infinity` ensures that the subsequent comparison (`< rectangleWidth/Height`) will logically fail,
        // mimicking the original behavior where `minSquire` would remain `0` if the conditions weren't met.
        if (coordinateX !== 0) {
            derivedProportionalWidth = (coordinateY / coordinateX) * rectangleHeight;
        } else {
            derivedProportionalWidth = Infinity;
        }
        if (coordinateY !== 0) {
            derivedProportionalHeight = (coordinateX / coordinateY) * rectangleWidth;
        } else {
            derivedProportionalHeight = Infinity;
        }

        // Determine the 'dynamicallyAdjustedArea' based on these proportional dimensions.
        // This calculation seems to define an area of a specific sub-rectangle.
        if (derivedProportionalWidth < rectangleWidth) {
            dynamicallyAdjustedArea = (coordinateX - derivedProportionalWidth) * (rectangleHeight - coordinateY);
        } else if (derivedProportionalHeight < rectangleHeight) {
            dynamicallyAdjustedArea = (rectangleWidth - coordinateX) * (coordinateY - derivedProportionalHeight);
        }
        // If neither `if` nor `else if` condition is met, `dynamicallyAdjustedArea` remains `0.0`,
        // which is consistent with the original logic.

        // Calculate the first primary area component by summing three derived sub-areas.
        const areaFromQuadrantBottomRightHalf = (rectangleWidth - coordinateX) * (rectangleHeight - coordinateY) / 2.0;
        const areaFromQuadrantTopLeft = coordinateX * coordinateY;
        const firstPartitionCandidate = areaFromQuadrantBottomRightHalf + areaFromQuadrantTopLeft + dynamicallyAdjustedArea;

        // The second primary area component is simply the total rectangle area minus the first component.
        const secondPartitionCandidate = (rectangleWidth * rectangleHeight) - firstPartitionCandidate;

        // For the general case, the maximum area is the larger of the two calculated partitions.
        maxCalculatedArea = Math.max(firstPartitionCandidate, secondPartitionCandidate);
        // 'waysToAchieveMax' remains 0 for this general scenario, indicating non-unique splits for the max area.
    }

    // --- Final Output Calculation ---

    // Compute the complementary area: total rectangle area minus the largest partition found.
    // This value represents the area of the smaller of the two partitions created by the split.
    const complementaryArea = (rectangleWidth * rectangleHeight) - maxCalculatedArea;

    // Output the computed complementary area and the count of unique ways to achieve the maximum partition.
    // Using `toFixed(10)` ensures consistent floating-point output precision, which is common in competitive programming.
    console.log(`${complementaryArea.toFixed(10)} ${waysToAchieveMax}`);
}

// --- Standard Input/Output Handling (DO NOT MODIFY) ---
// This section is standard boilerplate for reading input in a typical competitive programming environment.
// It reads the entire standard input, converts it to a UTF-8 string, and passes it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));