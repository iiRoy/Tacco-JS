// This module processes raw input data to compute a specific value.
// The purpose is to count "active" items within a total limit,
// where active and inactive segments repeat in a cycle.
function ProcessInputData(sourceData) {
  // Input string is expected to contain three space-separated numerical values.
  // These represent the total limit, the length of an active segment,
  // and the length of an inactive segment, respectively.

  // First, sanitize and parse the input string into an array of numbers.
  // We trim whitespace and split by any sequence of whitespace characters.
  const parsedNumericalElements = sourceData.trim().split(/\s+/).map(Number);

  // --- Input Validation: Check for sufficient input elements ---
  // If fewer than three numbers are provided, it's an invalid input scenario.
  if (parsedNumericalElements.length < 3) {
    // Log an error message to stderr (or console.error) for diagnostic purposes.
    console.error("Critical Error: Insufficient numerical input. Expected 3 values (N, A, B).");
    // In such a case, the computation cannot proceed meaningfully.
    // Returning 0 is a common fallback for competitive programming scenarios.
    console.log(0);
    return;
  }

  // Destructure the parsed elements into clearly named variables.
  const [overallLimit, activeSegmentLength, inactiveSegmentLength] = parsedNumericalElements;

  // --- Input Validation: Check for invalid numerical ranges ---
  // Ensure that all primary input values are non-negative.
  // A negative limit or segment length would lead to illogical results.
  if (overallLimit < 0 || activeSegmentLength < 0 || inactiveSegmentLength < 0) {
    console.warn("Validation Warning: Negative input detected (overallLimit, activeSegmentLength, or inactiveSegmentLength). Computation might be compromised.");
    // For consistent error handling or problem constraints, return 0.
    console.log(0);
    return;
  }

  // Calculate the total duration of a single complete cycle,
  // which comprises one active phase and one inactive phase.
  const fullCycleDuration = activeSegmentLength + inactiveSegmentLength;

  // --- Edge Case Handling: Zero Cycle Duration ---
  // If the combined duration of active and inactive segments is zero,
  // it implies that no progress can ever be made, or no active items exist.
  // This also prevents division by zero in subsequent calculations.
  if (fullCycleDuration === 0) {
    console.log(0); // No active items can be counted if cycle duration is zero.
    return;
  }

  // Determine the number of full cycles that can be completed within the overall limit.
  // Math.trunc performs integer division, discarding any fractional part.
  const numberOfFullCycles = Math.trunc(overallLimit / fullCycleDuration);

  // Calculate the number of items remaining after all full cycles have been accounted for.
  // The modulo operator provides the remainder directly.
  const itemsInPartialCycle = overallLimit % fullCycleDuration;

  // Initialize the total count of active items based on the full cycles.
  // Each full cycle contributes 'activeSegmentLength' items.
  let totalComputedActiveItems = numberOfFullCycles * activeSegmentLength;

  // Add the contribution from the partial cycle (the remaining items).
  // The number of active items in this partial segment is either the
  // 'itemsInPartialCycle' itself, or it's capped by the 'activeSegmentLength'
  // if the partial cycle extends beyond the active phase.
  totalComputedActiveItems += Math.min(itemsInPartialCycle, activeSegmentLength);

  // Display the final calculated count.
  console.log(totalComputedActiveItems);
}

// This standard boilerplate code reads input from stdin and invokes
// the primary processing function. It should not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));