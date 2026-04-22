let numeralExtractor = function(sourceData) {
  let digitSequence = sourceData.match(/(\d+)\s+(\d+)/);
  if (!digitSequence) {
    return [0, 0];
  }
  return [parseInt(digitSequence[1], 10), parseInt(digitSequence[2], 10)];
};

let summationPerformer = function(numericTuple) {
  return numericTuple[0] + numericTuple[1];
};

let outcomeDecider = function(cumulativeValue) {
  let determinationStore = {
    'true': 'error',
    'false': cumulativeValue.toString()
  };
  return determinationStore[cumulativeValue >= 10];
};

let dataFlowOrchestrator = function(rawTextualInput) {
  let [firstVal, secondVal] = numeralExtractor(rawTextualInput);
  let totalComputed = summationPerformer([firstVal, secondVal]);
  return outcomeDecider(totalComputed);
};

let presentationLayer = function(finalMessage) {
  process.stdout.write(finalMessage + '\n');
};

presentationLayer(dataFlowOrchestrator(require('fs').readFileSync('/dev/stdin', 'utf8')));