const processRawDataStrict = (rawText) => {
  const dataLines = rawText.split('\n');

  let iterationCount;
  const firstLine = dataLines[0];
  // Replicate original's `n = input[0].split("")` then `i < n` behavior:
  // If `input[0]` is "5", `n` is `["5"]`, `i < n` becomes `i < "5"`, then `i < 5`.
  // If `input[0]` is "10", `n` is `["1", "0"]`, `i < n` becomes `i < "1,0"`, then `i < NaN`. Loop doesn't run.
  if (firstLine.length === 1 && !isNaN(Number(firstLine))) {
    iterationCount = Number(firstLine);
  } else {
    iterationCount = 0;
  }

  const seriesA = dataLines[1].split(' ').map(Number);
  const seriesB = dataLines[2].split(' ').map(Number);
  const seriesC = dataLines[3].split(' ').map(Number);

  return { iterationCount, seriesA, seriesB, seriesC };
};

const calculateTotalWithRecursion = (structuredData, currentIdx, accumulatedValue) => {
  if (currentIdx >= structuredData.iterationCount) {
    return accumulatedValue;
  }

  const currentAVal = structuredData.seriesA[currentIdx];
  let segmentContribution = structuredData.seriesB[currentAVal - 1];

  if (currentIdx > 0) {
    const priorAVal = structuredData.seriesA[currentIdx - 1];
    // Original uses `a[i]==Number(a[i-1])+1`. Since `a[i]` is string, and `Number(a[i-1])+1` is number,
    // JS coerces the number to string for `==`. Example: `"2" == 2` is true.
    // Our `currentAVal` and `priorAVal` are already numbers.
    if (currentAVal === priorAVal + 1) {
      segmentContribution += structuredData.seriesC[priorAVal - 1];
    }
  }

  return calculateTotalWithRecursion(structuredData, currentIdx + 1, accumulatedValue + segmentContribution);
};

const processInputAndCompute = (incomingText) => {
  const processedData = processRawDataStrict(incomingText);
  const finalResult = calculateTotalWithRecursion(processedData, 0, 0);
  console.log(finalResult);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));