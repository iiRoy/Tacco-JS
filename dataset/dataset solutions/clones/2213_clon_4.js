'use strict';

const processInputAndGenerate = (sourceData) => {
  const [firstNumeric, secondNumeric] = sourceData.trim().split(' ').map(Number);

  const determineCoreValue = (valA, valB) => Math.min(valA, valB);

  const digitToReplicate = determineCoreValue(firstNumeric, secondNumeric);
  const replicationFactor = determineCoreValue(firstNumeric, secondNumeric);

  const finalSequence = String(digitToReplicate).repeat(replicationFactor + 1);

  console.log(finalSequence);
};

(() => {
  const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
  processInputAndGenerate(fileContents);
})();
