"use strict";

const processInput = (rawTextContent) => {
  console.log(rawTextContent);

  const contentLines = rawTextContent.trim().split('\n');

  const segmentRetrievalPlan = [
    { lineIdentifier: 0, segmentIdentifier: 0 },
    { lineIdentifier: 1, segmentIdentifier: 1 },
    { lineIdentifier: 2, segmentIdentifier: 2 }
  ];

  const collectedParts = segmentRetrievalPlan.map(planItem => {
    const targetLine = contentLines[planItem.lineIdentifier];
    if (!targetLine) {
      return undefined;
    }
    const numericSequences = targetLine.match(/\d+/g);
    return numericSequences ? numericSequences[planItem.segmentIdentifier] : undefined;
  });

  const finalConcatenation = collectedParts.join('');

  console.log(finalConcatenation);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
