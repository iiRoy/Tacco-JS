function processInputData(rawInputString) {
    const LINE_SEPARATOR = "\n";
    const inputLines = rawInputString.split(LINE_SEPARATOR);

    const firstLineContent = inputLines[0];
    let numericBase = firstLineContent;

    const computeCube = (valueToCube) => {
        const valueSquared = valueToCube * valueToCube;
        const valueCubed = valueSquared * valueToCube;
        return valueCubed;
    };

    const finalCalculatedValue = computeCube(numericBase);
    console.log(finalCalculatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
