function processInputData(inputContent) {
  const lineSegments = inputContent.split("\n");

  const [gridHeight, gridWidth] = lineSegments[0].split(" ").map(Number);
  const distinctItemCount = Number(lineSegments[1]);
  const itemQuantities = lineSegments[2].split(" ").map(Number);

  const numberSequence = itemQuantities.flatMap((quantity, itemIndex) =>
    Array.from({ length: quantity }, () => itemIndex + 1)
  );

  let sequencePointer = 0;

  const constructedRows = Array.from({ length: gridHeight }, (_, rowIdentifier) => {
    const rowSegment = numberSequence.slice(sequencePointer, sequencePointer + gridWidth);
    sequencePointer += gridWidth;

    const orderedRowSegment = (rowIdentifier % 2 !== 0) ? rowSegment.reverse() : rowSegment;

    return orderedRowSegment.join(" ");
  });

  const finalDisplayOutput = constructedRows.join("\n");

  console.log(finalDisplayOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
