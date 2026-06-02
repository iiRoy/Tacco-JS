function processInputData(sourceText) {
  const rawLines = sourceText.split("\n");
  const numericValues = rawLines.map(Number);

  const initialCountValue = numericValues[0]; // Corresponds to original 'N', unused but extracted for behavioral parity

  const firstSequenceItem = numericValues[1];
  const subsequentSequenceItems = numericValues.slice(2, numericValues.length - (isNaN(numericValues[numericValues.length - 1]) ? 1 : 0));

  const uniqueElementRegistry = new Set();
  uniqueElementRegistry.add(firstSequenceItem);

  for (const currentItem of subsequentSequenceItems) {
    if (uniqueElementRegistry.has(currentItem)) {
      uniqueElementRegistry.delete(currentItem);
    } else {
      uniqueElementRegistry.add(currentItem);
    }
  }

  console.log(uniqueElementRegistry.size);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
