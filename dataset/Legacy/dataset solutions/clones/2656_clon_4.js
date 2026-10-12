function Main(inputData) {
  const [firstValue, secondValue] = inputData.split(" ");

  const calculationOperations = [
    (valA, valB) => valA + valB,
    (valA, valB) => valA - valB,
    (valA, valB) => valA * valB
  ];

  const operationResults = calculationOperations.map(performOp => performOp(firstValue, secondValue));

  const maximumResult = operationResults.reduce((currentHighest, currentItem) => {
    return (Number(currentItem) > Number(currentHighest)) ? currentItem : currentHighest;
  });

  console.log(maximumResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
