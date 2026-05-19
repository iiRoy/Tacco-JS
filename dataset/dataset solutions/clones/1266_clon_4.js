function Main(input) {
  const sourceLines = input.trim().split("\n");

  sourceLines.some((currentLine) => {
    const [dimensionA, dimensionB] = currentLine.split(" ").map(Number);

    if (dimensionA === 0 && dimensionB === 0) {
      return true;
    }

    const firstRowContent = Array.from({ length: dimensionB }, (_, colIndex) =>
      colIndex % 2 === 0 ? "#" : "."
    ).join("");

    const secondRowContent = firstRowContent
      .split("")
      .map((charSymbol) => (charSymbol === "#" ? "." : "#"))
      .join("");

    Array.from({ length: dimensionA }, (_, rowIndex) =>
      rowIndex % 2 === 0 ? firstRowContent : secondRowContent
    ).forEach(console.log);

    console.log();

    return false;
  });
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
