function Main(input) {
  const sourceString = input;
  const finalCounts = new Array(sourceString.length).fill(0);

  const segmentExtractor = (textualData) => {
    const intermediateParts = [];
    let lastDelimiterEnd = 0;
    let currentScanPosition = 0;

    while (true) {
      const delimiterStart = textualData.indexOf("LR", currentScanPosition);
      if (delimiterStart === -1) {
        intermediateParts.push(textualData.substring(lastDelimiterEnd));
        break;
      }
      intermediateParts.push(textualData.substring(lastDelimiterEnd, delimiterStart));
      lastDelimiterEnd = delimiterStart + 2;
      currentScanPosition = delimiterStart + 2;
    }

    const transformedSegments = intermediateParts.map(part => "R" + part + "L");

    if (transformedSegments.length > 0) {
      transformedSegments[0] = transformedSegments[0].substring(1);
      const lastSegmentIndex = transformedSegments.length - 1;
      transformedSegments[lastSegmentIndex] = transformedSegments[lastSegmentIndex].substring(0, transformedSegments[lastSegmentIndex].length - 1);
    }
    return transformedSegments;
  };

  const processedBlocks = segmentExtractor(sourceString);

  let globalOffset = 0;

  processedBlocks.forEach(blockUnit => {
    const blockLength = blockUnit.length;
    const rlBoundaryIndex = blockUnit.indexOf("RL");

    if (rlBoundaryIndex !== -1) {
      // The 'R' is at rlBoundaryIndex, 'L' is at rlBoundaryIndex + 1
      const rAttractorPositionInBlock = rlBoundaryIndex;
      const lAttractorPositionInBlock = rlBoundaryIndex + 1;

      const rightwardMovingCount = lAttractorPositionInBlock; // Number of characters to the left of 'L'
      const leftwardMovingCount = blockLength - lAttractorPositionInBlock; // Number of characters from 'L' to the end

      const countForR = Math.ceil(rightwardMovingCount / 2) + Math.floor(leftwardMovingCount / 2);
      const countForL = Math.floor(rightwardMovingCount / 2) + Math.ceil(leftwardMovingCount / 2);

      finalCounts[globalOffset + rAttractorPositionInBlock] = countForR;
      finalCounts[globalOffset + lAttractorPositionInBlock] = countForL;
    }
    // If rlBoundaryIndex is -1, all counts for this block remain 0, which is the default.

    globalOffset += blockLength;
  });

  console.log(finalCounts.join(" "));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
