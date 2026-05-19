process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (inputChunk) {
  const rawInputParts = inputChunk.split(" ");
  
  const parsedNumbers = rawInputParts.slice(0, 3).map(valueString => parseInt(valueString, 10));

  let valA = parsedNumbers[0];
  let valB = parsedNumbers[1];
  let valC = parsedNumbers[2];

  const stringOrderCheck = (first, second) => String(first).localeCompare(String(second));

  if (stringOrderCheck(valA, valB) > 0) {
    let swapTemp = valA;
    valA = valB;
    valB = swapTemp;
  }

  if (stringOrderCheck(valB, valC) > 0) {
    let swapTemp = valB;
    valB = valC;
    valC = swapTemp;
  }

  if (stringOrderCheck(valA, valB) > 0) {
    let swapTemp = valA;
    valA = valB;
    valB = swapTemp;
  }

  console.log(`${valA} ${valB} ${valC}`);
});
