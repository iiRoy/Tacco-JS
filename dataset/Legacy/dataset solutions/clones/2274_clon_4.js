const outcomeLabels = ["No", "Yes"];

function handleInputEvaluation(sourceText) {
  const parsedValues = sourceText.split(" ").map(item => Number(item));

  const isConditionMet = parsedValues[0] * 500 >= parsedValues[1];

  console.log(outcomeLabels[Number(isConditionMet)]);
}

handleInputEvaluation(require("fs").readFileSync("/dev/stdin", "utf8"));
