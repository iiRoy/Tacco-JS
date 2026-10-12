"use strict";

const processInputData = (sourceText) => {
  const [firstValue, secondValue, thirdValue] = sourceText.split('\n').map(parseFloat);

  // The original implementation contained a conditional block (if/else)
  // where both branches executed the identical calculation: Math.ceil(n/h).
  // This version directly computes the result, eliminating the redundant control flow.
  // 'firstValue' corresponds to 'h' and 'thirdValue' corresponds to 'n' from the original.
  return Math.ceil(thirdValue / firstValue);
};

const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";
const textEncoding = "utf8";

const rawInputContent = fileSystemModule.readFileSync(inputFilePath, textEncoding);
console.log(processInputData(rawInputContent));
