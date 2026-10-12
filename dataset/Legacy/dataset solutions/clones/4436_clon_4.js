const processInput = (sourceText) => {
    const firstSymbol = sourceText.charAt(0);
    const lastSymbol = sourceText.slice(-1);
    const combinedOutput = `${firstSymbol}${sourceText.length}${lastSymbol}`;
    console.log(`${combinedOutput}\n`);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
