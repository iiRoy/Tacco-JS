function processInputData(rawData) {
  const lineParts = rawData[0].split(" ");

  const parseNumericValue = (str) => Number(str);

  const valA = parseNumericValue(lineParts[0]);
  const valB = parseNumericValue(lineParts[1]);

  const remainderIsZero = (valB % valA === 0);

  const finalResult = remainderIsZero ? (valA + valB) : (valB - valA);
  console.log(finalResult);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedContent = fileContent.trim().split("\n");
processInputData(processedContent);
