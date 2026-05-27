function ProcessInputData(rawData) {
  const numericBounds = rawData.split(" ").map(Number);

  const rangeOneLower = numericBounds[0];
  const rangeOneUpper = numericBounds[1];
  const rangeTwoLower = numericBounds[2];
  const rangeTwoUpper = numericBounds[3];

  const commonStart = Math.max(rangeOneLower, rangeTwoLower);
  const commonEnd = Math.min(rangeOneUpper, rangeTwoUpper);

  const overlapCount = Math.max(0, commonEnd - commonStart + 1);

  console.log(overlapCount);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
