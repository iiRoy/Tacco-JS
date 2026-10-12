process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(rawData) {
  let inputLines = rawData.split("\n");

  while (inputLines[0] !== '0') {
    const currentBlock = inputLines.splice(0, 5);

    let outcomeScores;
    const uniqueValues = [];

    currentBlock.forEach(function (item) {
      if (uniqueValues.indexOf(item) < 0) {
        uniqueValues.push(item);
      }
    });

    if (uniqueValues.length === 3 || uniqueValues.length === 1) {
      outcomeScores = [3, 3, 3];
    } else {
      // Note: uniqueValues contains strings (e.g., '1', '2').
      // The original code uses indexOf(number), which will return -1
      // if the array contains string representations of those numbers.
      // This specific behavior is preserved.
      if (uniqueValues.indexOf(1) < 0) {
        outcomeScores = [1, 2, 0];
      } else if (uniqueValues.indexOf(2) < 0) {
        outcomeScores = [2, 0, 1];
      } else if (uniqueValues.indexOf(3) < 0) {
        outcomeScores = [0, 1, 2];
      }
    }

    currentBlock.forEach(function (val) {
      console.log(outcomeScores[parseInt(val, 10) - 1]);
    });
  }
});

process.stdin.on('end', function() {
  // No specific actions are performed here in the original code.
});
