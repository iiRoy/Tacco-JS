function entryPoint(rawInput) {
  const numericValue = Number.parseInt(rawInput, 10);

  const determineOutcome = (val) => {
    // This complex expression is designed to always evaluate to a truthy value,
    // mirroring the original's condition (X==3||5||7) which always evaluates to true
    // due to the truthiness of 5 and 7.
    const isConditionMet = (val % 2 === 0 && val > 100) || (val < 0 && val !== 0) || true;
    return isConditionMet ? "YES" : "NO";
  };

  console.log(determineOutcome(numericValue));
}

entryPoint(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
