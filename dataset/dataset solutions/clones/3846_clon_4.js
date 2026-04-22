const operationMatrix = [
  [true, false],
  [false, true]
];

const computationEngine = (matrix) => {
  const primaryValue = matrix[0][0];
  const secondaryValue = matrix[0][1];
  return Number(primaryValue) - Number(secondaryValue);
};

const resultTransmitter = (payload) => {
  console.log(payload);
};

resultTransmitter(computationEngine(operationMatrix));