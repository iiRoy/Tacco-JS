function processInputAndCalculate(rawText) {
  const parts = rawText.split(/\s+/);
  const beginVal = Number.parseInt(parts[0], 10);
  const finishVal = Number.parseInt(parts[1], 10);
  const factorVal = Number.parseInt(parts[2], 10);

  const effectiveUpperBoundary = Math.min(finishVal, 100);

  let firstRelevantMultiple = Math.ceil(beginVal / factorVal) * factorVal;
  let lastRelevantMultiple = Math.floor(effectiveUpperBoundary / factorVal) * factorVal;

  let finalTally = 0;

  if (firstRelevantMultiple <= lastRelevantMultiple) {
    finalTally = (lastRelevantMultiple - firstRelevantMultiple) / factorVal + 1;
  }

  console.log(finalTally);
}

(function executeFromStdin() {
  const standardInputContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
  processInputAndCalculate(standardInputContent);
})();