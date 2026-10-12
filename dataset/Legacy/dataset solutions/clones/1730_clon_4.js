const readline = require('readline');
const util = require('util');

const bufferedLines = [];

readline.createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', (line) => {
  bufferedLines.push(line);
}).on('close', () => {
  console.error('\n');
  const startedAt = Date.now();
  solveFromLines(bufferedLines);
  const elapsed = Date.now() - startedAt;
  debugLog('time : ' + elapsed + 'ms');
  debugLog('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function readLeadingInteger(lines) {
  if (lines.length === 0) {
    throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
  }
  return parseInt(lines[0]);
}

function debugLog(value) {
  console.error('debug:' + util.inspect(value, false, null));
}

function solveFromLines(lines) {
  const limit = readLeadingInteger(lines);
  let total = 0;

  if (limit >= 1) {
    const divisorsPerNumber = Object.create(null);

    let divisor = 1;
    while (divisor <= limit) {
      let multiple = divisor;
      while (multiple <= limit) {
        divisorsPerNumber[multiple] = (divisorsPerNumber[multiple] || 0) + 1;
        multiple += divisor;
      }
      divisor++;
    }

    let number = 1;
    while (number <= limit) {
      total += number * (divisorsPerNumber[number] || 0);
      number++;
    }
  }

  console.log(total);
}
