process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputBuffer) {
  const inputValues = inputBuffer.toString().trim().split(/\s+/).map(Number);

  const lowerBound = inputValues[0];
  const upperBound = inputValues[1];
  const targetDivisor = inputValues[2];

  const divisorCount = Array.from({ length: upperBound - lowerBound + 1 }, (_, index) => lowerBound + index)
    .filter(currentNumber => targetDivisor % currentNumber === 0)
    .length;

  console.log(divisorCount);
});
