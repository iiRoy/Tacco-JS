function processInputData() {
  const OCTAL_RADIX_BASE = 8;
  const DECIMAL_PARSE_RADIX = 10;
  const CUSTOM_DIGIT_MAP_SEQUENCE = '01235789';

  const getCustomMappedDigit = (octalDigitChar) => {
    return CUSTOM_DIGIT_MAP_SEQUENCE.charAt(Number(octalDigitChar));
  };

  const transformAndMapNumber = (decimalValue) => {
    const octalStringRepresentation = decimalValue.toString(OCTAL_RADIX_BASE);
    const individualOctalChars = octalStringRepresentation.split('');
    const mappedCharacters = individualOctalChars.map(getCustomMappedDigit);
    return mappedCharacters.join('');
  };

  let currentInputNumber;

  for (;;) {
    const rawLineFromInput = inputLines.shift();

    currentInputNumber = parseInt(rawLineFromInput, DECIMAL_PARSE_RADIX);

    if (currentInputNumber === 0) {
      break;
    }

    const finalOutputString = transformAndMapNumber(currentInputNumber);
    console.log(finalOutputString);
  }
}

let inputAccumulator = '';
let inputLines = [];

(function initializeStandardInputHandler() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(dataSegment) {
    inputAccumulator += dataSegment;
  });

  process.stdin.on('end', function() {
    inputLines = inputAccumulator.split('\n');
    processInputData();
  });
})();
