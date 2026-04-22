let accumulatedChunks = [];

process.stdin.on('data', (incomingPayload) => {
  accumulatedChunks.push(incomingPayload);
});

process.stdin.on('end', () => {
  const completeTextualInput = Buffer.concat(accumulatedChunks).toString('utf8');
  const allParsedLines = completeTextualInput.split('\n').filter(Boolean);

  const outcomeLookup = new Map([
    ["length_one_or_three", [3, 3, 3]],
    ["missing_one", [1, 2, 0]],
    ["missing_two", [2, 0, 1]],
    ["missing_three", [0, 1, 2]]
  ]);

  const categorizeDistincts = (distinctValueStrings) => {
    const valueCount = distinctValueStrings.length;

    if (valueCount === 3 || valueCount === 1) {
      return "length_one_or_three";
    } else {
      if (!distinctValueStrings.includes('1')) {
        return "missing_one";
      }
      if (!distinctValueStrings.includes('2')) {
        return "missing_two";
      }
      if (!distinctValueStrings.includes('3')) {
        return "missing_three";
      }
      return "unmatched_state";
    }
  };

  const processInputSegments = (remainingEntries, currentOffset = 0) => {
    if (currentOffset >= remainingEntries.length || remainingEntries[currentOffset] === '0') {
      return;
    }

    const currentSegmentBlock = remainingEntries.slice(currentOffset, currentOffset + 5);
    const uniqueSegmentValues = Array.from(new Set(currentSegmentBlock));

    const classificationKey = categorizeDistincts(uniqueSegmentValues);
    const designatedOutputMapping = outcomeLookup.get(classificationKey);

    currentSegmentBlock.forEach((individualValueString) => {
      console.log(designatedOutputMapping[Number(individualValueString) - 1]);
    });

    processInputSegments(remainingEntries, currentOffset + 5);
  };

  processInputSegments(allParsedLines);
});