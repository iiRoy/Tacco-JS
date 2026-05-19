const retrieveLine = require('readline-sync').question;

const convertToInteger = (textualInput) => parseInt(textualInput, 10);

function processInputSeries() {
    const primaryInputLine = retrieveLine();
    const primaryValue = convertToInteger(primaryInputLine);

    if (primaryValue === 0) {
        return;
    }

    const subIterationQuantity = Math.floor(primaryValue / 4);

    const accumulatedSubtotal = Array.from({ length: subIterationQuantity }).reduce((currentAccumulation) => {
        const secondaryInputLine = retrieveLine();
        const secondaryValue = convertToInteger(secondaryInputLine);
        return currentAccumulation + secondaryValue;
    }, 0);

    console.log(accumulatedSubtotal);

    processInputSeries();
}

processInputSeries();
