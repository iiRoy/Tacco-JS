function checkStringPrefix(targetString, prefixValue) {
  if (targetString.length < prefixValue.length) {
    return false;
  }
  return targetString.slice(0, prefixValue.length) === prefixValue;
}

function processInput(dataString) {
  const requiredPrefix = "YAKI";
  const positiveOutcomeMessage = "Yes";
  const negativeOutcomeMessage = "No";

  let finalResultString;

  if (checkStringPrefix(dataString, requiredPrefix)) {
    finalResultString = positiveOutcomeMessage;
  } else {
    finalResultString = negativeOutcomeMessage;
  }

  console.log(finalResultString);
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(rawInputContent);
