function processInputData (rawData) {
  const lineSeparator = "\n";
  const firstLineContent = rawData.split(lineSeparator)[0];

  const tokenSeparator = " ";
  const contentTokens = firstLineContent.split(tokenSeparator);

  const firstToken = contentTokens[0];
  const secondToken = contentTokens[1];

  const combinedOutput = secondToken + firstToken;

  console.log(combinedOutput);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContent);
