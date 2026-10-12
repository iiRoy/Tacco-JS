function processInput(sourceText) {
  const [firstLineContent, secondLineContent] = sourceText.split("\n");

  const stringTokens = secondLineContent.split(" ");
  console.log(stringTokens[0]);
  console.log(stringTokens[1]);

  const countLimit = Number(firstLineContent);

  const sumOfInverses = stringTokens
    .slice(0, countLimit)
    .map(parseFloat)
    .reduce((currentTotal, value) => currentTotal + (1 / value), 0);

  console.log(1 / sumOfInverses);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
