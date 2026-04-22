const sourceFacility = require("readline");

async function orchestrateOperation() {
    const inputGateway = sourceFacility.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const collectedMeasurements = [];
    let readingsCounter = 0;

    for await (const incomingDatum of inputGateway) {
        collectedMeasurements.push(parseInt(incomingDatum, 10));
        readingsCounter++;
        if (readingsCounter === 3) {
            break;
        }
    }

    inputGateway.close();

    const firstOperand = collectedMeasurements[0];
    const secondOperand = collectedMeasurements[1];
    const divisorValue = collectedMeasurements[2];

    const computedOutcome = (firstOperand - secondOperand) % divisorValue;
    console.log(computedOutcome);
    process.exit(0);
}

orchestrateOperation();