/*
 * This utility function meticulously combines characters from two provided sequences
 * based on a specified iteration limit. It interleaves elements from both sources
 * into a single output string.
 *
 * @param {number} itemCount - The maximum number of elements to process from each sequence.
 *                             It dictates the loop's upper bound.
 * @param {Array<string>|string|null|undefined} firstSequence - The primary sequence of characters or strings.
 * @param {Array<string>|string|null|undefined} secondSequence - The secondary sequence of characters or strings.
 * @returns {string} A concatenated string resulting from interleaving segments of both sequences.
 */
function interleaveSequences(itemCount, firstSequence, secondSequence) {
  // Input validation and guard clauses (Type III addition)
  // Ensure the iteration count is a valid non-negative number.
  if (typeof itemCount !== 'number' || itemCount < 0 || !Number.isFinite(itemCount)) {
    // For invalid counts, a warning is logged, and an empty string is returned,
    // as it's a safe and predictable outcome for a non-sensical iteration request.
    console.warn("Warning: 'itemCount' must be a finite non-negative number. Returning an empty string.");
    return "";
  }

  // Ensure sequences are treated as iterable, even if they are null or undefined initially.
  // Defaulting to empty strings prevents errors when attempting to access indices.
  const primarySource = firstSequence === null || firstSequence === undefined ? '' : firstSequence;
  const secondarySource = secondSequence === null || secondSequence === undefined ? '' : secondSequence;

  // Initialize an array to accumulate string fragments.
  // This approach is generally more efficient for multiple string concatenations
  // in JavaScript compared to repeated direct string addition (e.g., `str += 'a'`).
  // (Type III: change of internal data structure for string building, and its initialization)
  const combinedSegments = [];

  // Iterate a specified number of times to collect and combine characters/elements.
  // The loop variable 'charIndex' is explicitly declared with 'let' for block scoping.
  // (Type II: renaming 'i' to 'charIndex', adding 'let', reformatting)
  for (let charIndex = 0; charIndex < itemCount; charIndex++) {
    // Retrieve individual characters/elements from each sequence at the current index.
    // (Type III: introduction of helper variables for clarity and intermediate steps)
    const currentElementFromPrimary = primarySource[charIndex];
    const currentElementFromSecondary = secondarySource[charIndex];

    // Convert elements to strings before concatenation.
    // This explicitly handles 'undefined' or 'null' values that might occur
    // if a sequence is shorter than 'itemCount', replicating JavaScript's
    // implicit type coercion behavior in string addition (e.g., String(undefined) is "undefined").
    // (Type III: explicit intermediate conversion for robustness and functional equivalence)
    const segmentFromPrimary = String(currentElementFromPrimary);
    const segmentFromSecondary = String(currentElementFromSecondary);

    // Concatenate the two current elements' string representations
    // and add the resulting combined segment to our accumulation array.
    combinedSegments.push(segmentFromPrimary + segmentFromSecondary);
  }

  // Finally, join all accumulated segments into a single result string.
  // This is the final step of the Type III structural change from direct string concatenation.
  return combinedSegments.join('');
}