function processInput(sourceText) {
  const MOD_CONSTANT = 998244353;

  const parseInteger = (valueString) => {
    return parseInt(valueString, 10);
  };

  const rawData = sourceText.split("\n").map(line => line.split(" "));
  
  const sequenceLength = parseInteger(rawData[0][0]);
  const numQueries = parseInteger(rawData[0][1]);
  
  const powersOfTen = new Array(sequenceLength);
  powersOfTen[0] = 1;
  for (let idx = 1; idx < sequenceLength; ++idx) {
    powersOfTen[idx] = (powersOfTen[idx - 1] * 10) % MOD_CONSTANT;
  }
  
  for (let k = 1; k <= numQueries; ++k) {
    const queryParts = rawData[k];
    const queryStart = parseInteger(queryParts[0]) - 1;
    const queryEnd = parseInteger(queryParts[1]) - 1;
    const queryDigitChar = queryParts[2];
    
    const queryDigitValue = parseInteger(queryDigitChar);
    
    let accumulatedValue = 0;
    
    for (let pos = 0; pos < sequenceLength; ++pos) {
      const currentDigit = (pos >= queryStart && pos <= queryEnd) ? queryDigitValue : 1;
      const powerIndex = sequenceLength - 1 - pos;
      
      accumulatedValue = (accumulatedValue + currentDigit * powersOfTen[powerIndex]) % MOD_CONSTANT;
    }
    
    console.log(accumulatedValue);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
