function processInputString(inputData) {
    // Validate the input: ensure it's a string.
    if (typeof inputData !== 'string') {
        console.error('Error: Input must be a string.');
        return;
    }

    // Initialize a collection for processed segments.
    // This array will hold the resulting parts of the string.
    const segmentCollection = [];

    // Begin the primary segmentation process.
    // Initial call with starting offset 0 and segment length 1.
    // The default initial segment length is 1.
    performPrimarySegmentation(inputData, 0, 1, segmentCollection);

    // After all processing, log the total number of segments found.
    // The original code used console.log('%d', ...), which is a C-style format string.
    // For JavaScript, a template literal or direct concatenation is more idiomatic.
    console.log(`Final segment count: ${segmentCollection.length}`);
}

/**
 * Executes the main recursive segmentation logic.
 * This function attempts to split the source string based on character patterns.
 * @param {string} textSource The original input string.
 * @param {number} currentOffset The current starting index for processing.
 * @param {number} segmentLength The length of the segment to consider.
 * @param {string[]} collectedParts An array accumulating the string parts.
 * @returns {void}
 */
function performPrimarySegmentation(textSource, currentOffset, segmentLength, collectedParts) {
    // Early exit if the current offset exceeds the string boundaries.
    if (currentOffset >= textSource.length) {
        return;
    }

    // Ensure segment length is positive and within reasonable bounds.
    if (segmentLength <= 0 || segmentLength > textSource.length) {
        // Potentially handle this as an error or just return, depending on desired robustness.
        // For now, return to prevent infinite recursion or invalid slice operations.
        return;
    }

    // Extract a potential segment from the current position.
    const currentSegment = textSource.slice(currentOffset, currentOffset + segmentLength);
    // If an empty segment is extracted, it implies we're at or beyond the end of the string.
    if (!currentSegment) {
        return;
    }

    // Process any consecutive repeating characters starting from the current offset.
    // IMPORTANT: The original code had a subtle bug where the return value of
    // SubRepeat1 (now analyzeConsecutiveChars) was not assigned back to 'results'.
    // This Type III change fixes that behavior, ensuring 'collectedParts' is updated.
    collectedParts = analyzeConsecutiveChars(textSource, currentOffset, collectedParts);

    // Recalculate the current offset based on the *updated* collected parts.
    // This is crucial for maintaining the correct state after 'analyzeConsecutiveChars'.
    const adjustedOffset = collectedParts.join("").length;

    // If the adjusted offset reaches or surpasses the string's end, we are done.
    if (adjustedOffset >= textSource.length) {
        return;
    }

    // Extract two subsequent segments for comparison.
    const firstComparisonSegment = textSource.slice(adjustedOffset, adjustedOffset + segmentLength);
    const secondComparisonSegment = textSource.slice(adjustedOffset + segmentLength, adjustedOffset + segmentLength + 1);

    // If the first segment is identical to the second (single-character) segment,
    // extend the segment length and recurse.
    if (firstComparisonSegment === secondComparisonSegment) {
        // Prevent excessive segment length growth that might lead to errors or stack overflow.
        if (segmentLength + 1 > textSource.length) {
             return; // Cannot extend further than string length
        }
        performPrimarySegmentation(textSource, adjustedOffset, segmentLength + 1, collectedParts);
    } else {
        // If segments differ, add both to the collection.
        // Ensure both segments are non-empty before adding, to prevent adding empty strings.
        if (firstComparisonSegment) {
            collectedParts.push(firstComparisonSegment);
        }
        if (secondComparisonSegment) {
            collectedParts.push(secondComparisonSegment);
        }
        // Then, proceed with secondary segmentation logic.
        // The last added segment (secondComparisonSegment) becomes the 'previous' character for the next step.
        performSecondarySegmentation(textSource, adjustedOffset + segmentLength + 1, 1, secondComparisonSegment, collectedParts);
    }
}

/**
 * Handles secondary recursive segmentation, often triggered when primary segments diverge.
 * This function attempts to find matching sequences following a divergence point.
 * @param {string} sourceString The complete input string.
 * @param {number} currentPosition The current index in the string.
 * @param {number} len The length of the segment to extract.
 * @param {string} previousChar The character that caused the divergence in the previous step.
 * @param {string[]} outputArray An array to store the resulting string parts.
 * @returns {void}
 */
