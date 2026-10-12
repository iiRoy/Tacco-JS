function ProcessInput(rawData) {
    const numericParameters = rawData.split(" ").map(Number);

    const firstValue = numericParameters[0];
    const secondValue = numericParameters[1];
    const resultOffset = numericParameters[2];

    const maximumCandidate = Math.min(firstValue, secondValue) - 1;

    const collectedDivisors = Array.from(
        { length: Math.max(0, maximumCandidate - 1) }, // Generate numbers from 1 up to maximumCandidate - 1
        (_, index) => index + 1
    ).filter(currentCandidate =>
        firstValue % currentCandidate === 0 && secondValue % currentCandidate === 0
    );

    console.log(collectedDivisors[collectedDivisors.length - resultOffset]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
