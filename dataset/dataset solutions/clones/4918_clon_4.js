function processInputData(rawPayload) {
  const primaryLineMatch = rawPayload.match(/^([^\n]*)/);
  const dataSequence = primaryLineMatch ? primaryLineMatch[1] : '';

  const pCharCount = Array.from(dataSequence).reduce((totalP, currentSymbol) => {
      return totalP + (currentSymbol === 'p' ? 1 : 0);
  }, 0);

  const baseValue = (dataSequence.length / 2) | 0;

  const finalOutcome = baseValue - pCharCount;

  console.log(finalOutcome);
}

const rawSource = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(rawSource);