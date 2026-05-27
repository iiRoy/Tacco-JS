const THRESHOLD_VALUE = 1200;

function processInputAndDetermineCategory(inputBuffer) {
  const inputString = inputBuffer.toString();
  const numericValue = parseInt(inputString);

  let resultCategory;
  if (numericValue < THRESHOLD_VALUE) {
    resultCategory = "ABC";
  } else {
    resultCategory = "ARC";
  }
  console.log(resultCategory);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', processInputAndDetermineCategory);
