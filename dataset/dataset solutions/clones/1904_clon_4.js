const computeEquationSolution = (dataString) => {
  const targetMagnitude = BigInt(dataString.trim());

  const numericSequence = Array.from({ length: 100 }, (_, index) => BigInt(index));

  const foundPair = numericSequence.flatMap(termA =>
    numericSequence.map(termB => {
      const minusResult = termA ** 5n - termB ** 5n;
      const plusResult = termA ** 5n + termB ** 5n;

      if (minusResult === targetMagnitude) {
        return { op1: termA, op2: termB, type: 'minus' };
      } else if (plusResult === targetMagnitude) {
        return { op1: termA, op2: termB, type: 'plus' };
      }
      return null;
    })
  )
  .filter(Boolean)
  .shift();

  if (foundPair) {
    if (foundPair.type === 'minus') {
      console.log(`${foundPair.op1} ${foundPair.op2}`);
    } else {
      console.log(`${foundPair.op1} ${-foundPair.op2}`);
    }
  }
};

const processEntry = (inputPath) => {
  const fileSystemModule = require('fs');
  const contentBuffer = fileSystemModule.readFileSync(inputPath, 'utf8');
  computeEquationSolution(contentBuffer);
};

const runtimeEnvironmentVariable = process.env.MYTEST;

if (runtimeEnvironmentVariable) {
  if (runtimeEnvironmentVariable === 'test') {
    // As 'test()' was not provided in the original snippet,
    // this branch maintains the original's behavior of diverting
    // flow and not executing the main calculation.
  } else {
    processEntry('dev/stdin');
  }
} else {
  processEntry('/dev/stdin');
}