function processInput(rawText) {
    const components = rawText.split(" ");
    const limit = Number(components[0]);
    const startVal = Number(components[1]);
    const increment = Number(components[2]);
    const modulus = Number(components[3]);

    if (limit === 0) {
        console.log(NaN);
        return;
    }

    let currentAccumulator = 0;

    Array.from({ length: limit }, (_, idx) => startVal + (increment * idx))
        .forEach(segmentValue => {
            const segmentString = String(segmentValue);
            const digitCount = segmentString.length;

            let powerOfTenMod = 1;
            for (let k = 0; k < digitCount; k++) {
                powerOfTenMod = (powerOfTenMod * 10) % modulus;
            }

            currentAccumulator = (currentAccumulator * powerOfTenMod + segmentValue) % modulus;
        });

    console.log(currentAccumulator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
