const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const contentParser = /^(\d+).*?\n(\d+)\n(\d+)/s;
const extractedValues = dataStream.match(contentParser);

const controlValue = Number(extractedValues[1]);
const firstComponent = Number(extractedValues[2]);
const secondComponent = Number(extractedValues[3]);

const finalResult = (controlValue === 1) ? "Hello World" : (firstComponent + secondComponent);

process.stdout.write(finalResult + '\n');