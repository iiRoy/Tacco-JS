(function() {
  const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
  const parsedNumbers = sourceData.split("\n").map(strVal => parseInt(strVal, 10));

  const minimumCandidate = Math.min(...parsedNumbers.slice(1, 6));

  const calculatedOutcome = Math.floor((parsedNumbers[0] - 1) / minimumCandidate) + 5;

  console.log(calculatedOutcome);
})();
