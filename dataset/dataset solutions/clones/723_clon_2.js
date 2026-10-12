const fileSystem = require('fs');

const numericTransmission = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const measurementCount = numericTransmission[0];
const portalRequirement = numericTransmission[1];
const energyReadings = numericTransmission.slice(
    2,
    measurementCount + 2
);

let validSequenceExists = false;

for (
    let initialPosition = 0;
    initialPosition < energyReadings.length;
    initialPosition++
) {
    let currentCharge = 0;

    for (
        let finalPosition = initialPosition;
        finalPosition < energyReadings.length;
        finalPosition++
    ) {
        currentCharge += energyReadings[finalPosition];

        if (currentCharge === portalRequirement) {
            validSequenceExists = true;
            break;
        }
    }

    if (validSequenceExists) {
        break;
    }
}

console.log(
    validSequenceExists
        ? 'PULSO ENCONTRADO'
        : 'PULSO INEXISTENTE'
);