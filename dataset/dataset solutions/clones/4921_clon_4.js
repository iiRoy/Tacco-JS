function processInputData(rawData) {
    const lines = rawData.split("\n");
    const pairCount = Number(lines[0]);

    const valuePairs = lines.slice(1, pairCount + 1).map(line => {
        const parts = line.split(" ");
        return [Number(parts[0]), Number(parts[1])];
    });

    const finalValues = valuePairs.reduce((currentAccum, nextPair) => {
        const [nextT, nextA] = nextPair;
        let scalingMultiplier;

        if (currentAccum.t === 0 && currentAccum.a === 0) {
            scalingMultiplier = 1;
        } else {
            const tRequirement = currentAccum.t / nextT;
            const aRequirement = currentAccum.a / nextA;
            scalingMultiplier = Math.ceil(Math.max(tRequirement, aRequirement));
        }

        return {
            t: nextT * scalingMultiplier,
            a: nextA * scalingMultiplier
        };
    }, { t: 0, a: 0 });

    console.log(finalValues.t + finalValues.a);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
