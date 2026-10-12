const calculateSequenceEffect = (operationString) => {
  const finalState = Array.from(operationString).reduce(
    (accumulator, currentOperation) => {
      let { currentBalance, lastPositiveBalance } = accumulator;

      switch (currentOperation) {
        case 'I':
          currentBalance++;
          lastPositiveBalance = currentBalance;
          break;
        case 'D':
          currentBalance--;
          break;
      }

      return { currentBalance, lastPositiveBalance };
    },
    { currentBalance: 0, lastPositiveBalance: 0 }
  );

  return finalState.lastPositiveBalance;
};

const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

inputReader.question('', (receivedLine) => {
  calculateSequenceEffect(receivedLine);
  inputReader.close();
});
