const evaluateScenario = function(payloadString) {
  let separatorIndex = payloadString.indexOf(' ');
  let firstSegment = payloadString.substring(0, separatorIndex);
  let secondSegment = payloadString.substring(separatorIndex + 1);

  let entityCount = parseInt(firstSegment, 10);
  let limbCount = parseInt(secondSegment, 10);

  let isLimbCountEven = (limbCount & 1) === 0;

  let quadrupledEntityCount = entityCount + entityCount + entityCount + entityCount;

  let isQuadrupledEntityCountSufficient = quadrupledEntityCount >= limbCount;

  const resultMapping = new Map([
    [true, 'Yes'],
    [false, 'No']
  ]);

  return resultMapping.get(isLimbCountEven && isQuadrupledEntityCountSufficient);
};

const ioHandler = require("node:fs");
const standardStreamPath = "/dev/stdin";

const rawInputData = ioHandler.readFileSync(standardStreamPath, "utf8");

const outcomeMessage = evaluateScenario(rawInputData);
console.log(outcomeMessage);