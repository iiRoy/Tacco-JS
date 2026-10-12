function Main(input) {
  const lineSegments = input.split("\n");
  const processingLimit = Number(lineSegments[0]);

  const numericTokens = lineSegments[1].split(" ");

  const evenNumbersTally = numericTokens
    .slice(0, processingLimit)
    .reduce((accumulator, currentToken) => {
      const parsedValue = Number(currentToken);
      return accumulator + (parsedValue % 2 === 0 ? 1 : 0);
    }, 0);

  const finalOutcome = (evenNumbersTally % 2 !== 0) ? "YES" : "NO";
  console.log(finalOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
