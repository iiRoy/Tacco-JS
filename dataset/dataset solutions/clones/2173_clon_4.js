function processInput(rawContent) {
  const contentLines = rawContent.split('\n');
  const targetLine = contentLines[1];
  const stringTokens = targetLine.split(' ');
  const numericElements = stringTokens.map(Number);

  const distinctElements = new Set(numericElements);

  if (distinctElements.size < numericElements.length) {
    console.log("NO");
  } else {
    console.log("YES");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
