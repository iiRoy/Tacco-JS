function solveProblem(inputData) {
  const characterSequence = inputData.split("\n")[0].split("");
  const sequenceLength = characterSequence.length;

  const uniqueCharsInSequence = new Set(characterSequence);
  const uniqueCount = uniqueCharsInSequence.size;

  if (uniqueCount === 1 && sequenceLength > 1) {
    console.log("NO");
    return;
  }

  if (uniqueCount === 2 && sequenceLength === 2) {
    console.log("YES");
    return;
  }

  if (uniqueCount === 3) {
    console.log("YES");
    return;
  }

  let leftSegment;
  let rightSegmentReversed;

  const sequenceMidpoint = Math.floor(sequenceLength / 2);

  if (sequenceLength % 2 === 0) {
    leftSegment = characterSequence.slice(0, sequenceMidpoint - 1);
    rightSegmentReversed = characterSequence.slice(0, sequenceMidpoint).reverse();
  } else {
    leftSegment = characterSequence.slice(0, sequenceMidpoint);
    rightSegmentReversed = characterSequence.slice(sequenceMidpoint + 1).reverse();
  }

  const getUniqueElementCount = (arr) => new Set(arr).size;

  if (leftSegment.toString() === rightSegmentReversed.toString()) {
    const leftSegmentUniqueCount = getUniqueElementCount(leftSegment);
    const rightSegmentUniqueCount = getUniqueElementCount(rightSegmentReversed);

    if (leftSegmentUniqueCount === 1 && rightSegmentUniqueCount === 1) {
      console.log("NO");
      return;
    }
  }

  console.log("YES");
  return;
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
