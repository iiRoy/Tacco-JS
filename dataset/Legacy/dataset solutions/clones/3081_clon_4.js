function processGameResult(rawData) {
  const parsedLines = rawData.split('\n');
  const gameSequence = parsedLines[1].replace(/\r?\n/g, '');

  const redCount = [...gameSequence].filter(symbol => symbol === 'R').length;
  const blueCount = [...gameSequence].filter(symbol => symbol === 'B').length;

  console.log(redCount > blueCount ? "Yes" : "No");
}

processGameResult(require("fs").readFileSync("/dev/stdin", "utf8"));