function performSecondarySegmentation(sourceString, currentPosition, len, previousChar, outputArray) {
    // Exit if the current position is beyond the string's length.
    if (currentPosition >= sourceString.length) {
        return;
    }

    // Extract a candidate segment from the current position.
    const candidateSegment = sourceString.slice(currentPosition, currentPosition + len);

    // If the candidate segment is empty, exit.
    if (!candidateSegment) {
        return;
    }

    // Compare the candidate segment with the 'previousChar'.
    if (previousChar === candidateSegment) {
        // If they match, we need to handle a specific reordering scenario
        // if extending the segment further would exceed the string length.
        if (currentPosition + len + 1 > sourceString.length) {
            // This complex reordering logic swaps the last two elements in 'outputArray'
            // but replaces the second-to-last with 'previousChar' (which is 'candidateSegment' here).
            // Example: [..., A, B] -> [..., candidateSegment, A]
            if (outputArray.length >= 2) {
                const tempHolder = outputArray[outputArray.length - 2]; // Store original A
                outputArray[outputArray.length - 2] = previousChar; // A becomes candidateSegment
                outputArray[outputArray.length - 1] = tempHolder;   // B becomes original A
            } else if (outputArray.length === 1) {
                // If only one element exists, this logic is ambiguous.
                // For robustness, we might just add previousChar or handle differently.
                // Sticking to original intent, which implies at least two elements for this branch.
                outputArray.push(previousChar); // Add previousChar if only one element
            }
            // Recurse with the adjusted 'previousChar' (which was the original second-to-last element).
            performSecondarySegmentation(sourceString, currentPosition, len + 1, outputArray[outputArray.length - 1], outputArray);
        } else {
            // If we can extend without immediate boundary issues, just recurse with extended length.
            performSecondarySegmentation(sourceString, currentPosition, len + 1, previousChar, outputArray);
        }
    } else {
        // If they don't match, add the current candidate segment to the collection.
        outputArray.push(candidateSegment);
        // Recurse, starting from the end of the current segment, with length 1,
        // and the current candidate segment becoming the new 'previousChar'.
        performSecondarySegmentation(sourceString, currentPosition + len, 1, candidateSegment, outputArray);
    }
}

/**
 * Identifies and processes blocks of consecutive, identical characters.
 * This function handles patterns like "aaaa" -> "aa", "a", "a" for certain lengths.
 * @param {string} sourceStr The full input string.
 * @param {number} startIndex The position to start checking for repetitions.
 * @param {string[]} currentOutput The array accumulating string parts.
 * @returns {string[]} The updated array of string parts.
 */
function analyzeConsecutiveChars(sourceStr, startIndex, currentOutput) {
    // Guard clause: if startIndex is out of bounds, return the array as is.
    if (startIndex >= sourceStr.length || startIndex < 0) {
        return currentOutput;
    }

    // Get the character at the starting position.
    const charToMatch = sourceStr.charAt(startIndex);
    if (!charToMatch) { // Handle case where charAt returns empty string.
        return currentOutput;
    }

    // Build a regex to match one or more occurrences of the character.
    // The `^` ensures it matches from the beginning of the sliced string.
    const repetitionPattern = new RegExp(`^${charToMatch}+`);
    // Find the longest sequence of this character starting from 'startIndex'.
    const matchedBlock = sourceStr.slice(startIndex).match(repetitionPattern);

    // If no match (shouldn't happen if charToMatch is valid, but good to check), or if the block is empty.
    if (!matchedBlock || !matchedBlock[0]) {
        return currentOutput;
    }

    const matchedLength = matchedBlock[0].length;

    // Only process if the repeated block is longer than 3 characters.
    // The original logic for `mLen % 3` was:
    // if mLen % 3 == 2 => call with 2
    // if mLen % 3 == 1 => call with 1
    // if mLen % 3 == 0 => call with 2
    // This simplifies to: if mLen % 3 == 1, use 1; otherwise use 2.
    if (matchedLength > 3) {
        const initialChunkSize = (matchedLength % 3 === 1) ? 1 : 2;
        // The original code passed 'results' but did not reassign the return value.
        // This is a fix for that bug, ensuring 'currentOutput' is updated.
        currentOutput = iterativeChunker(matchedBlock[0], initialChunkSize, currentOutput);
    }
    return currentOutput;
}

/**
 * Iteratively chunks a string of repeated characters into smaller parts based on a specific pattern.
 * This is an iterative version of the original recursive `SubRepeat2`.
 * @param {string} remainingBlock The block of repeated characters to chunk.
 * @param {number} currentChunkSize The size of the first chunk to extract.
 * @param {string[]} accumulator An array to collect the chunks.
 * @returns {string[]} The updated array of collected chunks.
 */
function iterativeChunker(remainingBlock, currentChunkSize, accumulator) {
    let internalBlock = remainingBlock;
    let internalChunkSize = currentChunkSize;

    // Continue processing as long as there's a block to chunk.
    while (internalBlock.length > 0) {
        // Extract the current chunk.
        const chunk = internalBlock.slice(0, internalChunkSize);
        if (chunk) {
            accumulator.push(chunk);
        }

        // Update the remaining block.
        internalBlock = internalBlock.slice(internalChunkSize);

        // If the remaining block is now too short (less than 3 characters),
        // we might be done or need to handle the last small piece.
        // The original logic had `matched.length < 3` as a base case.
        if (internalBlock.length < 3) {
            // If there's any remaining piece, add it as a single chunk.
            if (internalBlock.length > 0) {
                accumulator.push(internalBlock);
            }
            break; // Exit the loop.
        }

        // Determine the next chunk size based on the original `3 - iLen` logic.
        // If currentChunkSize was 1, next is 2. If currentChunkSize was 2, next is 1.
        internalChunkSize = 3 - internalChunkSize;
        // Ensure chunk size is always positive.
        if (internalChunkSize <= 0) {
            internalChunkSize = 1; // Fallback to 1 if calculation goes wrong.
        }
    }
    return accumulator;
}

// Entry point for execution.
// Reads input from standard input, converts to UTF-8 string, and passes to the main function.
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));