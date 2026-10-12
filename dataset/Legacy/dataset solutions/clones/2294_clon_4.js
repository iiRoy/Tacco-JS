function processInputAndCompute(dataString) {
  const [firstEntityHoldings, secondEntityHoldings, depletionQuantity] = dataString.trim().split(/\s+/).map(Number);

  const consumedFromFirst = Math.min(firstEntityHoldings, depletionQuantity);
  const remainingFirst = firstEntityHoldings - consumedFromFirst;
  const remainingDepletion = depletionQuantity - consumedFromFirst;
  const remainingSecond = secondEntityHoldings - remainingDepletion;

  console.log(remainingFirst, remainingSecond);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
