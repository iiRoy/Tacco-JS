const readlineModule = require("readline");

let collectedInputValues = [];
const ioHandler = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

const performCalculations = (valuesArray) => {
    const firstVal = Number(valuesArray[0]);
    const secondVal = Number(valuesArray[1]);
    const thirdVal = Number(valuesArray[2]);

    let differenceResult = firstVal - secondVal;
    let finalModuloResult = differenceResult % thirdVal;
    return finalModuloResult;
};

const inputProcessingFlow = (function* () {
    const obtainNextInputLine = () => ioHandler.once("line", s => inputProcessingFlow.next(s));
    const REQUIRED_INPUT_LINES = 3;

    for (let i = 0; i < REQUIRED_INPUT_LINES; i++) {
        let receivedLineContent = yield obtainNextInputLine();
        collectedInputValues.push(Number(receivedLineContent));
    }

    const calculatedOutput = performCalculations(collectedInputValues);

    console.log(calculatedOutput);

    process.exit();
})();

inputProcessingFlow.next();
