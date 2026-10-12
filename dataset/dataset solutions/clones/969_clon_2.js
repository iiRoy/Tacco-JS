const fileSystem = require('fs');

const scrollParts = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const ancientMessage = scrollParts[0];
const activationCode = scrollParts[1];

const necessarySymbols = new Map();

for (const symbol of activationCode) {
    necessarySymbols.set(
        symbol,
        (necessarySymbols.get(symbol) || 0) + 1
    );
}

let shortestFragment = Infinity;

for (
    let initialPosition = 0;
    initialPosition < ancientMessage.length;
    initialPosition++
) {
    const collectedSymbols = new Map();

    for (
        let finalPosition = initialPosition;
        finalPosition < ancientMessage.length;
        finalPosition++
    ) {
        const currentSymbol = ancientMessage[finalPosition];

        collectedSymbols.set(
            currentSymbol,
            (collectedSymbols.get(currentSymbol) || 0) + 1
        );

        let codeIsComplete = true;

        for (
            const [necessarySymbol, quantity]
            of necessarySymbols
        ) {
            if (
                (collectedSymbols.get(necessarySymbol) || 0) <
                quantity
            ) {
                codeIsComplete = false;
                break;
            }
        }

        if (codeIsComplete) {
            shortestFragment = Math.min(
                shortestFragment,
                finalPosition - initialPosition + 1
            );

            break;
        }
    }
}

console.log(
    shortestFragment === Infinity
        ? 'SIN FRAGMENTO'
        : shortestFragment
);