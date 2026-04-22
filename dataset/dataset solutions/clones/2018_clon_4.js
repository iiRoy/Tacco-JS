const analyzeStreamData = (sourceContent) => {
  const relevantLine = sourceContent.split('\n')[0];

  const firstComparison = (relevantLine.charCodeAt(2) - relevantLine.charCodeAt(3)) === 0;
  const secondComparison = (relevantLine.charCodeAt(4) - relevantLine.charCodeAt(5)) === 0;

  const decisionState = (Number(firstComparison) + Number(secondComparison)) === 2;

  const outcomeMap = {
    true: "Yes",
    false: "No"
  };

  return outcomeMap[decisionState];
};

const transmitResult = (contentToDisplay) => {
  process.stdout.write(contentToDisplay + '\n');
};

const obtainInputPayload = (resourceLocation) => {
  const systemInterface = require("node:fs");
  return systemInterface.readFileSync(resourceLocation, "utf8");
};

(() => {
  const dataOrigin = "/dev/stdin";
  const rawPayload = obtainInputPayload(dataOrigin);
  const finalVerdict = analyzeStreamData(rawPayload);
  transmitResult(finalVerdict);
})();