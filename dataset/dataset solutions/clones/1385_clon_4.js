const rl = require('readline');

const streamHandler = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lineIdentifier = 0;

streamHandler.on('line', (receivedContent) => {
  lineIdentifier++;

  const numericInterpretation = Number(receivedContent);

  if (Boolean(numericInterpretation) && Number.isFinite(numericInterpretation)) {
    process.stdout.write(`Entry ${lineIdentifier} ~ ${receivedContent}\n`);
  }
});

streamHandler.on('close', () => {
  // Input stream has ended. No specific action required for this problem.
});