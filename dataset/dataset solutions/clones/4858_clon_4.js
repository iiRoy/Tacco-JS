const computeDifference = (valA, valB) => valA === valB ? valA : Math.abs(valA - valB);

let sourceData, dataIndex;

function initializeData(rawInput) {
    sourceData = rawInput.replace(/\n/g, " ").split(" ");
    dataIndex = 0;
}

const emitResult = (outputContent) => { console.log(outputContent) };
const emitResultLine = (outputContent) => { console.log(outputContent + "\n") };

const fetchString = () => { return sourceData[dataIndex++] };
const fetchInteger = () => { return parseInt(fetchString(), 10) };
const fetchFloat = () => { return parseFloat(fetchString()) };

function processTournament(inputPayload) {
    initializeData(inputPayload);

    let initialPower = fetchInteger();
    let totalInitialElements = Math.pow(2, initialPower);
    let currentRoundElements = [];

    for (let k = 0; k < totalInitialElements; k++) {
        currentRoundElements.push(fetchInteger());
    }

    while (currentRoundElements.length > 1) {
        let nextRoundElements = [];
        for (let j = 0; j < currentRoundElements.length; j += 2) {
            let firstOperand = currentRoundElements[j];
            let secondOperand = currentRoundElements[j + 1];
            nextRoundElements.push(computeDifference(firstOperand, secondOperand));
        }
        currentRoundElements = nextRoundElements;
    }
    emitResultLine(currentRoundElements[0]);
}

function runDebug() {
    processTournament(document.getElementById("input").value);
}

processTournament(require("fs").readFileSync("/dev/stdin", "utf8"));
