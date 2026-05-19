function* valueStream(sourceString) {
    const dataSegments = sourceString.split(/\s/);
    for (const segment of dataSegments) {
        const numericRepresentation = Number(segment);
        if (numericRepresentation === 0 || Number.isNaN(numericRepresentation)) {
            return;
        }
        yield numericRepresentation;
    }
}

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
for (const processedNumber of valueStream(rawInput)) {
    console.log((processedNumber * processedNumber + processedNumber + 2) / 2);
}
