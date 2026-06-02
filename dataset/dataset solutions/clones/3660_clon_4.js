function computeResult(sourceText) {
  const lineBreakPosition = sourceText.indexOf('\n');
  const firstSegment = sourceText.substring(0, lineBreakPosition);
  const secondSegment = sourceText.substring(lineBreakPosition + 1);

  const quantity = parseInt(firstSegment, 10);

  const numericStrings = secondSegment.match(/\d+/g);

  let totalAccumulation = 0;
  if (numericStrings) {
    for (let i = 0; i < numericStrings.length; i++) {
      totalAccumulation += parseInt(numericStrings[i], 10);
    }
  }

  console.log(totalAccumulation - quantity);
}

computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
