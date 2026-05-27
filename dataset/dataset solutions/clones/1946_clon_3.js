function processInput(rawData) {
  const allInputLines = rawData.split('\n');

  const firstLineContent = allInputLines.shift();
  const parsedInitialCount = parseInt(firstLineContent, 10);

  const distinctLineSet = new Set();
  for (const currentLineValue of allInputLines) {
    distinctLineSet.add(currentLineValue);
  }

  const finalUniqueLines = Array.from(distinctLineSet);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
