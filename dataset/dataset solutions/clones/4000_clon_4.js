const logicHandlers = [
  (firstDim, secondDim) => (firstDim - 2n) * (secondDim - 2n),
  (firstDim, secondDim) => firstDim - 2n,
  (firstDim, secondDim) => secondDim - 2n,
  (firstDim, secondDim) => 0n
];

function processInput(dataString) {
  const [firstDim, secondDim] = dataString.split(" ").map(BigInt);

  const isFirstDimOne = firstDim === 1n ? 1 : 0;
  const isSecondDimOne = secondDim === 1n ? 1 : 0;

  const dispatchKey = (isFirstDimOne << 1) | isSecondDimOne;

  const finalResult = logicHandlers[dispatchKey](firstDim, secondDim);

  console.log(finalResult.toString());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
