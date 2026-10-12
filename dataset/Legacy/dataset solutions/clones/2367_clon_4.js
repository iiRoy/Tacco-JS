const readInputSource = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const outputResult = (content) => console.log(content);

const inputConversionMap = Object.freeze({
    0: (val) => val,
    1: (val) => Number.parseInt(val),
    2: (val) => val.split(" "),
    3: (val) => val.split("\n"),
    4: (val) => val.split(" ").map(Number),
    5: (val) => val.split("\n").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number)
});

function processInputData(rawData, conversionIdentifier) {
    const converter = inputConversionMap[conversionIdentifier];
    return converter ? converter(rawData) : rawData;
}

function calculateOriginalPrice(taxedAmountString) {
    const desiredTaxedValue = processInputData(taxedAmountString, 1);
    
    const approximateBaseValue = desiredTaxedValue / 1.08;
    let finalBasePrice = null;

    const lowerBoundCheck = Math.floor(approximateBaseValue) - 2;
    const upperBoundCheck = Math.ceil(approximateBaseValue) + 2;

    for (let potentialBase = lowerBoundCheck; potentialBase <= upperBoundCheck; potentialBase++) {
        if (potentialBase < 0) {
            continue;
        }

        const computedTaxedValue = Math.floor(potentialBase * 1.08);

        if (computedTaxedValue === desiredTaxedValue) {
            finalBasePrice = potentialBase;
            break;
        }
    }

    if (finalBasePrice !== null) {
        outputResult(finalBasePrice);
    } else {
        outputResult(":(");
    }
}

calculateOriginalPrice(readInputSource());
