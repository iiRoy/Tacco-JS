function analyzeString(inputData) {
  const firstLine = inputData.split("\n")[0];
  const characterArray = firstLine.split("");
  const stringLength = characterArray.length;

  let shouldPreventYesOutput = false;

  if (stringLength % 2 === 0) {
    const segmentA = characterArray.slice(0, stringLength / 2 - 1);
    const segmentB = characterArray.slice(0, stringLength / 2).reverse();
    shouldPreventYesOutput = evaluateSegmentsForNoOutput(segmentA, segmentB);
  } else {
    const middleIndex = (stringLength - 1) / 2;
    const segmentA = characterArray.slice(0, middleIndex);
    const segmentB = characterArray.slice(middleIndex + 1).reverse();
    shouldPreventYesOutput = evaluateSegmentsForNoOutput(segmentA, segmentB);
  }

  if (!shouldPreventYesOutput) {
    console.log("YES");
  }
}

function evaluateSegmentsForNoOutput(firstSegment, secondSegment) {
  if (firstSegment.toString() === secondSegment.toString()) {
    const uniqueCharsInFirst = new Set(firstSegment);
    const uniqueCharsInSecond = new Set(secondSegment);
    if (uniqueCharsInFirst.size === 1 && uniqueCharsInSecond.size === 1) {
      console.log("NO");
      return true;
    }
  }
  return false;
}

analyzeString(require("fs").readFileSync("/dev/stdin", "utf8"));
