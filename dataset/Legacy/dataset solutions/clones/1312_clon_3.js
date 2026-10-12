let inputDataAccumulator = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');

const DECIMAL_RADIX = 10;

function calculateDigitSum(lineString) {
  const digitCharacters = lineString.split('');
  const digitValues = digitCharacters.map(digitCharacter =>
    parseInt(digitCharacter, DECIMAL_RADIX)
  );
  const lineTotal = digitValues.reduce((sumAccumulator, currentDigitValue) =>
    sumAccumulator + currentDigitValue
  );
  return lineTotal;
}

process.stdin.on('data', dataChunk => {
  inputDataAccumulator.push(dataChunk);
});

process.stdin.on('end', () => {
  const fullInputContent = inputDataAccumulator.join('');
  const trimmedContent = fullInputContent.trim();
  const allInputSegments = trimmedContent.split('\n');
  
  const processedLineSegments = allInputSegments.slice(0, -1);

  const calculatedSums = processedLineSegments.map(currentLineString =>
    calculateDigitSum(currentLineString)
  );

  console.log(calculatedSums.join('\n'));
});
