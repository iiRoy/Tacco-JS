var receivedDataBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  receivedDataBuffer += chunk;
});

process.stdin.on('end', function() {
  const inputLines = receivedDataBuffer.split("\n");
  let currentLineIdx = 0;

  function calculateValidCombinations(upperBoundN, targetSumX) {
    let combinationCount = 0;

    for (let firstNum = 1; firstNum <= upperBoundN - 2; firstNum++) {
      for (let secondNum = firstNum + 1; secondNum <= upperBoundN - 1; secondNum++) {
        for (let thirdNum = secondNum + 1; thirdNum <= upperBoundN; thirdNum++) {
          if (firstNum + secondNum + thirdNum === targetSumX) {
            combinationCount++;
          }
        }
      }
    }
    return combinationCount;
  }

  while (true) {
    const currentLine = inputLines[currentLineIdx];

    if (currentLine === undefined || currentLine.trim() === "") {
      break;
    }

    const currentLineParts = currentLine.split(" ");
    const N_val = parseInt(currentLineParts[0], 10);
    const X_val = parseInt(currentLineParts[1], 10);

    if (N_val === 0 && X_val === 0) {
      break;
    }

    const resultCount = calculateValidCombinations(N_val, X_val);
    console.log(resultCount);

    currentLineIdx++;
  }
});
