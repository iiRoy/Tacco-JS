(async () => {
    let rawDataBuffer = '';
    for await (const inputChunk of process.stdin) {
        rawDataBuffer += inputChunk;
    }

    const targetDivisor = +rawDataBuffer;

    let currentAccumulatedRemainder = 0;
    let multipleFoundFlag = false;

    for (let loopIndex = 1; loopIndex <= targetDivisor; ++loopIndex) {
        let intermediateCalculation = (currentAccumulatedRemainder * 10) + 7;
        currentAccumulatedRemainder = intermediateCalculation % targetDivisor;

        if (currentAccumulatedRemainder === 0) {
            console.log(loopIndex);
            multipleFoundFlag = true;
            break;
        }
    }

    if (!multipleFoundFlag) {
        console.log(-1);
    }
})();
