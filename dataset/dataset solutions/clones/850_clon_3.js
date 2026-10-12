const fs = require('fs');

function receiveCrystalCharges() {
    const transmission = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const declaredCrystals = transmission.shift();

    return transmission.slice(0, declaredCrystals);
}

function findBestPartnerProduct(charges, origin) {
    const originCharge = charges[origin];

    let bestProduct = -Infinity;
    let candidate = origin + 1;

    while (candidate < charges.length) {
        const generatedPower =
            originCharge * charges[candidate];

        bestProduct = Math.max(
            bestProduct,
            generatedPower
        );

        candidate++;
    }

    return bestProduct;
}

function calculateMaximumEnergy(charges) {
    let bestEnergy = -Infinity;
    let origin = 0;

    while (origin < charges.length - 1) {
        const localBest = findBestPartnerProduct(
            charges,
            origin
        );

        if (localBest > bestEnergy) {
            bestEnergy = localBest;
        }

        origin++;
    }

    return bestEnergy;
}

const crystalCharges = receiveCrystalCharges();
const reactorOutput = calculateMaximumEnergy(
    crystalCharges
);

process.stdout.write(`${reactorOutput}\n`);