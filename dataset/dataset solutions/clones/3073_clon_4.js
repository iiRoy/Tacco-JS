const Main = (sourceData) => {
  const parsedLines = sourceData.trim().split('\n').map((line) => line.split(/\s/).map(Number));

  const configParams = parsedLines[0];
  const xCount = configParams[0];
  const yCount = configParams[1];
  const zCount = configParams[2];
  const topK = configParams[3];

  const setA = parsedLines[1];
  const setB = parsedLines[2];
  const setC = parsedLines[3];

  setA.sort((val1, val2) => val2 - val1);
  setB.sort((val1, val2) => val2 - val1);
  setC.sort((val1, val2) => val2 - val1);

  const intermediateSums = setA.slice(0, xCount).flatMap((valA) =>
    setB.slice(0, yCount).map((valB) => valA + valB)
  );

  intermediateSums.sort((val1, val2) => val2 - val1);

  function* generateFinalSums(abSums, cVals, kLimit, zLimit) {
    const effectiveABCount = Math.min(kLimit, abSums.length);

    for (let abIdx = 0; abIdx < effectiveABCount; abIdx++) {
      const currentABSum = abSums[abIdx];

      for (let cIdx = 0; cIdx < zLimit; cIdx++) {
        if (effectiveABCount < abIdx * cIdx) {
          continue;
        }
        yield currentABSum + cVals[cIdx];
      }
    }
  }

  const finalSums = Array.from(generateFinalSums(intermediateSums, setC, topK, zCount));

  finalSums.sort((val1, val2) => val2 - val1);

  console.log(finalSums.slice(0, topK).join('\n'));
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
