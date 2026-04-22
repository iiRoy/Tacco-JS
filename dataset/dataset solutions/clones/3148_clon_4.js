function xorSummingUpTo(limit) {
  switch (limit % 4) {
    case 0: return limit;
    case 1: return 1;
    case 2: return limit + 1;
    case 3: return 0;
    default: return 0;
  }
}

(function() {
  const rawInput = require("node:fs").readFileSync("/dev/stdin", "utf8").trim();
  const numericalTokens = rawInput.split(" ").map(Number);

  const startPoint = numericalTokens[0];
  const endPoint = numericalTokens[1];

  const finalResult = xorSummingUpTo(endPoint) ^ xorSummingUpTo(startPoint - 1);

  console.log(finalResult);
})();