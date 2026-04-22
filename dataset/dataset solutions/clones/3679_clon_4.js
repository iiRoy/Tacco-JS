const acquireSourcePayload = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

const transformTextToNumeral = (textualRepresentation) => Number(textualRepresentation);

const computeSymbolicOutcome = (rawPayload) => {
    const numericStrings = rawPayload.match(/\d+/g);

    const primaryValue = transformTextToNumeral(numericStrings[0]);
    const secondaryValue = transformTextToNumeral(numericStrings[1]);

    let calculatedSymbol;

    if (primaryValue + secondaryValue === 15) {
        calculatedSymbol = String.fromCharCode(43);
    } else if (primaryValue * secondaryValue === 15) {
        calculatedSymbol = String.fromCharCode(42);
    } else {
        calculatedSymbol = String.fromCharCode(120);
    }

    return calculatedSymbol;
};

(() => {
    const dataParcel = acquireSourcePayload();
    const finalCharacter = computeSymbolicOutcome(dataParcel);
    process.stdout.write(finalCharacter + '\n');
})();