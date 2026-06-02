process.stdin.resume();
process.stdin.setEncoding('utf8');
const inputBuffer = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

inputReader.on('close', () => {
  // The original code's parseInt([0]), parseInt([1]), parseInt([2])
  // effectively parses the string representation of the array indices,
  // resulting in n=0, x=1, t=2, regardless of the actual input line.
  // We replicate this exact observable behavior by deriving these
  // constant values using a different mechanism.

  const firstParam = Number.parseInt(String.fromCharCode(48)); // ASCII '0' is 48, parses to 0
  const secondParam = Number.parseInt(String.fromCharCode(49)); // ASCII '1' is 49, parses to 1
  const thirdParam = Number.parseInt(String.fromCharCode(50)); // ASCII '2' is 50, parses to 2

  // The core calculation remains mathematically equivalent to the original:
  // Math.floor(n / x + 1) * t
  const resultValue = Math.floor(firstParam / secondParam + 1) * thirdParam;

  console.log(resultValue);
});
