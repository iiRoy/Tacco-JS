function evaluateInput(dataFeed) {
  const lineSeparatorPosition = dataFeed.indexOf('\n');
  const primarySequence = (lineSeparatorPosition === -1)
                            ? dataFeed
                            : dataFeed.substring(0, lineSeparatorPosition);

  const totalComponentValue = Array.from(primarySequence).reduce((accumulator, characterSymbol) => {
    const digitValue = characterSymbol.charCodeAt(0) - '0'.charCodeAt(0);
    return accumulator + digitValue;
  }, 0);

  const outcomeVerdict = (totalComponentValue % 9 === 0) ? "Yes" : "No";
  process.stdout.write(outcomeVerdict + '\n');
}

evaluateInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));