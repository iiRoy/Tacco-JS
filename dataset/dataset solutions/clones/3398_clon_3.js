function processInputData(rawData) {
    const lines = rawData.split("\n");
    const arrayLength = parseInt(lines[0], 10);
    const inputArrayRaw = lines[1].split(" ");
    const inputArray = new Array(arrayLength);

    const parseNumericArray = (rawElements, count) => {
        const parsedArray = new Array(count);
        for (let k = 0; k < count; k++) {
            parsedArray[k] = parseInt(rawElements[k], 10);
        }
        return parsedArray;
    };

    Object.assign(inputArray, parseNumericArray(inputArrayRaw, arrayLength));

    let finalCountResult = 0;
    let processingState = 0;
    let currentCountValue = 1;

    const initializeDynamicArray = (initialSize) => {
        return new Array(initialSize).fill(1);
    };
    let dynamicArray = initializeDynamicArray(inputArray[0]);

    const checkArrayUniformity = (arr) => {
        if (arr.length === 0) return true;
        const referenceValue = arr[0];
        for (let k = 1; k < arr.length; k++) {
            if (arr[k] !== referenceValue) {
                return false;
            }
        }
        return true;
    };

    for (let idx = 1; idx < arrayLength; idx++) {
        const currentElementValue = inputArray[idx];
        const previousElementValue = inputArray[idx - 1];

        if (currentElementValue < previousElementValue) {
            dynamicArray = dynamicArray.slice(0, currentElementValue);
        }

        if (processingState === 2) {
            processingState = checkArrayUniformity(dynamicArray) ? 0 : 1;
        }

        if (currentElementValue > previousElementValue) {
            const difference = currentElementValue - previousElementValue;
            for (let k = 0; k < difference; k++) {
                dynamicArray.push(1);
            }
            processingState = 2;
        } else if (processingState === 0) {
            const targetIndex = currentElementValue - 1;
            if (targetIndex >= 0 && targetIndex < dynamicArray.length) {
                dynamicArray[targetIndex]++;
            }
            dynamicArray = dynamicArray.slice(0, currentElementValue);

            if (dynamicArray.length !== 1) {
                processingState = 1;
                currentCountValue++;
            }
        } else if (processingState === 1) {
            dynamicArray = dynamicArray.slice(0, currentElementValue);
            for (let innerIdx = currentElementValue - 1; innerIdx >= 0; innerIdx--) {
                if (dynamicArray[innerIdx] === currentCountValue) {
                    dynamicArray[innerIdx] = 1;
                } else {
                    dynamicArray[innerIdx]++;
                    processingState = 2;
                    break;
                }
            }
        }
    }

    finalCountResult = currentCountValue;
    console.log('%s', finalCountResult);
}

function runDebugSimulation() {
    var input = document.getElementById("input").value;
    processInputData(input);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
