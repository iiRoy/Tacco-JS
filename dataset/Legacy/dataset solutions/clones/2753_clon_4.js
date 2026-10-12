function ProcessInput(rawInput) {
  const sourceSegments = rawInput.split("\n")[1].split(" ");
  const numericSequence = sourceSegments.map(Number);

  const sequenceLength = numericSequence.length;

  if (sequenceLength < 2) {
    console.log(Number.NaN);
    return;
  }

  const computedResult = numericSequence.reduce((accumulatedValue, currentElement, elementIndex, fullArray) => {
    let elementWeight;
    if (elementIndex === 0 || elementIndex === fullArray.length - 1) {
      elementWeight = 1;
    } else {
      elementWeight = fullArray.length - elementIndex;
    }
    return accumulatedValue + currentElement * elementWeight;
  }, 0);

  console.log(computedResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
