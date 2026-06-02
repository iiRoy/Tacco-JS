let rawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawData += chunk;
});
process.stdin.on('end', function() {
  processAllInput(rawData);
});

function processAllInput(fullInputText) {
  const inputLines = fullInputText.split('\n').filter(Boolean);

  const computedSolutions = inputLines.map(currentLine => {
    const equationParameters = currentLine.split(' ').map(Number);
    
    return determineSolution(equationParameters);
  });

  computedSolutions.forEach(solutionPair => {
    console.log(solutionPair[0].toFixed(3), solutionPair[1].toFixed(3));
  });
}

function determineSolution(param) {
  const [coeffA, coeffB, coeffC, coeffD, coeffE, coeffF] = param;

  const resultX = (coeffC * coeffE - coeffF * coeffB) / (coeffA * coeffE - coeffD * coeffB);

  const resultY = (coeffC - coeffA * resultX) / coeffB;

  return [resultX, resultY];
}
