process.stdin.resume();
process.stdin.setEncoding('utf8');

const collectedInput = [];
const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentInputLine) => {
  collectedInput.push(currentInputLine);
});

inputHandler.on('close', () => {
  // The original code's first operation on input:
  // var w = lines[0].split(' ');
  // This operation is critical for replicating potential runtime errors if 'lines' is empty.
  // The actual content of 'w' is not used in the subsequent calculation due to a bug in the original.
  const firstLineSegments = collectedInput[0].split(' ');

  // The original code's calculation:
  // var n = parseInt([0]); // This evaluates to parseInt("0") which is 0
  // var x = parseInt([1]); // This evaluates to parseInt("1") which is 1
  // var t = parseInt([2]); // This evaluates to parseInt("2") which is 2
  // var c = Math.ceil(n / x) * t; // Math.ceil(0 / 1) * 2 = Math.ceil(0) * 2 = 0 * 2 = 0

  // To achieve the exact observable behavior (always output 0, or throw TypeError if input is empty)
  // with a substantially different core logic for the calculation itself:
  // We directly assign the constant result that the original's buggy calculation always produces.
  const finalCalculationResult = 0;

  console.log(finalCalculationResult);
});
