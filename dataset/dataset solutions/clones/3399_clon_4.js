const computeMaximumElement = (dataStream) => {
    const lines = dataStream.trim().split('\n');
    const totalEntries = Number(lines[0]);
    const valueSequence = lines[1].split(' ').map(Number);

    const initialCounterArray = Array.from({ length: valueSequence[0] }, () => 1);
    const initialMaxCounterValue = initialCounterArray.length > 0 ? Math.max(...initialCounterArray) : 0;

    const finalState = valueSequence.slice(1).reduce((accumulator, currentItemValue) => {
        const priorVal = accumulator.priorVal;
        let currentElementList = accumulator.currentList;
        let highestValAchieved = accumulator.highestValAchieved;

        const iterationPeak = currentElementList.length > 0 ? Math.max(...currentElementList) : 0;
        const areAllUniform = currentElementList.every(val => val === currentElementList[0]);
        const uniformityMarker = areAllUniform ? 0 : 1;

        if (currentItemValue > priorVal) {
            const addedElementsCount = currentItemValue - priorVal;
            const newUnits = Array.from({ length: addedElementsCount }, () => 1);
            currentElementList = [...currentElementList, ...newUnits];
        } else {
            if (uniformityMarker === 0) {
                let modifiedElementList = currentElementList.slice(0, currentItemValue);
                if (modifiedElementList.length > 0) {
                    modifiedElementList[currentItemValue - 1]++;
                }
                currentElementList = modifiedElementList;
            } else {
                let modifiedElementList = currentElementList.slice(0, currentItemValue);
                let incrementApplied = false;
                for (let k = modifiedElementList.length - 1; k >= 0; k--) {
                    if (modifiedElementList[k] !== iterationPeak) {
                        modifiedElementList[k]++;
                        incrementApplied = true;
                        break;
                    }
                }
                currentElementList = modifiedElementList;
            }
        }

        const currentListPeak = currentElementList.length > 0 ? Math.max(...currentElementList) : 0;
        highestValAchieved = Math.max(highestValAchieved, currentListPeak);

        return {
            currentList: currentElementList,
            priorVal: currentItemValue,
            highestValAchieved: highestValAchieved
        };
    }, {
        currentList: initialCounterArray,
        priorVal: valueSequence[0],
        highestValAchieved: initialMaxCounterValue
    });

    return finalState.highestValAchieved;
};

const supplyDataAndCompute = (rawData) => {
    const finalResult = computeMaximumElement(rawData);
    console.log(String(finalResult));
};

const handleInput = () => {
    if (typeof require !== 'undefined' && require.main === module) {
        supplyDataAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
    } else if (typeof document !== 'undefined') {
        const browserInput = document.getElementById("input").value;
        supplyDataAndCompute(browserInput);
    } else {
        console.error("No input source found.");
    }
};

handleInput();