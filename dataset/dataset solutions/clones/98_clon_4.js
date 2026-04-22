const acquireUtility = require('readline');
let shouldContinueProcessing = true;
const streamHandler = acquireUtility.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
streamHandler.on('line', (incomingData) => {
  if (!shouldContinueProcessing) {
    return;
  }
  const numericalValue = Number(incomingData);
  if (!numericalValue) {
    shouldContinueProcessing = false;
    streamHandler.close();
    return;
  }
  const computedResult = Math.floor(numericalValue * numericalValue / 98 + 2);
  process.stdout.write(computedResult.toString() + '\n');
});
streamHandler.on('close', () => {
  // No explicit action needed upon stream closure for this problem.
});