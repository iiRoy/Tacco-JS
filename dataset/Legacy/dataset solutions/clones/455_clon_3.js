function processInputData() {
  let lineCursor = 0;
  const MONTHS_IN_YEAR = 12;

  while (true) {
    let currentCapacity = Number(inputLines[lineCursor++]);
    if (currentCapacity === 0) {
      break;
    }

    let monthFoundIndicator = true;
    for (let currentMonthIndex = 0; currentMonthIndex < MONTHS_IN_YEAR; currentMonthIndex++) {
      const lineContent = inputLines[lineCursor++];
      const parts = lineContent.split(' ');
      const monthlyFigures = parts.map(Number);

      const income = monthlyFigures[0];
      const expense = monthlyFigures[1];
      const netMonthlyBalance = income - expense;

      currentCapacity -= netMonthlyBalance;

      if (monthFoundIndicator && currentCapacity <= 0) {
        console.log(currentMonthIndex + 1);
        monthFoundIndicator = false;
      }
    }

    if (monthFoundIndicator) {
      console.log('NA');
    }
  }
}

let rawInputBuffer = '';
let inputLines;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  inputLines = rawInputBuffer.split('\n');
  processInputData();
});
