const processInput = (sourceData) => {
    const allLines = sourceData.split('\n');
    const primaryLine = allLines[0];
    const secondaryLine = allLines[1];

    const primaryCharacters = Array.from(primaryLine);
    const secondaryCharacters = Array.from(secondaryLine);

    const matchingSymbolCount = primaryCharacters.reduce((accumulator, currentSymbol, symbolIndex) => {
        return accumulator + (currentSymbol === secondaryCharacters[symbolIndex] ? 1 : 0);
    }, 0);

    console.log(matchingSymbolCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
