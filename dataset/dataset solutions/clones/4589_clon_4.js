process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedData = '';

process.stdin.on('data', (chunk) => {
  collectedData += chunk;
});

process.stdin.on('end', () => {
  const numericElements = collectedData.trim().split(/\s+/).map(val => parseInt(val, 10));

  const [valOne, valTwo, valThree] = numericElements;

  const areHomogeneous = (tuple) => tuple[0] === tuple[1] && tuple[1] === tuple[2];

  const containsOdd = (tuple) => tuple[0] % 2 !== 0 || tuple[1] % 2 !== 0 || tuple[2] % 2 !== 0;

  const transformTuple = (currentTuple) => {
    const [alpha, beta, gamma] = currentTuple;
    return [
      (beta + gamma) / 2,
      (alpha + gamma) / 2,
      (beta + alpha) / 2
    ];
  };

  const recurseForSteps = (currentTuple, stepCounter) => {
    if (containsOdd(currentTuple)) {
      return stepCounter;
    } else {
      const nextTuple = transformTuple(currentTuple);
      return recurseForSteps(nextTuple, stepCounter + 1);
    }
  };

  if (areHomogeneous([valOne, valTwo, valThree])) {
    process.stdout.write("-1\n");
  } else {
    const totalSteps = recurseForSteps([valOne, valTwo, valThree], 0);
    process.stdout.write(totalSteps.toString() + "\n");
  }
});