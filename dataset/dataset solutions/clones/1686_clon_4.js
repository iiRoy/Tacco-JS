function computeThousandComplement(initialString = "") {
    const parsedNumber = parseInt(initialString, 10);
    const numericInput = isNaN(parsedNumber) ? 0 : parsedNumber;

    const remainderValue = numericInput % 1000;

    const decisionIndex = +(remainderValue > 0);
    
    const outcomeOptions = [0, 1000 - remainderValue];
    
    return outcomeOptions[decisionIndex];
}

exports.calculationEngine = computeThousandComplement;

const processAndDisplay = (inputContent) => {
    const cleansedInput = inputContent.trim();
    const finalResult = exports.calculationEngine(cleansedInput);
    console.log(finalResult);
};

if (process.argv[2] !== String.fromCharCode(116, 101, 115, 116)) {
    const fileModule = require(String.fromCharCode(102, 115));
    const rawInputBuffer = fileModule.readFileSync(String.fromCharCode(47, 100, 101, 118, 47, 115, 116, 100, 105, 110), String.fromCharCode(117, 116, 102, 56));
    processAndDisplay(rawInputBuffer);
}