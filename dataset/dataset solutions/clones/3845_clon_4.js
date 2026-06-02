process.stdin.setEncoding('utf-8');
process.stdin.on('data', function (inputLine) {
  const inputSegments = inputLine.split(' ');
  const primaryValue = inputSegments[0];
  const secondaryValue = inputSegments[1];

  const comparisonResult = primaryValue <= secondaryValue;

  const outcomeMap = {
    true: primaryValue,
    false: Number(primaryValue) - 1
  };

  const finalOutcome = outcomeMap[String(comparisonResult)];
  console.log(finalOutcome);
});
