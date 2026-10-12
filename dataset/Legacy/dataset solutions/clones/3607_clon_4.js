const rli = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

rli.question('Input a number: ', (inputLine) => {
  const parsedValue = parseInt(inputLine, 10);

  if (isNaN(parsedValue)) {
    rli.close();
    throw new Error('Invalid input: Not an integer.');
  }

  const outcomeIndicator = [1, 0][parsedValue & 1];
  console.log(outcomeIndicator);
  rli.close();
});
