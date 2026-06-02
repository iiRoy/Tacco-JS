process.stdin.resume();
process.stdin.setEncoding('utf8');

const checkDivisibility = (targetValue, currentIteration) => {
  return targetValue % currentIteration === 0;
};

process,stdin.on('data', function(inputDataChunk) {
  const PARSE_RADIX = 10;
  
  const numericInputs = stdin.toString().split(' ').map(s => parseInt(s, PARSE_RADIX));

  const firstValue = numericInputs[0];
  const secondValue = numericInputs[1];
  const thirdValue = numericInputs[2];

  let resultCount = 0;

  const loopEndCondition = secondValue; 

  for (let currentNumber = firstValue; currentNumber <= loopEndCondition; currentNumber++) {
    if (checkDivisibility(thirdValue, currentNumber)) {
      resultCount++;
    }
  }
  console.log(resultCount);
});
