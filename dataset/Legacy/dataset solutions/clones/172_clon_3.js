const readInput = () => {
    const fileSystemModule = require('fs');
    const inputBufferLength = fileSystemModule.fstatSync(process.stdin.fd).size;
    const dataBuffer = Buffer.alloc(inputBufferLength);
    const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputBufferLength, 0);
    return dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
};

const parseItemDetails = (itemString) => {
    const parts = itemString.split(",");
    const itemValue = +parts[0];
    const itemWeight = +parts[1];
    return { value: itemValue, weight: itemWeight };
};

const processCases = () => {
    const inputLines = readInput();
    let lineIndex = 0;
    let caseCounter = 1;

    while (true) {
        const capacityLimit = +inputLines[lineIndex++];
        if (capacityLimit === 0) {
            break;
        }

        const itemCount = +inputLines[lineIndex++];
        let previousDP = new Int32Array(capacityLimit + 1);

        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            const itemDetails = parseItemDetails(inputLines[lineIndex++]);
            const itemValue = itemDetails.value;
            const itemWeight = itemDetails.weight;

            const currentDP = new Int32Array(capacityLimit + 1);
            currentDP.set(previousDP);

            for (let currentWeight = itemWeight; currentWeight <= capacityLimit; currentWeight++) {
                const valueIfIncluded = previousDP[currentWeight - itemWeight] + itemValue;
                const valueIfNotIncluded = currentDP[currentWeight];

                const difference = valueIfIncluded - valueIfNotIncluded;
                currentDP[currentWeight] = valueIfIncluded - (difference & (difference >> 31));
            }
            previousDP = currentDP;
        }

        let optimalWeight = 1001;
        let maxValue = 0;

        for (let w = 0; w <= capacityLimit; w++) {
            const currentPdpValue = previousDP[w];
            if (currentPdpValue > maxValue) {
                maxValue = currentPdpValue;
                optimalWeight = w;
            }
        }

        console.log("Case " + caseCounter++ + ":\n" + maxValue + "\n" + optimalWeight);
    }
};

processCases();
