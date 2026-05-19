function processInputData(rawData) {
  const firstLineContent = rawData.split('\n')[0];
  const numericalValue = Number(firstLineContent);

  const remainderResult = numericalValue % 11;

  const decisionMatrix = {
    0: "Yes",
    4: "Yes",
    7: "Yes"
  };

  const finalOutcome = decisionMatrix[remainderResult] || "No";
  console.log(finalOutcome);
}

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));
