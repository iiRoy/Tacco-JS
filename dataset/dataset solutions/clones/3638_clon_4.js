const evaluateSequence = (sourceData) => {
  const validationPattern = /^A[a-z]+C[a-z]+$/;
  let finalOutcome = 'WA';

  if (validationPattern.test(sourceData)) {
    finalOutcome = 'AC';
  }

  console.log(finalOutcome);
};
evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));