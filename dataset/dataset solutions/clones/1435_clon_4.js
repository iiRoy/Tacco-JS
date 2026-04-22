function entryPoint(rawPayload) {
    const tokenSet = rawPayload.match(/\S+/g);

    function processSegments(remainingTokens) {
        if (remainingTokens.length === 0) {
            return;
        }

        const currentWord = remainingTokens[0];
        if (currentWord === "-") {
            return;
        }

        const initialValue = currentWord;
        const countString = remainingTokens[1];
        const rotationCount = Number(countString);

        const rotationAmounts = [];
        for (let k = 0; k < rotationCount; k++) {
            rotationAmounts.push(Number(remainingTokens[2 + k]));
        }

        const transformedValue = rotationAmounts.reduce((currentValue, rotationStep) => {
            const characterSequence = [...currentValue];
            const leadingSection = characterSequence.splice(0, rotationStep);
            return characterSequence.concat(leadingSection).join('');
        }, initialValue);

        console.log(transformedValue);

        const nextSegmentStart = 2 + rotationCount;
        processSegments(remainingTokens.slice(nextSegmentStart));
    }

    processSegments(tokenSet);
}

function fetchPayload() {
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
}

entryPoint(fetchPayload());