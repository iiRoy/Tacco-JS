function processData(incomingPayload) {
  const parts = incomingPayload.trim().split(" ");
  const valA = Number(parts[0]);
  const valB = Number(parts[1]);

  const factorForMultiplication = valB - 1;
  const numberOfMultiplications = Math.max(0, valA - 1);

  const multiplierSequence = Array(numberOfMultiplications).fill(factorForMultiplication);

  const finalOutcome = multiplierSequence.reduce((accumulator, currentElement) => accumulator * currentElement, valB);

  console.log(finalOutcome);
}

function orchestrateExecution() {
  const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  processData(rawInputContent);
}

orchestrateExecution();