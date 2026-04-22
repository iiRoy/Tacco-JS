function processInput(receivedInfo) {
  const dataSegments = receivedInfo.split('\n');
  const numericalTokens = dataSegments[1].split(' ').map(Number);
  const uniqueTokens = new Set(numericalTokens);
  const areAllUnique = uniqueTokens.size === numericalTokens.length;

  if (areAllUnique) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());