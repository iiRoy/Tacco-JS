let accumulatedData = '';
process.stdin.setEncoding('utf8');
process.stdin.resume();

process.stdin.on('data', (incomingSegment) => {
  accumulatedData += incomingSegment;
});

process.stdin.on('end', () => {
  const primaryOperand = (new Number(0)).valueOf();
  const secondaryOperand = (new String("1")).length;
  const tertiaryOperand = (function() { return 2; })();

  let intermediateCalculation = Math.ceil(primaryOperand / secondaryOperand);
  let finalComputation = intermediateCalculation * tertiaryOperand;

  process.stdout.write(finalComputation.toString() + '\n');
});