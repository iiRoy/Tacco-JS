const signal = require("fs")
    .readFileSync(0, "utf8")
    .trim();

const encodedParts = [];
let groupStart = 0;

for (let i = 1; i <= signal.length; i++) {
    const currentSymbol = signal[i];
    const initialSymbol = signal[groupStart];

    if (currentSymbol !== initialSymbol) {
        const repetitions = i - groupStart;
        const encodedGroup =
            initialSymbol + String(repetitions);

        encodedParts.push(encodedGroup);
        groupStart = i;
    }
}

const encoded = encodedParts.join("");
const groups = encodedParts.length;

console.log(`${encoded}\n${groups}`);