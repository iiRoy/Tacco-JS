function processAndOutput(sourceContent) {
  const headSegment = sourceContent.slice(0, 3);
  const insertedDigit = '8';
  const tailSegment = sourceContent.slice(4);

  const resultantContent = headSegment + insertedDigit + tailSegment;
  console.log(resultantContent);
}

processAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));