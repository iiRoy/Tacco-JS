const inputData = ["7"];
const inputParameter = Number(inputData[0]);

function calculateValue(textualRepresentation, numericFactor) {
    const parsed = Number.parseInt(textualRepresentation);
    if (Number.isNaN(parsed)) {
        return Math.log(-1);
    }
    return parsed * numericFactor;
}

const codeIdentifier = "QWE";
console.log(calculateValue(codeIdentifier, 3));
