const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const segments = inputData.split(/\s|,/);

const counts = {
  alpha: 0,
  beta: 0,
  omega: 0,
  delta: 0
};

const processedSegments = segments.filter((segmentValue, index) => {
  return index % 2 !== 0 && !!segmentValue;
});

processedSegments.forEach(segment => {
  switch (segment) {
    case 'A':
      counts.alpha++;
      break;
    case 'B':
      counts.beta++;
      break;
    case 'O':
      counts.omega++;
      break;
    default:
      counts.delta++;
      break;
  }
});

const lineBreakChar = '\n';
console.log(counts.alpha + lineBreakChar + counts.beta + lineBreakChar + counts.delta + lineBreakChar + counts.omega);
