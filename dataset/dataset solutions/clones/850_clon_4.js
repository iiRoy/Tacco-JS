const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const availableCrystals = packet.shift();
const reactorCharges = packet.slice(
    0,
    availableCrystals
);

let largestCharge = -Infinity;
let secondLargestCharge = -Infinity;

let smallestCharge = Infinity;
let secondSmallestCharge = Infinity;

for (const currentCharge of reactorCharges) {
    if (currentCharge > largestCharge) {
        secondLargestCharge = largestCharge;
        largestCharge = currentCharge;
    } else if (currentCharge > secondLargestCharge) {
        secondLargestCharge = currentCharge;
    }

    if (currentCharge < smallestCharge) {
        secondSmallestCharge = smallestCharge;
        smallestCharge = currentCharge;
    } else if (currentCharge < secondSmallestCharge) {
        secondSmallestCharge = currentCharge;
    }
}

const positiveCombination =
    largestCharge * secondLargestCharge;

const negativeCombination =
    smallestCharge * secondSmallestCharge;

const optimalReactorEnergy = Math.max(
    positiveCombination,
    negativeCombination
);

console.log(optimalReactorEnergy);