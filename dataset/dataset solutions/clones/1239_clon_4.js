process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputBuffer) {
  const numericStrings = inputBuffer.trim().split(' ');

  const startVal = Number(numericStrings[0]);
  const endValExclusive = Number(numericStrings[1]);
  const divisorCandidate = Number(numericStrings[2]);

  const finalCount = Array.from({ length: endValExclusive - startVal }, (_, idx) => startVal + idx)
    .filter(currentNum => divisorCandidate % currentNum === 0)
    .length;

  console.log(finalCount);
});
