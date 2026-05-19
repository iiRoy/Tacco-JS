const processInput = rawData => {
  const inputSegments = rawData.trim().split(' ');
  const numIterations = parseInt(inputSegments[0]);
  const factorBase = parseInt(inputSegments[1]);

  let finalResult;

  if (numIterations === 0) {
    finalResult = 0;
  } else {
    finalResult = factorBase;
    const subsequentFactor = factorBase - 1;
    for (let currentIteration = 1; currentIteration < numIterations; currentIteration++) {
      finalResult *= subsequentFactor;
    }
  }

  console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
