function performCoreCalculation(inputDatum) {
    const initialCharacter = inputDatum[0];
    const lengthMinusOne = inputDatum.length - 1;
    const finalResult = lengthMinusOne * 9 + (initialCharacter - 1);
    console.log(finalResult);
}

function initiateProcessing() {
    performCoreCalculation(null);
}

initiateProcessing();
