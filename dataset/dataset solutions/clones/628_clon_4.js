const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const satelliteAmount = packet.shift();
const revolutionTimes = packet.slice(0, satelliteAmount);

const requiredPrimePowers = new Map();

for (const revolutionTime of revolutionTimes) {
    let remainingValue = revolutionTime;
    let possiblePrime = 2;

    while (possiblePrime * possiblePrime <= remainingValue) {
        let exponent = 0;

        while (remainingValue % possiblePrime === 0) {
            remainingValue /= possiblePrime;
            exponent++;
        }

        if (exponent > 0) {
            const previousExponent =
                requiredPrimePowers.get(possiblePrime) || 0;

            requiredPrimePowers.set(
                possiblePrime,
                Math.max(previousExponent, exponent)
            );
        }

        possiblePrime++;
    }

    if (remainingValue > 1) {
        const previousExponent =
            requiredPrimePowers.get(remainingValue) || 0;

        requiredPrimePowers.set(
            remainingValue,
            Math.max(previousExponent, 1)
        );
    }
}

let daysUntilAlignment = 1;

for (const [prime, exponent] of requiredPrimePowers) {
    daysUntilAlignment *= prime ** exponent;
}

console.log(daysUntilAlignment);