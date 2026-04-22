const processGrid = (sourceTextContent) => {
  const allInputLines = sourceTextContent.split("\n");

  const [dimensionHeightStr, dimensionWidthStr] = allInputLines[0].split(" ");
  const actualGridHeight = Number(dimensionHeightStr);
  const actualGridWidth = Number(dimensionWidthStr);

  const boundaryLine = '#'.repeat(actualGridWidth + 2);

  const coreContentRows = allInputLines.slice(1, actualGridHeight + 1);

  const framedContentRows = coreContentRows.map(
    (currentLine) => `#${currentLine}#`
  );

  const completeOutput = [
    boundaryLine,
    ...framedContentRows,
    boundaryLine
  ];

  completeOutput.forEach((displayLine) => console.log(displayLine));
};

processGrid(require("node:fs").readFileSync("/dev/stdin", "utf8"));