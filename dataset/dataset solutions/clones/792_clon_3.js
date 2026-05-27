const fileSystemModule = require('fs');

const standardInputFileDescriptor = process.stdin.fd;
const fileStats = fileSystemModule.fstatSync(standardInputFileDescriptor);
const fileSizeInBytes = fileStats.size;

const inputBuffer = Buffer.alloc(fileSizeInBytes);

const actualBytesRead = fileSystemModule.readSync(
  standardInputFileDescriptor,
  inputBuffer,
  0,
  fileSizeInBytes,
  0
);

const rawInputString = inputBuffer.toString('utf8', 0, actualBytesRead);
const inputLines = rawInputString.split('\n');

let currentInputVal;

function calculateMinimumSum(targetValue) {
  let minSum = Infinity;

  for (let zCubeRoot = 0; ; zCubeRoot++) {
    const zCubed = zCubeRoot * zCubeRoot * zCubeRoot;
    if (zCubed > targetValue) {
      break;
    }

    const remainingForYSquare = targetValue - zCubed;

    for (let ySquareRoot = 0; ; ySquareRoot++) {
      const ySquared = ySquareRoot * ySquareRoot;
      if (ySquared > remainingForYSquare) {
        break;
      }

      const remainingValue = remainingForYSquare - ySquared;

      const currentCombinationSum = remainingValue + zCubeRoot + ySquareRoot;

      if (currentCombinationSum < minSum) {
        minSum = currentCombinationSum;
      }
    }
  }
  return minSum;
}

while (true) {
  const shiftedValue = inputLines.shift();
  currentInputVal = +shiftedValue;

  if (currentInputVal === 0) {
    break;
  }

  const calculatedResult = calculateMinimumSum(currentInputVal);
  console.log(calculatedResult);
}
