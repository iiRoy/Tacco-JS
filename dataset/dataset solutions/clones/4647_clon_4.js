function processInputData(sourceText) {
  const lineSegments = sourceText.split("\n");
  const primarySegment = lineSegments[0];
  const secondarySegment = lineSegments[1];

  const finalSequence = Array.from({ length: primarySegment.length }, (_, charIndex) =>
    primarySegment.charAt(charIndex) + secondarySegment.charAt(charIndex)
  ).join('');

  console.log(finalSequence);
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processInputData(rawInputContent);
