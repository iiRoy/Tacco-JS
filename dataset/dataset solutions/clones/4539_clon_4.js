const systemIO = require("fs");
const sourcePath = "/dev/stdin";
const rawContent = systemIO.readFileSync(sourcePath, "utf8");
const stringParts = rawContent.trim().split(/\s+/);

const firstQuantity = parseInt(stringParts[0], 10);
const secondQuantity = parseInt(stringParts[1], 10);

const evaluationRules = [
  {
    test: (value, limit) => value < limit,
    result: (value) => value
  },
  {
    test: (value, limit) => value >= limit,
    result: () => "error"
  }
];

const thresholdValue = 10;
const aggregateValue = firstQuantity + secondQuantity;

const finalOutput = evaluationRules.find(rule => rule.test(aggregateValue, thresholdValue)).result(aggregateValue);

process.stdout.write(String(finalOutput) + '\n');