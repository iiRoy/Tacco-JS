function ProcessInput(rawData) {
  const lines = rawData.split("\n");
  const elementCount = Number(lines[0]);
  const dataSequence = lines[1].split(" ").map(Number);

  console.log(dataSequence.join(" "));

  for (let idx = 1; idx < elementCount; idx++) {
    const currentValue = dataSequence[idx];
    let insertionPoint = idx;

    // Determine the correct position for currentValue within the sorted sub-array
    for (let scanIdx = 0; scanIdx < idx; scanIdx++) {
      if (dataSequence[scanIdx] > currentValue) {
        insertionPoint = scanIdx;
        break;
      }
    }

    // If the element needs to be moved from its current position
    if (insertionPoint !== idx) {
      // Remove the element from its original position
      dataSequence.splice(idx, 1);
      // Insert the element at the calculated insertion point
      dataSequence.splice(insertionPoint, 0, currentValue);
    }

    console.log(dataSequence.join(" "));
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
