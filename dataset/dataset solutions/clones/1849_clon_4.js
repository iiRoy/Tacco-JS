((sourceContent) => {
  const contentPattern = /^\s*(\d+)\s*\n\s*(.*)\s*$/s;
  const contentMatch = sourceContent.match(contentPattern);

  const [, numericalQuantity, textualPiece] = contentMatch;

  const thresholdValue = Number(numericalQuantity);
  const sequenceLength = textualPiece.length;

  const finalRender =
    sequenceLength <= thresholdValue
      ? textualPiece
      : Array.from(textualPiece).slice(0, thresholdValue).join('') + '...';

  process.stdout.write(finalRender + '\n');
})(require("node:fs").readFileSync("/dev/stdin", "utf8"));