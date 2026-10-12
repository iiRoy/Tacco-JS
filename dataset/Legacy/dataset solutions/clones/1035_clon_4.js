function processInput(rawData) {
    const lines = rawData.split("\n");

    const firstCount = Number(lines[0]);
    const secondCount = Number(lines[2]);

    const sourceNumbers = lines[1].split(" ").map(Number);
    const targetNumbers = lines[3].split(" ").map(Number);

    const sourceSet = new Set(sourceNumbers);

    const foundOccurrences = targetNumbers.filter(
        (currentNumber) => sourceSet.has(currentNumber)
    ).length;

    console.log(foundOccurrences);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
