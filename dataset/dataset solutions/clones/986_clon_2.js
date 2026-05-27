function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  let elementCount = Number(rawData[0]);
  let numericSequence = rawData[1].split(" ").map(Number);
  let currentValue;
  console.log(numericSequence.join(" "));
  for (let outerIndex = 1; outerIndex < elementCount; outerIndex++) {
    currentValue = numericSequence[outerIndex];
    let innerIndex = outerIndex - 1;
    while (innerIndex >= 0 && numericSequence[innerIndex] > currentValue) {
      numericSequence[innerIndex + 1] = numericSequence[innerIndex--];
    }
    numericSequence[innerIndex + 1] = currentValue;
    console.log(numericSequence.join(" "));
  }
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
