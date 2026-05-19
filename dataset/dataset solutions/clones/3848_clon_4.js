var inputInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputInterface.on('line', function(currentLine) {
  calculateResult(currentLine);
});

function calculateResult(dataString) {
  const parsedValues = dataString.split(' ');
  const mVal = parseInt(parsedValues[0]);
  const dVal = parseInt(parsedValues[1]);

  let computedValue;

  const mValid = mVal >= 1 && mVal <= 12;
  const dValid = dVal >= 1 && dVal <= 31;

  if (!mValid || !dValid) {
    computedValue = 0;
  } else {
    computedValue = Math.min(mVal, dVal);
  }

  console.log(computedValue);
}
