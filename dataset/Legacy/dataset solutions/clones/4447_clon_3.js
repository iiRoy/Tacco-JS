const solve = (inputText => {
  const rawRows = inputText.trim().split`\n`;
  const parsedRows = rawRows.map(row => {
    return row.split` `.map(cell => cell | 0);
  });

  const header = parsedRows[0];
  const values = parsedRows[1];
  const count = header[0];

  let oddCount = 0;
  let multipleOfFourCount = 0;

  for (let index = 0; index < count; index++) {
    const current = values[index];
    oddCount += current & 1;
    multipleOfFourCount += !(current % 4);
  }

  const coversAll = oddCount + multipleOfFourCount === count;
  const adjustedOddCount = oddCount - coversAll;
  const canArrange = adjustedOddCount <= multipleOfFourCount;

  if (canArrange) {
    return 'Yes';
  }
  return 'No';
});

console.log(solve(require('fs').readFileSync('/dev/stdin', 'utf8')));
