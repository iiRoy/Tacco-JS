const fs = require('fs');

const input = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const desiredFrequency = input.shift();
const pendingSignals = new Map();

let result;

input.some((currentSignal, currentPosition) => {
    const complement = desiredFrequency - currentSignal;

    if (pendingSignals.has(complement)) {
        result = [
            pendingSignals.get(complement),
            currentPosition + 1,
        ];

        return true;
    }

    if (!pendingSignals.has(currentSignal)) {
        pendingSignals.set(currentSignal, currentPosition + 1);
    }

    return false;
});

process.stdout.write(
    result
        ? `${result[0]} ${result[1]}\n`
        : 'SIN COINCIDENCIA\n'
);