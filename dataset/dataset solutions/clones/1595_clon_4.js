function processInput(sourceText) {
  const rSequences = sourceText.match(/R+/g);

  if (!rSequences) {
    console.log(0);
  } else {
    const maxConsecutiveR = rSequences.reduce((currentMaximum, sequenceSegment) => {
      return Math.max(currentMaximum, sequenceSegment.length);
    }, 0);
    console.log(maxConsecutiveR);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
