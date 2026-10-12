const signal = require("fs")
    .readFileSync(0, "utf8")
    .trim();

let encoded = "";
let groups = 0;
let currentSymbol = signal[0];
let repetitions = 1;

for (let i = 1; i < signal.length; i++) {
    const symbol = signal[i];

    if (symbol === currentSymbol) {
        repetitions++;
    } else {
        encoded += currentSymbol + repetitions;
        groups++;

        currentSymbol = symbol;
        repetitions = 1;
    }
}

if (signal.length > 0) {
    encoded += currentSymbol + repetitions;
    groups++;
}

console.log(encoded);
console.log(groups);