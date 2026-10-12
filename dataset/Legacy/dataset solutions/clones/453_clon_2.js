process.stdin.resume();

process.stdin.setEncoding('utf8');

let rawData = '';

process.stdin.on('data', function (inputChunk) {
  rawData += inputChunk;
});

process.stdin.on('end', function () {
  const dataRows = rawData.split('\n');
  let lineIndex = 0;

  while (true) {
    let currentDebt = parseInt(dataRows[lineIndex++], 10);

    if (currentDebt === 0) {
      break;
    }

    let resultMonth = 'NA';

    for (let monthCounter = 0; monthCounter < 12; monthCounter++) {
      const monthlyValues = dataRows[lineIndex++].split(' ');
      currentDebt -= (parseInt(monthlyValues[0], 10) - parseInt(monthlyValues[1], 10));

      if (resultMonth === 'NA' && currentDebt <= 0) {
        resultMonth = monthCounter + 1;
      }
    }
    console.log(resultMonth);
  }
});
