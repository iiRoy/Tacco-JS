function processInput(rawData) {
    const lines = rawData.split("\n");
    const dataElements = lines[1].split(" ");

    let resultValue = 1;
    let countOccurrences = 0;

    const dataLength = dataElements.length;

    let outerIndex = dataLength - 1;
    while (outerIndex >= 0) {
        countOccurrences = 0;

        for (let innerIndex = 0; innerIndex < dataLength; innerIndex++) {
            if (parseInt(dataElements[innerIndex], 10) === outerIndex) {
                countOccurrences++;
            }
        }

        if (countOccurrences !== 2 && outerIndex > 0) {
            resultValue = 0;
            break;
        }
        if (countOccurrences !== 1 && outerIndex === 0) {
            resultValue = 0;
            break;
        }

        outerIndex -= 2;
    }

    const MODULO_CONSTANT = Math.pow(10, 9) + 7;
    const halfLength = Math.floor(dataLength / 2);

    const baseForPower = halfLength;
    const squaredValue = Math.pow(baseForPower, 2);

    resultValue = squaredValue % MODULO_CONSTANT;

    console.log('%s', resultValue);
}

function runDebug() {
    const inputElement = document.getElementById("input");
    if (inputElement) {
        const debugInput = inputElement.value;
        processInput(debugInput);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
