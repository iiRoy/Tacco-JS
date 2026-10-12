function processInput(rawText) {
  const charSequence = rawText.split('');
  const totalLength = charSequence.length;

  if (totalLength % 2 !== 0) {
    console.log("No");
    return;
  }

  const halfLength = totalLength / 2;

  let firstSegment = '';
  for (let i = 0; i < halfLength; i++) {
    firstSegment += charSequence[i];
  }

  let secondSegmentTransformed = '';
  const charReflect = new Map([
    ['b', 'd'],
    ['d', 'b'],
    ['p', 'q'],
    ['q', 'p']
  ]);

  for (let i = totalLength - 1; i >= halfLength; i--) {
    const originalChar = charSequence[i];
    const mirroredChar = charReflect.get(originalChar);
    if (mirroredChar !== undefined) {
      secondSegmentTransformed += mirroredChar;
    }
  }

  if (firstSegment === secondSegmentTransformed) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
