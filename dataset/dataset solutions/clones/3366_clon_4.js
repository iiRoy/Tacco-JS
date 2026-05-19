process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', (dataSegment) => {
    inputBuffer += dataSegment;
});
process.stdin.on('end', () => {
    const lineCollection = inputBuffer.split(/\r?\n/);
    processData(lineCollection);
});

function processData(lines){
  const combinedText = Array.prototype.join.call(lines, ',');
  const foundDigits = Array.from(combinedText).reduce((accumulator, currentCharacter) => {
    if (currentCharacter === '2') {
      accumulator.push('2');
    }
    return accumulator;
  }, []);

  console.log(foundDigits);
  console.log(foundDigits.length);
}
