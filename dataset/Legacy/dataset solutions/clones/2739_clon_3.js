function processInputData(rawData) {
    const lines = rawData.split("\n");

    const BOX_STATE_OFF = 0;
    const BOX_STATE_ON = 1;

    const rawBoxCountString = lines[0];
    const totalBoxCount = parseInt(rawBoxCountString, 10);

    const boxStates = new Array(totalBoxCount);
    const identifiedBoxNumbers = [];
    let identifiedBoxCount = 0;

    const calculateMultiplesParity = (currentBoxNum, statesArray, maxBoxNum) => {
        let currentParitySum = 0;
        let multiplierFactor = 2;
        while (currentBoxNum * multiplierFactor <= maxBoxNum) {
            const multipleBoxArrayIndex = (currentBoxNum * multiplierFactor) - 1;
            currentParitySum += statesArray[multipleBoxArrayIndex];
            multiplierFactor++;
        }
        return currentParitySum;
    };

    for (let currentBoxNumber = totalBoxCount; currentBoxNumber > 0; currentBoxNumber--) {
        const expectedParityValue = parseInt(lines[currentBoxNumber], 10);

        const actualMultiplesParitySum = calculateMultiplesParity(currentBoxNumber, boxStates, totalBoxCount);

        const isParityMatching = (actualMultiplesParitySum % 2) === expectedParityValue;

        const boxArrayIndex = currentBoxNumber - 1;

        if (isParityMatching) {
            boxStates[boxArrayIndex] = BOX_STATE_OFF;
        } else {
            boxStates[boxArrayIndex] = BOX_STATE_ON;
            identifiedBoxCount++;
            identifiedBoxNumbers.push(currentBoxNumber);
        }
    }

    if (identifiedBoxCount > 0) {
        console.log('%d', identifiedBoxCount);

        const outputStringParts = [];
        for (let k = identifiedBoxCount - 1; k >= 0; k--) {
            const currentBoxValue = identifiedBoxNumbers[k];
            outputStringParts.push(String(currentBoxValue));
            if (k === 0) {
                outputStringParts.push(String(currentBoxValue));
            } else {
                outputStringParts.push(String(currentBoxValue));
                outputStringParts.push(' ');
            }
        }
        console.log(outputStringParts.join(''));
    } else {
        console.log('%d', BOX_STATE_OFF);
    }
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
