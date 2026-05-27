const calculateNextCollatz = (num) => {
    const isEven = num % 2 === 0;
    if (isEven) {
        return num / 2;
    } else {
        return num * 3 + 1;
    }
};

function processInput(rawData) {
    const lines = rawData.split("\n");
    const initialValueStr = lines[0];
    const initialNumber = parseInt(initialValueStr, 10);

    let currentSequenceNumber = initialNumber;
    const visitedNumbers = [];
    visitedNumbers.push(currentSequenceNumber);

    let stepCount = 1;
    const MAX_SEQUENCE_LENGTH = 1000000;

    while (stepCount < MAX_SEQUENCE_LENGTH) {
        currentSequenceNumber = calculateNextCollatz(currentSequenceNumber);

        const existingIndex = visitedNumbers.indexOf(currentSequenceNumber);

        if (existingIndex !== -1) {
            console.log(stepCount + 1);
            break;
        }
        visitedNumbers.push(currentSequenceNumber);
        stepCount++;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
