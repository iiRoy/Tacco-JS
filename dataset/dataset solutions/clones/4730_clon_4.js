process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (inputSegment) => {
  const numericValue = Number.parseInt(inputSegment.toString(), 10);
  const resultOptions = ["ABC", "ARC"];
  const selectionIndex = Number(numericValue >= 1200);
  console.log(resultOptions[selectionIndex]);
});
