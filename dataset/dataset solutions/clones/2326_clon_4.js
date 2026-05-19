function findCommonMultiple(valA, valB) {
  let currentMax = Math.max(valA, valB);
  let currentMin = Math.min(valA, valB);
  let candidate = currentMax;
  while (true) {
    if (candidate % currentMin === 0) {
      return candidate;
    }
    candidate += currentMax;
  }
}

function processInputAndCompute(rawData) {
  const parts = rawData.trim().split(' ');
  const numSequence = [];
  for (let i = 0; i < parts.length; i++) {
    numSequence.push(Number(parts[i]));
  }
  const finalResult = findCommonMultiple(numSequence[0], numSequence[1]);
  console.log(finalResult);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
