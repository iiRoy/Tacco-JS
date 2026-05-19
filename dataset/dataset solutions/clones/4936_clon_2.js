process.stdin.resume();

process.stdin.setEncoding('utf8');

let inputRecords = [];

const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLineText) => {
  inputRecords.push(currentLineText);
});

inputProcessor.on('close', () => {
  const numericParams = inputRecords[0].split(' ');
  const totalItems = Number(numericParams[0]);
  const limitA = Number(numericParams[1]);
  const limitB = Number(numericParams[2]);

  let successfulCount = 0;
  let bSpecificCount = 1;

  const itemSequence = inputRecords[1].split('');

  for (let idx = 0; idx < totalItems; idx++) {
    switch (itemSequence[idx]) {
      case 'a':
        if (successfulCount < limitA + limitB) {
          console.log("Yes");
          successfulCount++;
        } else {
          console.log("No");
        }
        break;
      case 'b':
        if (successfulCount < limitA + limitB && limitB >= bSpecificCount) {
          console.log("Yes");
          successfulCount++;
          bSpecificCount++;
        } else {
          console.log("No");
        }
        break;
      case 'c':
        console.log("No");
        break;
    }
  }
});
