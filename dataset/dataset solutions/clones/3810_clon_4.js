function processDataStream(incomingPayload) {
  const structurePattern = /(\d+)\s+(\d+)\s+(\d+)\s+([a-zA-Z0-9]+)/;
  const extractedElements = incomingPayload.match(structurePattern);

  const operandA = Number(extractedElements[1]);
  const operandB = Number(extractedElements[2]);

  const controlSequence = extractedElements[4];

  const ultimateCharacter = controlSequence.slice(-1);
  const decisionValue = parseInt(ultimateCharacter);

  const operationMultiplierMap = new Map([[0, 1], [1, -1]]);
  const finalMultiplier = operationMultiplierMap.get(decisionValue % 2) || -1;

  const computedOutcome = (operandA - operandB) * finalMultiplier;

  console.log(computedOutcome);
}

const rawInputSource = require("fs").readFileSync("/dev/stdin", "utf8");
processDataStream(rawInputSource);