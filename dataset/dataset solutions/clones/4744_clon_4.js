function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const stringTokens = lineSegments[1].split(' ');

  const uniqueCollection = new Set(stringTokens);

  const uniqueItemCount = uniqueCollection.size;

  const finalOutputValue = uniqueItemCount - (uniqueItemCount % 2 === 0 ? 1 : 0);

  console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
