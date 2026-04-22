const initialDataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

class GridProcessor {
    constructor() {
        this.currentWorkingGrid = [];
        this.originalContentSize = 0;
    }

    applyAlphaMark() {
        let currentScanPosition = 1;
        do {
            if (currentScanPosition >= this.currentWorkingGrid.length - 1) {
                break;
            }
            if (this.currentWorkingGrid[currentScanPosition] === 0) {
                this.currentWorkingGrid[currentScanPosition] = "A";
                return;
            }
            currentScanPosition++;
        } while (true);
    }

    applyBetaMark() {
        let markerPlaced = false;
        let reverseIndex = this.originalContentSize;
        while (reverseIndex >= 1) {
            const leftValue = this.currentWorkingGrid[reverseIndex - 1];
            const centralValue = this.currentWorkingGrid[reverseIndex];
            const rightValue = this.currentWorkingGrid[reverseIndex + 1];

            if (leftValue !== "A" && centralValue === 0 && rightValue !== "A") {
                this.currentWorkingGrid[reverseIndex] = "B";
                markerPlaced = true;
                break;
            }
            reverseIndex--;
        }

        if (!markerPlaced) {
            let forwardIndex = 1;
            while (forwardIndex <= this.originalContentSize) {
                if (this.currentWorkingGrid[forwardIndex] === 0) {
                    this.currentWorkingGrid[forwardIndex] = "B";
                    markerPlaced = true;
                    break;
                }
                forwardIndex++;
            }
        }
    }

    applyGammaMark() {
        let modificationOccurred = false;
        const recursiveScan = (position) => {
            if (modificationOccurred || position > this.originalContentSize) {
                return;
            }

            const currentCell = this.currentWorkingGrid[position];
            const nextCell = this.currentWorkingGrid[position + 1];
            const previousCell = this.currentWorkingGrid[position - 1];

            if (currentCell !== 0 && nextCell === 0) {
                this.currentWorkingGrid[position + 1] = "C";
                modificationOccurred = true;
                return;
            }
            if (currentCell !== 0 && previousCell === 0) {
                this.currentWorkingGrid[position - 1] = "C";
                modificationOccurred = true;
                return;
            }
            recursiveScan(position + 1);
        };

        recursiveScan(1);

        if (!modificationOccurred) {
            const targetPosition = (this.originalContentSize % 2 === 1) ?
                ((this.originalContentSize - 1) / 2 + 1) :
                (this.originalContentSize / 2 + 1);
            this.currentWorkingGrid[targetPosition] = "C";
        }
    }

    applyDeltaMark() {
        let optimalSpot = { position: 0, reach: 0 };

        for (let centralPoint = 1; centralPoint <= this.originalContentSize; centralPoint++) {
            if (this.currentWorkingGrid[centralPoint] !== 0) {
                continue;
            }

            let leftProbe = centralPoint;
            let rightProbe = centralPoint;
            let currentReachMetric = 0;

            while (true) {
                let nextLeftProbe = leftProbe;
                let nextRightProbe = rightProbe;

                if (this.currentWorkingGrid[nextLeftProbe] !== "X") {
                    nextLeftProbe--;
                }
                if (this.currentWorkingGrid[nextRightProbe] !== "X") {
                    nextRightProbe++;
                }
                
                const testLeftValue = this.currentWorkingGrid[nextLeftProbe];
                const testRightValue = this.currentWorkingGrid[nextRightProbe];

                if (testLeftValue === "X" && testRightValue === "X") {
                    break;
                }
                if (testLeftValue !== "X" && testLeftValue !== 0) {
                    break;
                }
                if (testRightValue !== "X" && testRightValue !== 0) {
                    break;
                }

                currentReachMetric++;
                leftProbe = nextLeftProbe;
                rightProbe = nextRightProbe;
            }

            if (optimalSpot.reach < currentReachMetric) {
                optimalSpot = { position: centralPoint, reach: currentReachMetric };
            }
        }

        if (optimalSpot.position !== 0 && optimalSpot.reach !== 0) {
            this.currentWorkingGrid[optimalSpot.position] = "D";
            return;
        }

        let scanForFirstZero = 1;
        while (scanForFirstZero <= this.originalContentSize) {
            if (this.currentWorkingGrid[scanForFirstZero] === 0) {
                this.currentWorkingGrid[scanForFirstZero] = "D";
                return;
            }
            scanForFirstZero++;
        }
    }

    initializeGrid(sizeVal) {
        this.originalContentSize = sizeVal;
        this.currentWorkingGrid = ["X", ...Array.from({ length: sizeVal }, () => 0), "X"];
    }

    getFormattedResult() {
        return this.currentWorkingGrid.slice(1, -1).join("").replace(/0/g, "#");
    }
}

let inputChunks = initialDataSource.trim().split("\n");
let queuePointer = 0;

function processProblemSets() {
    let outputLines = [];

    for (;;) {
        if (queuePointer >= inputChunks.length) {
            break;
        }

        const currentLine = inputChunks[queuePointer++];
        const dimensionsData = currentLine.split(" ").map(val => parseInt(val, 10));
        const gridDimension = dimensionsData[0];
        const operationCount = dimensionsData[1];

        if (gridDimension === 0 && operationCount === 0) {
            break;
        }

        const processorInstance = new GridProcessor();
        processorInstance.initializeGrid(gridDimension);

        const operationDispatch = {
            "A": () => processorInstance.applyAlphaMark(),
            "B": () => processorInstance.applyBetaMark(),
            "C": () => processorInstance.applyGammaMark(),
            "D": () => processorInstance.applyDeltaMark(),
        };

        for (let opIdx = 0; opIdx < operationCount; opIdx++) {
            if (queuePointer >= inputChunks.length) {
                break;
            }
            const operationInstruction = inputChunks[queuePointer++];
            const actionFunction = operationDispatch[operationInstruction];
            if (actionFunction) {
                actionFunction();
            }
        }
        outputLines.push(processorInstance.getFormattedResult());
    }

    outputLines.forEach(line => console.log(line));
}

processProblemSets();