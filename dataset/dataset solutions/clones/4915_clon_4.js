const processInputString = (incomingData) => {
    const rawLines = incomingData.split('\n').filter(Boolean);
    const dataPointCount = Number(rawLines[0]);
    const transformationRecords = rawLines.slice(1).map(txt => {
        const parts = txt.split(' ');
        return [Number(parts[0]), Number(parts[1])];
    });

    const computeScalingFactor = (currentX, denomT, currentY, denomA) => {
        let scaleX = 0;
        if (currentX > 0) {
            scaleX = Math.floor((currentX + denomT - 1) / denomT);
        }
        let scaleY = 0;
        if (currentY > 0) {
            scaleY = Math.floor((currentY + denomA - 1) / denomA);
        }
        return scaleX > scaleY ? scaleX : scaleY;
    };

    const finalAccumulated = transformationRecords.reduce((currentPair, nextInputPair) => {
        const [currentTotalX, currentTotalY] = currentPair;
        const [inputT_i, inputA_i] = nextInputPair;

        const requiredMultiplier = computeScalingFactor(currentTotalX, inputT_i, currentTotalY, inputA_i);

        const newTotalX = inputT_i * requiredMultiplier;
        const newTotalY = inputA_i * requiredMultiplier;

        return [newTotalX, newTotalY];
    }, [1, 1]);

    console.log(finalAccumulated[0] + finalAccumulated[1]);
};

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));