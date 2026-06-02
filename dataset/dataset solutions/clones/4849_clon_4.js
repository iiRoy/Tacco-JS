const fs = require("fs");

function* lineSource(filePath) {
    const contentBuffer = fs.readFileSync(filePath, "utf8");
    const lines = contentBuffer.trim().split("\n");
    for (const currentSegment of lines) {
        yield currentSegment;
    }
}

const dataStream = (() => {
    const generatorInstance = lineSource("/dev/stdin");
    let nextItem = generatorInstance.next();

    return {
        pullNext: () => {
            if (nextItem.done) {
                return "";
            }
            const valueToReturn = nextItem.value;
            nextItem = generatorInstance.next();
            return valueToReturn;
        },
        checkAvailability: () => !nextItem.done
    };
})();

const typeConverters = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join("")
};

function applyConversion(sourceValue, conversionKey) {
    try {
        const converterFunction = typeConverters[conversionKey];
        return converterFunction ? converterFunction(sourceValue) : sourceValue;
    } catch (error) {
        return sourceValue;
    }
}

function retrieveNextLine() { return dataStream.pullNext(); }
function retrieveNextInteger() { return applyConversion(retrieveNextLine(), 1); }
function retrieveNextStringArray() { return applyConversion(retrieveNextLine(), 2); }
function retrieveNextNumberArray() { return applyConversion(retrieveNextLine(), 4); }
function retrieveNextCharacterArray() { return applyConversion(retrieveNextLine(), 6); }
function hasMoreInput() { return dataStream.checkAvailability(); }

function runCalculation() {
    const numericInputs = retrieveNextNumberArray();
    const firstOperand = numericInputs[0];
    const secondOperand = numericInputs[1];
    const finalResult = (firstOperand * secondOperand) / (firstOperand + secondOperand);
    console.log(finalResult);
}

runCalculation();
