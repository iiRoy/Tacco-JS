const oceanicSignal = require("fs")
    .readFileSync(0, "utf8")
    .trim();

const detectedSequences =
    oceanicSignal.match(/(.)\1*/g) ?? [];

const compactTransmission = detectedSequences
    .map(sequence => {
        const symbol = sequence.charAt(0);
        const amount = sequence.length;

        return `${symbol}${amount}`;
    })
    .join("");

const report = {
    message: compactTransmission,
    sequences: detectedSequences.length
};

process.stdout.write(
    [report.message, report.sequences].join("\n")
);