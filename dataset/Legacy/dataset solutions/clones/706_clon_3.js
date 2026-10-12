function processInputData(rawInputString) {
    const dataLines = rawInputString.split("\n");
    let currentLinePointer = 0;

    const getNextInt = () => {
        const value = parseInt(dataLines[currentLinePointer], 10);
        currentLinePointer++;
        return value;
    };

    for (;;) {
        const currentProblemLineParts = dataLines[currentLinePointer].split(" ");
        const firstArrayLength = parseInt(currentProblemLineParts[0], 10);
        const secondArrayLength = parseInt(currentProblemLineParts[1], 10);
        currentLinePointer++;

        if (firstArrayLength === 0 && secondArrayLength === 0) {
            break;
        }

        const firstNumbers = [];
        const secondNumbers = [];
        let sumOfFirstNumbers = 0;
        let sumOfSecondNumbers = 0;

        for (let idxA = 0; idxA < firstArrayLength; idxA++) {
            const numberVal = getNextInt();
            firstNumbers.push(numberVal);
            sumOfFirstNumbers += numberVal;
        }

        for (let idxB = 0; idxB < secondArrayLength; idxB++) {
            const numberVal = getNextInt();
            secondNumbers.push(numberVal);
            sumOfSecondNumbers += numberVal;
        }

        const combinedSum = sumOfFirstNumbers + sumOfSecondNumbers;
        if (combinedSum % 2 !== 0) {
            console.log("-1");
            continue;
        }

        let pairFound = false;
        const requiredValueDifference = (sumOfFirstNumbers - sumOfSecondNumbers) / 2;

        for (let idxA = 0; idxA < firstArrayLength; idxA++) {
            for (let idxB = 0; idxB < secondArrayLength; idxB++) {
                const currentFirstNum = firstNumbers[idxA];
                const currentSecondNum = secondNumbers[idxB];

                if (currentFirstNum - currentSecondNum === requiredValueDifference) {
                    pairFound = true;
                    console.log(`${currentFirstNum} ${currentSecondNum}`);
                    break;
                }
            }
            if (pairFound) {
                break;
            }
        }

        if (!pairFound) {
            console.log("-1");
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
