const processData = (rawData) => {
  const rawLines = rawData.split('\n');
  const countItems = Number(rawLines[0]);
  const [divisorVal, initialOffset] = rawLines[1].split(' ').map(Number);

  const consumptionFactors = rawLines.slice(2, 2 + countItems).map(Number);

  const totalConsumed = consumptionFactors.reduce((accumulator, currentFactor) => {
    return accumulator + Math.ceil(divisorVal / currentFactor);
  }, 0);

  console.log(totalConsumed + initialOffset);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
