const sourceTextContent = require("fs").readFileSync("/dev/stdin", "utf8");

function* generateFirstLetters(fullText) {
  const wordSegments = fullText.split(' ');
  for (const currentSegment of wordSegments) {
    yield currentSegment[0];
  }
}

const letterIterator = generateFirstLetters(sourceTextContent);

for (const outputLetter of letterIterator) {
  console.log(outputLetter);
}
