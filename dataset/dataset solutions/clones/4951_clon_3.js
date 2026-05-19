function processInputData(rawDataString) {
    const LINE_DELIMITER = "\n";
    const SLICE_INDEX_FOR_SEGMENTATION = 4;

    let lineArray = rawDataString.split(LINE_DELIMITER);

    // Introduce an intermediate variable to hold the full set of lines
    // before they are divided into segments.
    let fullLineSet = lineArray;

    let leadingLinesSegment = fullLineSet.slice(0, SLICE_INDEX_FOR_SEGMENTATION);
    let trailingLinesSegment = fullLineSet.slice(SLICE_INDEX_FOR_SEGMENTATION);

    // Explicitly convert array segments to strings before concatenation
    // This makes the implicit toString() behavior of array concatenation explicit.
    const firstSegmentAsString = leadingLinesSegment.toString();
    const secondSegmentAsString = trailingLinesSegment.toString();

    // Construct the final output string by combining the two stringified segments
    const combinedOutputString = firstSegmentAsString + ' ' + secondSegmentAsString;

    console.log(combinedOutputString);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
