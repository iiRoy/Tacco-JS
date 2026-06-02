process.stdin.resume();
process.stdin.setEncoding('utf8');

function calculatePowerOfThree(baseNumber) {
  const powerExponent = 3;
  const computedResult = Math.pow(baseNumber, powerExponent);
  return computedResult;
}

process.stdin.on('data', function(incomingDataChunk){
  const rawInputString = incomingDataChunk;
  const numericValue = parseFloat(rawInputString);

  const cubedOutput = calculatePowerOfThree(numericValue);

  console.log(cubedOutput);
});
