const sourceMaterial = require("fs").readFileSync("/dev/stdin", "utf8");

(function() {
  const cleanedContent = sourceMaterial.trim();
  const numericPattern = /^(\d+)/; // Changed regex to ensure it only matches at the beginning, like parseInt
  const matchResult = cleanedContent.match(numericPattern);

  let initialNumber; 
  if (matchResult && matchResult.length > 1) { // matchResult[0] is full match, matchResult[1] is the captured group
    initialNumber = parseFloat(matchResult[1]); 
  } else {
    initialNumber = NaN; // Mimic parseInt's behavior for non-numeric start
  }

  const computedOutcome = initialNumber * (1/3);

  process.stdout.write(computedOutcome.toString() + '\n');
})();