'use strict';
// This self-executing anonymous function processes standard input to generate ASCII art frames.
(function(rawInputString) {
  /**
   * Constructs a rectangular ASCII frame based on provided dimensions.
   * The frame consists of '#' characters for borders and '.' for interior.
   * Special handling ensures consistent behavior for small widths/heights,
   * mimicking the original implementation's nuances.
   *
   * @param {number[]} sizePair - An array containing [width, height] of the frame.
   * @returns {string} The multi-line string representation of the ASCII frame.
   */
  const constructAsciiFrame = (sizePair) => {
    // Extracting width and height from the input tuple for clarity and immutability.
    const frameWidth = sizePair[0];
    const frameHeight = sizePair[1];

    // Define the character for the frame's outer border.
    const borderChar = '#';
    // Define the character for the frame's interior fill.
    const interiorChar = '.';

    // Create the solid top and bottom border line (e.g., "#####").
    // This line consists solely of border characters repeated across the frame's width.
    const solidBorderLine = borderChar.repeat(frameWidth);

    let middleContentLine;
    // Determine the structure of the interior rows (e.g., "#...#", "##").
    if (frameWidth > 2) {
      // For frames wider than 2 units, an interior line has border characters at the ends
      // and interior characters filling the middle section.
      const dotSequence = interiorChar.repeat(frameWidth - 2);
      middleContentLine = `${borderChar}${dotSequence}${borderChar}`;
    } else {
      // For frames with width 1 or 2, the original logic effectively produced "##" for interior lines.
      // Example: for width=1, the original code constructs `['#', '#']` then joins to "##".
      // Example: for width=2, the original code also constructs `['#', '#']` then joins to "##".
      middleContentLine = borderChar.repeat(2);
    }

    // This array will hold each line of the constructed ASCII frame.
    const frameRowsCollection = [];

    // Add the intermediate rows. These are the lines that appear between the top and bottom borders.
    // This loop runs `frameHeight - 2` times. If `frameHeight` is 0, 1, or 2, this loop will not execute,
    // which correctly handles frames with no or minimal interior height.
    for (let currentVerticalIndex = 0; currentVerticalIndex < frameHeight - 2; ++currentVerticalIndex) {
      frameRowsCollection.push(middleContentLine);
    }

    // Append the bottom border line to the collection.
    frameRowsCollection.push(solidBorderLine);

    // Prepend the top border line to the beginning of the array.
    // This ensures the top border is the very first line of the frame.
    frameRowsCollection.unshift(solidBorderLine);

    // Combine all generated rows into a single string, separated by newline characters.
    return frameRowsCollection.join('\n');
  };

  // --- Input Processing Section ---

  // Define the standard sentinel value that indicates the end of input data.
  const END_OF_INPUT_SENTINEL = '0 0';

  // Convert the raw input buffer to a string, remove leading/trailing whitespace,
  // and then split it into an array of individual lines.
  const sourceLines = rawInputString.toString().trim().split('\n');

  let currentLineCursor = 0;
  const parsedDimensionSets = [];

  // Iterate through the input lines until the end of the input or the sentinel is found.
  while (currentLineCursor < sourceLines.length) {
    const activeLine = sourceLines[currentLineCursor].trim();

    // Check if the current line matches the end-of-input sentinel.
    if (activeLine === END_OF_INPUT_SENTINEL) {
      break; // Terminate the loop if the sentinel is encountered.
    }

    // Split the current line by space to get width and height as strings.
    const dimensionsAsStrings = activeLine.split(' ');
    // Convert the string parts to numbers.
    const widthValue = Number(dimensionsAsStrings[0]);
    const heightValue = Number(dimensionsAsStrings[1]);

    // Perform basic validation to ensure dimensions are valid positive numbers.
    // The original code implicitly assumes valid inputs; this adds robustness.
    if (!Number.isFinite(widthValue) || !Number.isFinite(heightValue) || widthValue < 0 || heightValue < 0) {
        // Log a warning and skip processing for any invalid dimension lines.
        console.error(`Warning: Skipping invalid or non-positive dimension line: "${activeLine}"`);
        currentLineCursor++; // Move to the next line regardless.
        continue; // Continue to the next iteration of the loop.
    }

    // Store the validated dimension pair for later processing.
    parsedDimensionSets.push([widthValue, heightValue]);
    currentLineCursor++; // Advance the cursor to the next line.
  }

  // --- Main Processing Logic ---

  // Apply the frame construction function to each set of dimensions that were parsed.
  // The results (individual ASCII frames) are then joined by two newline characters
  // to separate distinct frames in the final output.
  const allGeneratedFrames = parsedDimensionSets
    .map(constructAsciiFrame)
    .join('\n\n'); // Use double newlines to separate each complete frame.

  // --- Output Section ---

  // Display the final aggregated ASCII art string to the console.
  console.log(allGeneratedFrames);

// The Immediately Invoked Function Expression (IIFE) executes immediately,
// reading standard input from the file system.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));