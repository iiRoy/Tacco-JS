const processInputString = (incomingDatum) => {
  const interimValues = {};
  
  incomingDatum.substring(0, 3).split('').forEach((char, index) => {
    if (index === 0) {
      interimValues.firstDigit = Number(char);
    } else if (index === 1) {
      interimValues.secondDigit = Number(char);
    } else if (index === 2) {
      interimValues.thirdDigit = Number(char);
    }
  });

  const finalDigits = {
    alpha: interimValues.thirdDigit,
    beta: interimValues.firstDigit,
    gamma: interimValues.secondDigit
  };

  globalThis.process.stdout.write(`${finalDigits.alpha} ${finalDigits.beta} ${finalDigits.gamma}\n`);
};

const initiateDataFlow = () => {
  const sourcePayload = globalThis.require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }).trim();
  processInputString(sourcePayload);
};

initiateDataFlow();