function processNumericInput(rawInputContent) {
  const inputSegments = rawInputContent.split(' ');
  const firstValueStr = inputSegments[0];
  const secondValueStr = inputSegments[1];
  const parsedNumA = Number(firstValueStr);
  const parsedNumB = Number(secondValueStr);
  const calculatedResult = parsedNumA * parsedNumB;
  console.log(calculatedResult);
}
const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processNumericInput(stdinContent);
