function processInput(sourceText) {
  const lineSegments = sourceText.split("\n");
  const numericSequence = lineSegments[1].split(" ").map(Number);

  const cycleTally = numericSequence.reduce((accumulator, currentElementValue, currentElementIndex) => {
    const targetIndex = currentElementValue - 1;
    const expectedValue = currentElementIndex + 1;

    if (numericSequence[targetIndex] === expectedValue) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);

  console.log(cycleTally / 2);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
