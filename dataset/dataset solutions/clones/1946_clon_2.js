function ProcessInput(sourceData) {
  const lineSegments = sourceData.split('\n');

  // Parse the first line as an integer, representing an initial count.
  const initialLineCount = parseInt(lineSegments.shift());

  /*
   * Filter the remaining segments to keep only unique items.
   * This effectively removes duplicate lines from the array.
   */
  const distinctElements = lineSegments.filter((currentSegment, segmentPosition) =>
    lineSegments.indexOf(currentSegment) === segmentPosition
  );
}

// Do not modify the following line (it handles reading input and invoking the primary function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
