function processInput(rawData) {
  const targetCount = parseInt(rawData);
  let resultSequence;

  if (targetCount === 3) {
    resultSequence = [2, 3, 25];
  } else {
    const valueOffsets = [2, 4, 3, 9, 8, 10, 6, 12];
    const blockIterationsLimit = 30000 / 12; // This is 2500

    // Generate the full potential sequence using functional array methods.
    // Array.from creates an array with 'blockIterationsLimit' elements.
    // For each element's index (blockIndex), it maps to a new array
    // by applying 'valueOffsets' to 'blockIndex * 12'.
    // The .flat() method then merges these nested arrays into a single, flat array.
    const fullPotentialSequence = Array.from({ length: blockIterationsLimit }, (_, blockIndex) =>
      valueOffsets.map(offset => blockIndex * 12 + offset)
    ).flat();

    // Truncate the generated sequence to the 'targetCount' length.
    // slice creates a new array containing the first 'targetCount' elements.
    let finalSequence = fullPotentialSequence.slice(0, targetCount);

    // Conditionally modify the last element of the 'finalSequence' if 'targetCount' is odd.
    if (targetCount % 2 === 1) {
      finalSequence[targetCount - 1] = 30000;
    }
    resultSequence = finalSequence;
  }

  console.log(resultSequence.join(" "));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
