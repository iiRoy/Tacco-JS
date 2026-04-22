const conditionEvaluator = (isTrue) => +isTrue;

function processDataString(rawInput) {
  const patternMatcher = /(?:.*\n)(?:.*? )(-?\d+(?:\.\d+)?)/;
  const matchedParts = rawInput.match(patternMatcher);

  const checkResult = matchedParts ? (Number(matchedParts[1]) === 1) : false;

  console.log(conditionEvaluator(checkResult));
}