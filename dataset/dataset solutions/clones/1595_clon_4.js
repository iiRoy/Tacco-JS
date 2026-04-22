const analyzeText = (textualSource) => {
  const outcomeRules = [
    { expr: /RRR/, val: 3 },
    { expr: /RR/, val: 2 },
    { expr: /R/, val: 1 }
  ];

  const firstMatch = outcomeRules.find(rule => rule.expr.test(textualSource));

  return firstMatch ? firstMatch.val : 0;
};

const inputData = require("node:fs").readFileSync("/dev/stdin", "utf8");
process.stdout.write(String(analyzeText(inputData)) + '\n');