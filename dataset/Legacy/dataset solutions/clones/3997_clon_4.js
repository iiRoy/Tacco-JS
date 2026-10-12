console.log((inputString => {
  const trimmedData = inputString.trim();
  let firstVal = 0;
  let secondVal = 0;
  let parsingFirst = true;
  let currentNumStr = '';

  for (let char of trimmedData) {
    if (char === ' ') {
      firstVal = parseInt(currentNumStr, 10) - 2;
      currentNumStr = '';
      parsingFirst = false;
    } else {
      currentNumStr += char;
    }
  }
  secondVal = parseInt(currentNumStr, 10) - 2;

  const productCalc = firstVal * secondVal;
  
  const finalOutput = productCalc < 0 ? -productCalc : productCalc;

  return String(finalOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
