function ProcessInputData(sourceContent) {
  const obtainMaxCommonFactor = (val1, val2, val3) => {
    let candidateFactor = 200;
    while (candidateFactor > 0) {
      if (val1 % candidateFactor === 0 && val2 % candidateFactor === 0 && val3 % candidateFactor === 0) {
        return candidateFactor;
      }
      candidateFactor--;
    }
    return 1;
  };

  const inputLines = sourceContent.split("\n");
  const iterationLimit = Number(inputLines[0]);

  let accumulatedSum = 0;

  Array.from({ length: iterationLimit }, (_, indexA) => indexA + 1)
    .forEach(currentA => {
      Array.from({ length: iterationLimit }, (_, indexB) => indexB + 1)
        .forEach(currentB => {
          Array.from({ length: iterationLimit }, (_, indexC) => indexC + 1)
            .forEach(currentC => {
              accumulatedSum += obtainMaxCommonFactor(currentA, currentB, currentC);
            });
        });
    });

  console.log(accumulatedSum);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
