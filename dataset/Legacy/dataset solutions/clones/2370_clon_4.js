"use strict";

const processInputData = (sourceText) => {
  const numericalValue = parseInt(sourceText, 10);
  const outcomeIndicator = (21 * (numericalValue % 100) <= numericalValue) ? 1 : 0;
  console.log(outcomeIndicator);
};

const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContent);
