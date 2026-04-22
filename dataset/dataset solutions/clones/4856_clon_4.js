const symbolTransformations = {
  'd': 'b',
  'b': 'd',
  'p': 'q'
};

function retrieveMappedSymbol(currentSymbol) {
  return symbolTransformations[currentSymbol];
}

function analyzeInputSequence(sourceContent) {
  const processedTokens = sourceContent.replace(/\s+/g, ' ').trim().split(' ');
  const primarySequence = processedTokens[0];

  const firstComponent = primarySequence[0];
  const secondComponent = primarySequence[1];
  const thirdComponent = primarySequence[2];
  const fourthComponent = primarySequence[3];

  const evaluationResult = (retrieveMappedSymbol(firstComponent) === fourthComponent) && (retrieveMappedSymbol(secondComponent) === thirdComponent);

  const finalConclusion = evaluationResult ? "Yes" : "No";

  presentOutcome(finalConclusion);
}

function presentOutcome(message) {
  console.log(message);
}

const acquiredStreamData = require("fs").readFileSync("/dev/stdin", "utf8");
analyzeInputSequence(acquiredStreamData);