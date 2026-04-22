function ProcessData(rawData) {
  const numericValues = rawData.match(/\d+/g).map(Number);

  const gridHeight = numericValues[0];
  const gridWidth = numericValues[1];
  const groupCount = numericValues[2];
  const groupSizes = numericValues.slice(3, 3 + groupCount);

  let currentBlockIdentifier = 1;
  const arrangedSequence = groupSizes.flatMap(segmentLength => {
    const segmentBlocks = Array(segmentLength).fill(currentBlockIdentifier);
    currentBlockIdentifier++;
    return segmentBlocks;
  });

  const formattedLines = Array.from({ length: gridHeight }, (_, lineIndex) => {
    const startPosition = lineIndex * gridWidth;
    const endPosition = startPosition + gridWidth;
    let currentLineSegments = arrangedSequence.slice(startPosition, endPosition);

    if (lineIndex % 2 !== 0) {
      currentLineSegments.reverse();
    }
    return currentLineSegments.join(" ");
  });

  const finalRender = formattedLines.join("\n");

  console.log(finalRender);
}

ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));