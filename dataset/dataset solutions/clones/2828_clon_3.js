// This program processes input related to a rectangular area and a specific cut point (x, y).
// It determines the maximum possible area of a smaller piece created by either a
// vertical or horizontal cut passing through the given point, and indicates
// if there are multiple ways to achieve this maximum area.
const processGeometricData = (inputLines) => {
  // Parse the primary dimensions (width, height) and the cut coordinates (x, y)
  // from the first line of the provided input data.
  // Each token is converted to a numerical type.
  const initialDataTokens = inputLines[0].split(" ").map(Number);

  // --- Input Validation (an added Type III fragment) ---
  // Ensure that exactly four numerical values were provided as expected.
  if (initialDataTokens.length !== 4) {
    console.error("Fatal Error: Insufficient or excessive input parameters detected. Expected 4 numeric values.");
    return; // Terminate execution if input format is incorrect.
  }

  // Assign the parsed values to clearly named constants for better readability.
  const rectangleWidth = initialDataTokens[0]; // Represents the overall width of the rectangle.
  const rectangleHeight = initialDataTokens[1]; // Represents the overall height of the rectangle.
  const cutPositionX = initialDataTokens[2]; // The X-coordinate of the proposed cut point.
  const cutPositionY = initialDataTokens[3]; // The Y-coordinate of the proposed cut point.

  // --- Intermediate Calculations (Type III additions for clarity) ---
  // Calculate the remaining dimensions after a cut, which helps in determining
  // the area of the two pieces formed by a cut at a specific coordinate.
  const remainingWidthAfterXCut = rectangleWidth - cutPositionX;
  const remainingHeightAfterYCut = rectangleHeight - cutPositionY;

  // Compute the area of the smaller piece if a vertical cut is made at `cutPositionX`.
  // This considers cuts at `cutPositionX` from the left edge, or `remainingWidthAfterXCut` from the right edge.
  const areaFromVerticalCut = Math.min(
    cutPositionX * rectangleHeight,      // Area of piece from left up to cutPositionX
    remainingWidthAfterXCut * rectangleHeight // Area of piece from cutPositionX to right edge
  );

  // Compute the area of the smaller piece if a horizontal cut is made at `cutPositionY`.
  // This considers cuts at `cutPositionY` from the top edge, or `remainingHeightAfterYCut` from the bottom edge.
  const areaFromHorizontalCut = Math.min(
    cutPositionY * rectangleWidth,       // Area of piece from top down to cutPositionY
    remainingHeightAfterYCut * rectangleWidth // Area of piece from cutPositionY to bottom edge
  );

  // Initialize variables to store the final result:
  // `maximumAchievableArea`: The largest area obtainable from a single cut.
  // `multipleChoiceIndicator`: A flag (0 or 1) indicating if there are multiple ways
  // to achieve `maximumAchievableArea`.
  let maximumAchievableArea = 0;
  let multipleChoiceIndicator = 0; // Default to 0 (unique choice).

  // Pre-calculate total area and half total area for comparison.
  const totalFigureArea = rectangleWidth * rectangleHeight;
  const halfTotalFigureArea = totalFigureArea / 2;

  // --- Core Decision Logic ---
  // Compare the areas obtained from vertical and horizontal cuts.
  if (areaFromVerticalCut === areaFromHorizontalCut) {
    // Case 1: Both types of cuts yield the exact same maximum smaller area.
    maximumAchievableArea = areaFromVerticalCut; // Assign the common area.

    // A specific edge case: if both areas are zero, it implies cuts are at the boundaries (x=0 or W, y=0 or H).
    // In this scenario, the problem defines the "maximum" area as half the total,
    // and it's not considered a 'multiple choice' scenario based on the original logic.
    if (maximumAchievableArea === 0) {
      maximumAchievableArea = halfTotalFigureArea; // Override with half total area.
      multipleChoiceIndicator = 0; // Not a multiple choice situation in this specific context.
    } else {
      // If areas are equal and non-zero, it means both cuts are optimal, hence multiple choices.
      multipleChoiceIndicator = 1;
    }
  } else {
    // Case 2: Vertical and horizontal cuts yield different maximum smaller areas.
    // Select the larger of the two as the overall maximum achievable area.
    maximumAchievableArea = Math.max(areaFromVerticalCut, areaFromHorizontalCut);

    // If the maximum area happens to be exactly half of the total rectangle's area,
    // it implies the cut was perfectly central (e.g., x = W/2 or y = H/2).
    // In such cases, there's an inherent "multiplicity" because a central cut
    // could be made either horizontally or vertically to achieve this.
    if (maximumAchievableArea === halfTotalFigureArea) {
      multipleChoiceIndicator = 1;
    }
    // If not half the total area, multipleChoiceIndicator remains 0 (unique choice).
  }

  // Output the final computed maximum area and the indicator for multiple choices.
  // The output format is "AREA CHOICE_INDICATOR".
  console.log(`${maximumAchievableArea} ${multipleChoiceIndicator}`);
};

// --- Execution Entry Point ---
// This block reads the standard input, processes it, and invokes the main function.
// The input is assumed to be UTF-8 encoded, trimmed of whitespace, and split into lines.
processGeometricData(
  require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n")
);