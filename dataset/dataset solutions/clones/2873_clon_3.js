let enableTracing = false;

/**
 * Provides verbose debugging output to the console when tracing is active.
 * Each argument is formatted and joined by a pipe symbol for readability.
 * @param {...any} debugMessages - Items to be logged for debugging.
 */
function outputDebugInfo(...debugMessages) {
  if (enableTracing) {
    const formattedSegments = debugMessages.map(item => {
      if (typeof item === 'string') return `'${item}'`; // Enclose strings in quotes
      if (item === null) return 'null';
      if (item === undefined) return 'undefined';
      return String(item);
    });
    console.log(`[DEBUG_TRACE] ${formattedSegments.join(' | ')}`);
  }
}

/**
 * Analyzes specific path conditions based on input parameters to determine
 * if a certain game scenario is possible.
 * @param {string} rawScenarioData - The complete input string from stdin.
 */
function AnalyzePathConditions(rawScenarioData) {
  // Split the raw input into an array of individual lines.
  const inputLineArray = rawScenarioData.split("\n");

  // Validate the minimum number of expected input lines.
  if (inputLineArray.length < 2) {
    console.error("Input Error: Not enough data lines provided. Expected at least 2.");
    return; // Terminate execution for invalid input structure.
  }

  // Parse the first line which contains configuration tokens.
  const configurationTokens = inputLineArray[0].split(" ");

  // Ensure all required numerical parameters are present.
  if (configurationTokens.length < 5) {
    console.error("Input Error: Missing configuration parameters on the first line.");
    return; // Terminate execution for insufficient parameters.
  }

  // Extract and convert string tokens to numerical values.
  const totalTrackLength = parseInt(configurationTokens[0], 10); // N
  const initialPositionA = Number(configurationTokens[1]);        // A
  const initialPositionB = Number(configurationTokens[2]);        // B
  const destinationPointC = Number(configurationTokens[3]);       // C
  const destinationPointD = Number(configurationTokens[4]);       // D

  // The second line provides the layout of the track.
  let currentTrackLayout = inputLineArray[1]; // Using 'let' as this string might be conceptually modified.

  // Log all parsed initial parameters for tracing.
  outputDebugInfo(totalTrackLength, initialPositionA, initialPositionB, destinationPointC, destinationPointD, currentTrackLayout);

  // Initialize the primary boolean flag indicating scenario feasibility.
  let isScenarioFeasible = true;

  // --- Conditional Logic Block: Special handling if destination C is beyond destination D ---
  const isDestinationCFurther = (destinationPointC > destinationPointD);
  if (isDestinationCFurther) {
    outputDebugInfo("Path Rule: Destination C is numerically greater than Destination D. Applying specific movement constraint.");

    let effectiveBoundaryForCheck = destinationPointD; // Default boundary for substring check.
    const distanceBetweenCD = destinationPointC - destinationPointD;

    // If the distance between C and D is small (<= 3 units), adjust the boundary.
    if (distanceBetweenCD <= 3) {
      effectiveBoundaryForCheck = destinationPointC;
      outputDebugInfo("Boundary Adjustment: C and D are close; effective boundary shifted to C:", effectiveBoundaryForCheck);
    }

    // Convert the track layout string into a mutable character array for potential modifications.
    let mutablePathChars = Array.from(currentTrackLayout);

    // Check a specific point (D-2 index) on the track.
    const indexD_minus_2 = destinationPointD - 2;
    // Add a boundary check to prevent out-of-bounds access.
    const isD_minus_2_Valid = indexD_minus_2 >= 0 && indexD_minus_2 < mutablePathChars.length;

    if (isD_minus_2_Valid && mutablePathChars[indexD_minus_2] === '#') {
      outputDebugInfo(`Specific Condition Met: Track segment at index ${indexD_minus_2} (D-2) is '#'.`);

      // If the condition is met, explicitly set the character at D-1 to '#'.
      // This replicates the original code's behavior: `s2[D-1] = '#'` followed by `s2 = s2.slice(0, D - 1) + '#' + s2.slice(D)`.
      const indexD_minus_1 = destinationPointD - 1;
      const isD_minus_1_Valid = indexD_minus_1 >= 0 && indexD_minus_1 < mutablePathChars.length;

      if (isD_minus_1_Valid) {
        mutablePathChars[indexD_minus_1] = '#';
        outputDebugInfo(`Action: Character at index ${indexD_minus_1} (D-1) forcibly set to '#'.`);
      } else {
        outputDebugInfo(`Warning: Index D-1 (${indexD_minus_1}) is out of bounds for modification. Operation skipped.`);
      }
    } else if (!isD_minus_2_Valid) {
      outputDebugInfo(`Warning: Index D-2 (${indexD_minus_2}) is out of bounds for checking. Condition skipped.`);
    }

    // Reconstruct the potentially modified path string for further checks.
    const modifiedPathRepresentation = mutablePathChars.join('');
    outputDebugInfo("Path State After Potential Modification:", modifiedPathRepresentation);

    // Extract a sub-segment from initialPositionB to the effective boundary.
    // Adjusting for 0-based indexing for slice: (B-1) to (effectiveBoundaryForCheck).
    const segmentForTripleDotCheck = modifiedPathRepresentation.slice(initialPositionB - 1, effectiveBoundaryForCheck);
    outputDebugInfo("Substring for '...' check:", segmentForTripleDotCheck);

    // Check if this segment contains three consecutive dots '...'.
    isScenarioFeasible = isScenarioFeasible && (/\.{3}/).test(segmentForTripleDotCheck);
    outputDebugInfo("Feasibility after '...' pattern check:", isScenarioFeasible);
  }

  // --- General Path Checks: Ensure no double '#' obstacles ---

  // Check the path segment from initialPositionA to destinationPointC.
  // Slice from (A-1) to (C) (exclusive of C).
  const segmentFromAToC = currentTrackLayout.slice(initialPositionA - 1, destinationPointC);
  outputDebugInfo("Segment from A to C for '##' check:", segmentFromAToC);
  // Ensure this segment does NOT contain "##" (two consecutive hash marks).
  isScenarioFeasible = isScenarioFeasible && !(/#{2}/).test(segmentFromAToC);
  outputDebugInfo("Feasibility after A-C '##' obstacle check:", isScenarioFeasible);

  // Check the path segment from initialPositionB to destinationPointD.
  // Slice from (B-1) to (D) (exclusive of D).
  const segmentFromBToD = currentTrackLayout.slice(initialPositionB - 1, destinationPointD);
  outputDebugInfo("Segment from B to D for '##' check:", segmentFromBToD);
  // Ensure this segment does NOT contain "##".
  isScenarioFeasible = isScenarioFeasible && !(/#{2}/).test(segmentFromBToD);
  outputDebugInfo("Feasibility after B-D '##' obstacle check:", isScenarioFeasible);

  // --- Final Decision ---
  // Determine the final output message based on the feasibility flag.
  const finalOutcomeMessage = isScenarioFeasible ? 'Yes' : 'No';
  console.log(finalOutcomeMessage);
}

// Standard input reading boilerplate for competitive programming environments.
// Passes the entire content of stdin to the main analysis function.
AnalyzePathConditions(require("fs").readFileSync("/dev/stdin", "utf8"));