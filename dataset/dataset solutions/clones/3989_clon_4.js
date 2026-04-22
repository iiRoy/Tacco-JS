const runApplication = (rawInput) => {
  const performCalculation = (dataString) => {
    const numberPair = dataString.split(' ').map(Number);
    const [firstNumber, secondNumber] = numberPair;

    const finalOutcome = (firstNumber - 2) * (secondNumber - 2);

    console.log(finalOutcome);
  };

  performCalculation(rawInput);
};

runApplication(require("fs").readFileSync("/dev/stdin", "utf8"));