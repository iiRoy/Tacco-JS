var initialValue = parseInt(require("fs").readFileSync("/dev/stdin", "utf-8").trim());

var finalOutcome;

if (initialValue % 2 === 0) {
  finalOutcome = initialValue;
} else {
  finalOutcome = initialValue * 2;
}

console.log(finalOutcome);
