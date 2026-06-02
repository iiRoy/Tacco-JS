function processInputData(sourceContent) {
  const tokenizedValues = sourceContent.trim().split(" ");

  const convertedNumbers = tokenizedValues.map(segment => parseInt(segment, 10));

  const outputOrderIndices = [2, 0, 1];

  const finalArrangement = outputOrderIndices.map(idx => convertedNumbers[idx]);

  console.log(finalArrangement.join(" "));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
