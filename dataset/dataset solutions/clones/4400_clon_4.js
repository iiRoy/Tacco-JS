'use strict'

const determineSuccessorSymbol = (inputSequence) => {
  if (inputSequence.length === 0) {
    return 'a';
  }

  const numericRepresentations = Array.from(inputSequence, (char) => char.charCodeAt(0));
  const minimumNumericValue = Math.min(...numericRepresentations);

  let outputDesignation;
  if (minimumNumericValue === 'z'.charCodeAt(0)) {
    outputDesignation = 'None';
  } else {
    outputDesignation = String.fromCharCode(minimumNumericValue + 1);
  }

  return outputDesignation;
};

(function() {
  const receivedContent = require("fs").readFileSync("/dev/stdin", "utf8");
  const trimmedContent = receivedContent.trim();
  const calculatedOutcome = determineSuccessorSymbol(trimmedContent);
  console.log(calculatedOutcome);
})();