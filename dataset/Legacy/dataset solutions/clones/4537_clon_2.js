function ProcessInput( rawData ) {
  let parsedLines = rawData.split('\n');
  const numberStrings = parsedLines[0].split(' ');
  let firstVal = Number(numberStrings[0]);
  let secondVal = Number(numberStrings[1]);
  if (firstVal + secondVal >= 10) {
    console.log('error');
  } else {
    console.log(firstVal + secondVal);
  }
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
