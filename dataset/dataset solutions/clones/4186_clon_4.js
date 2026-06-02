function processInputData(rawText) {
  const segmentStrings = rawText.split(' ');
  const numericComponents = [];
  for (let idx = 0; idx < segmentStrings.length; idx++) {
    numericComponents.push(Number(segmentStrings[idx]));
  }

  const computedProduct = numericComponents[0] * numericComponents[1];
  const comparisonTarget = numericComponents[2];

  console.log(Math.min(computedProduct, comparisonTarget));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
