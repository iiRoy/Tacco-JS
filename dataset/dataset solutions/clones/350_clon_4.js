let inputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (segment) => {
  inputBuffer += segment;
});
process.stdin.on('end', () => {
  const processedLines = inputBuffer.split('\n');
  solveAllEquations(processedLines);
});

function solveAllEquations(linesToProcess) {
  const equationPattern = /([0-9X]+)\+([0-9X]+)\=([0-9X]+)/;

  linesToProcess
    .filter(lineContent => lineContent.trim() !== '')
    .map(lineContent => {
      const matchResult = lineContent.match(equationPattern);
      const [, firstTermPattern, secondTermPattern, sumPattern] = matchResult;

      const possibleDigits = Array.from({ length: 10 }, (_, idx) => idx);

      const foundSolutionDigit = possibleDigits.find(candidateDigit => {
        const hasInvalidLeadingZero = candidateDigit === 0 &&
          ([firstTermPattern, secondTermPattern, sumPattern].some(
            patternPart => patternPart.length > 1 && patternPart.charAt(0) === 'X'
          ));

        if (hasInvalidLeadingZero) {
          return false;
        }

        const valA = Number.parseInt(firstTermPattern.replace(/X/g, candidateDigit), 10);
        const valB = Number.parseInt(secondTermPattern.replace(/X/g, candidateDigit), 10);
        const valC = Number.parseInt(sumPattern.replace(/X/g, candidateDigit), 10);

        return valA + valB === valC;
      });

      return foundSolutionDigit !== undefined ? foundSolutionDigit : 'NA';
    })
    .forEach(result => console.log(result));
}
