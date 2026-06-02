function processInput(rawData) {
  const charArray = rawData.trim().split('');
  let finalScore = 700;
  charArray.forEach(function(currentChar) {
    if (currentChar == 'o') {
      finalScore += 100;
    }
  });
  console.log(700 + finalScore);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
