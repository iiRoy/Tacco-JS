const analyzeSequence = (dataPacket) => {
  const parts = dataPacket.trim().split(' ');
  const valueA = parseInt(parts[0], 10);
  const valueB = parseInt(parts[1], 10);
  const valueK = parseInt(parts[3], 10);
  let currentAccumulator = 0;
  let itemsToGather = valueK;
  const positiveSelection = Math.min(itemsToGather, valueA);
  currentAccumulator += positiveSelection;
  itemsToGather -= positiveSelection;
  const neutralSelection = Math.min(itemsToGather, valueB);
  itemsToGather -= neutralSelection;
  currentAccumulator -= itemsToGather;
  return currentAccumulator;
};
const runComputation = (inputSource) => {
  const inputPayload = require('node:fs').readFileSync(inputSource, 'utf8');
  const finalOutcome = analyzeSequence(inputPayload);
  process.stdout.write(finalOutcome.toString() + '\n');
};
runComputation(0);