function Main(entryPoint) {
  const firstNewlinePosition = entryPoint.indexOf('\n');
  const firstLineContent = entryPoint.substring(0, firstNewlinePosition);
  const remainingInput = entryPoint.substring(firstNewlinePosition + 1);

  const secondNewlinePosition = remainingInput.indexOf('\n');
  const secondLineContent = remainingInput.substring(0, secondNewlinePosition === -1 ? undefined : secondNewlinePosition);

  const primaryTokens = firstLineContent.split(" ");
  console.log(primaryTokens);

  const secondaryTokens = secondLineContent.split(' ');
  console.log(secondaryTokens);

  let aggregatedString = '';
  secondaryTokens.forEach(function(tokenPiece) {
    aggregatedString += tokenPiece;
  });

  const comparisonValue = primaryTokens[0];

  console.log(aggregatedString > comparisonValue ? "Yes" : "No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
