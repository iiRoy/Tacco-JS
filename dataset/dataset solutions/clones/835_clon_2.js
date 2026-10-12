const tokens = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const cargoAmount = tokens[0];
const flightLimit = tokens[1];
const cargoWeights = tokens.slice(2, 2 + cargoAmount);

let flightCount = 0;
let accumulatedWeight = 0;
let maximumFlightWeight = 0;

for (let cargoIndex = 0; cargoIndex < cargoAmount; cargoIndex++) {
    const currentWeight = cargoWeights[cargoIndex];

    if (accumulatedWeight + currentWeight > flightLimit) {
        flightCount++;

        if (accumulatedWeight > maximumFlightWeight) {
            maximumFlightWeight = accumulatedWeight;
        }

        accumulatedWeight = currentWeight;
    } else {
        accumulatedWeight += currentWeight;
    }
}

if (cargoAmount > 0) {
    flightCount++;

    if (accumulatedWeight > maximumFlightWeight) {
        maximumFlightWeight = accumulatedWeight;
    }
}

console.log(flightCount);
console.log(maximumFlightWeight);