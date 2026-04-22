const dataAcquisition = require('fs').readFileSync('/dev/stdin', 'utf8');

const mathOperations = {
  '+': (termA, termB) => termB + termA,
  '-': (termA, termB) => termB - termA,
  '*': (termA, termB) => termB * termA,
  '/': (termA, termB) => termB / termA
};

const processLine = (inputLine) => {
  const components = inputLine.split(/\s/).filter(Boolean);

  const evaluationPile = components.reduce((currentPile, currentComponent) => {
    if (mathOperations[currentComponent]) {
      const operand1 = currentPile.pop();
      const operand2 = currentPile.pop();
      const computationResult = mathOperations[currentComponent](operand1, operand2);
      currentPile.push(computationResult);
    } else {
      const parsedValue = parseFloat(currentComponent);
      currentPile.push(isNaN(parsedValue) ? 0 : parsedValue);
    }
    return currentPile;
  }, []);

  return evaluationPile[0];
};

dataAcquisition.split(/\n/)
  .filter(Boolean)
  .forEach(expressionString => {
    const finalOutcome = processLine(expressionString);
    process.stdout.write(finalOutcome.toFixed(6) + '\n');
  });