const moduloValue = 1000000007;

const processRawData = (sourceData) => {
    const allLines = sourceData.trim().split('\n');
    const firstLineValue = Number(allLines[0]);
    const numericSequence = allLines[1].split(' ').map(Number).slice(1);
    return { totalItems: firstLineValue, dataStream: numericSequence };
};

const calculateCombinations = (valueStream) => {
    const initialPossibilities = 3;
    const initialTracker = new Map([
        [0, 1],
        [1, 0],
        [2, 0]
    ]);

    const finalState = valueStream.reduce((currentAccum, currentVal) => {
        let { permutationCount, itemTracker } = currentAccum;

        let matchingInstances = 0;
        for (const val of itemTracker.values()) {
            if (val === currentVal) {
                matchingInstances++;
            }
        }

        permutationCount = (permutationCount * matchingInstances) % moduloValue;

        const updatedTracker = new Map(itemTracker);
        for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
            if (updatedTracker.get(slotIndex) === currentVal) {
                updatedTracker.set(slotIndex, updatedTracker.get(slotIndex) + 1);
                break;
            }
        }
        return { permutationCount, itemTracker: updatedTracker };
    }, { permutationCount: initialPossibilities, itemTracker: initialTracker });

    return finalState.permutationCount;
};

const entryPoint = (inputPayload) => {
    const { totalItems, dataStream } = processRawData(inputPayload);
    const finalAnswer = calculateCombinations(dataStream);
    console.log(finalAnswer);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));