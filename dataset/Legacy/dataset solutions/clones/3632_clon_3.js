function processInputData(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(" ").map(Number);
  const N = firstLineParts[0];
  const modulusValue = firstLineParts[1];

  const inputArray = lines[1].split(" ").map(Number);

  let finalCount = 0;
  const remainderCounts = {};
  let currentRemainderSum = 0;

  for (let idx = 0; idx < N; idx++) {
    const currentElement = inputArray[idx];
    currentRemainderSum = (currentRemainderSum + currentElement) % modulusValue;
    remainderCounts[currentRemainderSum] = (remainderCounts[currentRemainderSum] || 0) + 1;
  }

  const calculatePairs = (count, includeSelfPair) => {
    if (includeSelfPair) {
      return count * (count + 1) / 2;
    } else {
      return count * (count - 1) / 2;
    }
  };

  for (const remainderKeyStr in remainderCounts) {
    const remainder = Number(remainderKeyStr);
    const count = remainderCounts[remainderKeyStr];

    if (remainder === 0) {
      finalCount += calculatePairs(count, true);
    } else {
      finalCount += calculatePairs(count, false);
    }
  }

  console.log(finalCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
