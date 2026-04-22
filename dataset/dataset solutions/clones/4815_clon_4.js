const renderOutput = (value) => console.log(String(value));

const calculateArrangement = (rawText) => {
    const processedLines = rawText.trim().split('\n');
    const totalElements = Number(processedLines[0]);
    const numberSequence = processedLines[1].split(' ').map(Number);

    const freqMap = numberSequence.reduce((acc, currentVal) => {
        acc.set(currentVal, (acc.get(currentVal) || 0) + 1);
        return acc;
    }, new Map());

    const uniqueElements = Array.from(freqMap.keys());

    let isValidStructure = true;
    let finalPower = 0;

    if (totalElements % 2 === 1) {
        if (freqMap.get(0) !== 1) {
            isValidStructure = false;
        } else {
            const nonZeroElements = uniqueElements.filter(val => val !== 0);
            if (nonZeroElements.length !== (totalElements - 1) / 2) {
                isValidStructure = false;
            } else {
                const allOthersTwice = nonZeroElements.every(val => freqMap.get(val) === 2);
                if (!allOthersTwice) {
                    isValidStructure = false;
                } else {
                    finalPower = (totalElements - 1) / 2;
                }
            }
        }
    } else {
        if (freqMap.has(0)) {
            isValidStructure = false;
        } else {
            if (uniqueElements.length !== totalElements / 2) {
                isValidStructure = false;
            } else {
                const allTwice = uniqueElements.every(val => freqMap.get(val) === 2);
                if (!allTwice) {
                    isValidStructure = false;
                } else {
                    finalPower = totalElements / 2;
                }
            }
        }
    }

    if (!isValidStructure) {
        return "0";
    } else {
        return 1 << finalPower;
    }
};

const entryPoint = (dataPayload) => {
    const outcome = calculateArrangement(dataPayload);
    renderOutput(outcome);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));