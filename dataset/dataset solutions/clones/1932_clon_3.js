const handleInputData = (inputLines) => {
  const firstLineParts = inputLines[0].split(' ');
  const numN = parseInt(firstLineParts[0], 10);
  let numM = parseInt(firstLineParts[1], 10);

  const isNOdd = (numN % 2) !== 0;

  if (isNOdd) {
    let currentEnd = numN - 1;
    let currentStart = 1;
    for (let iterationCount = 0; iterationCount < numM; iterationCount++) {
      console.log(`${currentStart++} ${currentEnd--}`);
    }
  } else {
    const halfNValue = numN / 2;
    let currentEnd = halfNValue + 1;
    let currentStart = halfNValue;
    for (let iterationCount = 0; iterationCount < numM; iterationCount++) {
      console.log(`${currentStart--} ${currentEnd++}`);
    }
  }
};

let inputBuffer = '';
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});
process.stdin.on('end', () => {
  const { EOL: endOfLineChar } = require('os');
  const linesArray = inputBuffer.split(endOfLineChar);
  handleInputData(linesArray);
});
