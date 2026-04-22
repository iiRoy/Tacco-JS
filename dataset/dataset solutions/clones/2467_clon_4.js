function calculateProductOrNegativeOne(textualEntry) {
    const tokenCollection = textualEntry.split(/\s+/).filter(Boolean);

    const primaryOperand = Number(tokenCollection[0]);
    const secondaryOperand = Number(tokenCollection[1]);

    let outcomeValue;
    outcomeValue = (secondaryOperand <= 9)
        ? (primaryOperand * secondaryOperand).toString()
        : "-1";

    return outcomeValue;
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutputString = calculateProductOrNegativeOne(rawInputContent);
console.log(finalOutputString);