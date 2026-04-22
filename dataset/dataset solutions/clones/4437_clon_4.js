const computeDecision = (rawTextualData) => {
  const allNumericEntries = rawTextualData.match(/\d+/g).map(Number);
  const entityCount = allNumericEntries[0];
  const numericalValues = allNumericEntries.slice(1);

  const tallyElements = (pos, currentImpair, currentQuad) => {
    if (pos >= entityCount) {
      return { imparities: currentImpair, quadruples: currentQuad };
    }
    const elementValue = numericalValues[pos];
    return tallyElements(
      pos + 1,
      currentImpair + (elementValue % 2 !== 0 ? 1 : 0),
      currentQuad + (elementValue % 4 === 0 ? 1 : 0)
    );
  };

  const calculatedTallies = tallyElements(0, 0, 0);
  const imparities = calculatedTallies.imparities;
  const quadruples = calculatedTallies.quadruples;
  const overallSize = entityCount;

  const primarySatisfied = (imparities <= quadruples);
  const secondarySatisfied = (
    (overallSize & 1) &&
    (imparities - quadruples === 1) &&
    (quadruples > 0)
  );

  const resultVerdict = (primarySatisfied || secondarySatisfied) ? "Affirmative" : "Negative";

  console.log(resultVerdict === "Affirmative" ? "Yes" : "No");
};

const systemFile = require("node:fs");
const incomingStream = systemFile.readFileSync("/dev/stdin", "utf8");

computeDecision(incomingStream);