((acquisitionSource) => {
    const rawText = require("fs").readFileSync(acquisitionSource, "utf8");
    const numericParts = rawText.split(" ").map(Number);

    const valA = numericParts[0];
    const valB = numericParts[1];

    const finalOutcome = (valA * valB) / (valA + valB);

    process.stdout.write(finalOutcome.toString() + "\n");
})("/dev/stdin");