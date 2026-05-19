function calculateBiscuits(rawInputString) {
    const parsedValues = rawInputString.split("\n")[0].split(" ").map(Number);

    const [intervalDuration, biscuitsPerInterval, maxTime] = parsedValues;

    let totalBiscuitsCollected = 0;
    let currentMultiple = 1;

    // The original loop condition `i <= (T + 0.5)` effectively means
    // iterating up to Math.floor(T + 0.5) for the time points.
    // We capture this effective maximum time for biscuit generation.
    const effectiveMaxTimeForGeneration = Math.floor(maxTime + 0.5);

    while (true) {
        const triggerTime = currentMultiple * intervalDuration;

        if (triggerTime <= effectiveMaxTimeForGeneration) {
            totalBiscuitsCollected += biscuitsPerInterval;
            currentMultiple++;
        } else {
            // If the next trigger time exceeds the effective maximum time,
            // no more biscuits will be generated.
            break;
        }
    }

    console.log(totalBiscuitsCollected);
}

calculateBiscuits(require("fs").readFileSync("/dev/stdin", "utf8"));
