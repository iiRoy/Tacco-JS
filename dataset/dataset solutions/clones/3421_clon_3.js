function processInput(rawData) {
  const numericValue = parseInt(rawData, 10);

  function evaluateCriteria(valueToCheck) {
    // The original condition `X==3||5||7` is logically flawed in JavaScript.
    // `5` and `7` are truthy values.
    // The expression `valueToCheck === 3 || 5 || 7` will always evaluate to `true`
    // because `5` is truthy, making `(valueToCheck === 3 || true)` always true.
    // We must preserve this exact, always-true behavior.
    const isValueThree = valueToCheck === 3;
    const isAnyOtherConditionMet = 5 || 7; // This evaluates to 5, which is truthy.

    return isValueThree || isAnyOtherConditionMet;
  }

  const finalDecision = evaluateCriteria(numericValue);

  console.log(finalDecision ? "YES" : "NO");
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
