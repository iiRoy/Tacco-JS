function processInput(rawData) {
    const [cycleDuration, unitValue, maxTime] = rawData.split('\n')[0].split(' ').map(Number);

    const effectiveMaxTime = Math.round(maxTime);

    const productionEvents = Array.from({ length: effectiveMaxTime + 1 }, (_, momentInTime) => momentInTime)
                                .filter(point => point > 0 && point % cycleDuration === 0);

    const totalAccumulatedValue = productionEvents.length * unitValue;

    console.log(totalAccumulatedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));