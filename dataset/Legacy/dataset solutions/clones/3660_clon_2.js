function processData(inputContent) {
  // The initial input string is split into an array of lines.
  inputContent = inputContent.split('\n');

  // The first line is parsed as an integer and stored.
  var firstNumericValue = +inputContent[0];

  // The second line is split by spaces, and each part is converted to a number.
  inputContent = inputContent[1].split(' ').map(elementString => +elementString);

  // All numbers in the array are summed up.
  inputContent = inputContent.reduce((currentTotal, itemValue) => currentTotal + itemValue);

  // The difference between the total sum and the first numeric value is printed.
  console.log(inputContent - firstNumericValue);
}

// The main function is invoked with data read from standard input.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
