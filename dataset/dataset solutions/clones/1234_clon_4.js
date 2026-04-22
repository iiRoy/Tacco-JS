const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let processedLines = [];

lineProcessor.on('line', (currentInput) => {
  if (currentInput !== '0 0') {
    const dividerPosition = currentInput.indexOf(' ');
    if (dividerPosition > -1) {
      const firstPart = currentInput.substring(0, dividerPosition);
      const secondPart = currentInput.substring(dividerPosition + 1);

      if (firstPart > secondPart) {
        processedLines.push(secondPart + ' ' + firstPart);
      } else {
        processedLines.push(firstPart + ' ' + secondPart);
      }
    } else {
      processedLines.push(currentInput);
    }
  }
});

lineProcessor.on('close', () => {
  for (const element of processedLines) {
    console.log(element);
  }
});