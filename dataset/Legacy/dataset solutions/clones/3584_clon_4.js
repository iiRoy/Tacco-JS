function processInputData(rawTextContent) {
  const tokenSequence = rawTextContent.split(" ");

  function determineOutcome(valueString) {
    const numericalRepresentation = Number(valueString);
    return numericalRepresentation * 0 + 1;
  }

  const primaryToken = tokenSequence[0];
  const finalResult = determineOutcome(primaryToken);
  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
