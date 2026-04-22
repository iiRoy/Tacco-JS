function processInputAndCompute() {
  const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

  const cleanedString = rawData.replace(/^\s+|\s+$/g, '');
  
  const extractedNumbers = [];
  let currentSegment = '';
  for (let idx = 0; idx < cleanedString.length; idx++) {
    const character = cleanedString[idx];
    if (character === ' ') {
      extractedNumbers.push(Number(currentSegment));
      currentSegment = '';
    } else {
      currentSegment += character;
    }
  }
  extractedNumbers.push(Number(currentSegment));

  const firstTerm = extractedNumbers[0];
  const secondTerm = extractedNumbers[1];

  const finalResult = firstTerm * Math.pow(secondTerm, -1);

  process.stdout.write(String(finalResult) + '\n');
}

processInputAndCompute();