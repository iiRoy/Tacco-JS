const processInputAndDisplay = (rawText) => {
    const numericValues = rawText.trim().split(/\s+/).map(Number);
    const [firstVal, secondVal] = numericValues;

    const conditionResults = [
        firstVal <= 8,
        secondVal <= 8
    ];

    const outcomeMap = new Map([
        [true, 'Yay!'],
        [false, ':(']
    ]);

    const finalMessage = outcomeMap.get(conditionResults.every(Boolean));

    console.log(finalMessage);
};

const executeProgram = (sourcePath) => {
    const fileContent = require("fs").readFileSync(sourcePath, "utf8");
    processInputAndDisplay(fileContent);
};

executeProgram("/dev/stdin");
