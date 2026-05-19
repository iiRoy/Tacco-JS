function processInput(inputString) {
    const lines = inputString.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const numericValues = lines[1].split(" ").map(Number);

    const effectiveSlice = numericValues.slice(0, elementCount);

    const finalResult = effectiveSlice.reduceRight((accumulator, currentValue, currentIndex, sourceArray) => {
        let [streakCounter, peakStreak] = accumulator;
        const priorValue = sourceArray[currentIndex - 1];

        console.log(currentValue, priorValue);

        if (currentValue <= priorValue) {
            streakCounter++;
            if (streakCounter > peakStreak) {
                peakStreak = streakCounter;
            }
        } else {
            streakCounter = 0;
        }
        return [streakCounter, peakStreak];
    }, [0, 0]);

    console.log(finalResult[1]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
