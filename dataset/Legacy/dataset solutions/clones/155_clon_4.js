const fs = require('fs');
const entireInputContent = fs.readFileSync('/dev/stdin', 'utf8');

const processedLines = entireInputContent.trim().split('\n');

function analyzeCardHands() {
  processedLines.forEach(currentLine => {
    const numericValues = currentLine.trim().split(',').map(Number);

    const valueFrequencies = new Map();
    numericValues.forEach(val => {
      valueFrequencies.set(val, (valueFrequencies.get(val) || 0) + 1);
    });

    let evaluationOutcome = "null";

    const hasFourOfAKind = Array.from(valueFrequencies.values()).some(count => count >= 4);

    if (hasFourOfAKind) {
      evaluationOutcome = "four card";
    }

    console.log(evaluationOutcome);
  });
}

analyzeCardHands();
