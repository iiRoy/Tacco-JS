function processInput(rawInputString) {
  const lines = rawInputString.split("\n");
  const vertexCount = parseInt(lines[0], 10);

  const resultSegments = [];

  let initialPairCount;
  let shouldIncludePairPredicate;

  if (vertexCount % 2 === 0) {
    const N_minus_2_val = vertexCount - 2;
    initialPairCount = (N_minus_2_val * vertexCount) / 2;
    shouldIncludePairPredicate = (v1, v2, totalV) => v2 !== (totalV + 1 - v1);
  } else {
    const N_minus_3_val = vertexCount - 3;
    const N_minus_1_val = vertexCount - 1;
    initialPairCount = (N_minus_3_val * N_minus_1_val) / 2 + N_minus_1_val;
    shouldIncludePairPredicate = (v1, v2, totalV) => v2 !== (totalV - v1);
  }

  resultSegments.push(initialPairCount);

  for (let currentV1 = 1; currentV1 <= vertexCount; currentV1++) {
    for (let currentV2 = currentV1 + 1; currentV2 <= vertexCount; currentV2++) {
      if (shouldIncludePairPredicate(currentV1, currentV2, vertexCount)) {
        resultSegments.push(`${currentV1} ${currentV2}`);
      }
    }
  }

  const formattedResultString = resultSegments.join("\n");

  console.log('%s', formattedResultString);
  return formattedResultString;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
