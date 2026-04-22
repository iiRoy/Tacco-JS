class PathCalculationUnit {
    constructor(fieldWidth, fieldLayout) {
        this.width = fieldWidth;
        this.layout = fieldLayout;
        this.pathCache = new Map();
        this.processingQueue = [];
        this.finalPathLength = "NO_SOLUTION";
    }

    executeSearch() {
        this.processingQueue.push([0, 0, 0]);
        this.processingQueue.push([1, 0, 0]);

        while (this.processingQueue.length > 0) {
            let [rLoc, cLoc, currentSteps] = this.processingQueue.shift();
            let locationIdentifier = `${rLoc},${cLoc}`;

            if (this.pathCache.has(locationIdentifier)) {
                continue;
            }
            this.pathCache.set(locationIdentifier, true);

            if (cLoc === this.width - 1 && this.layout[rLoc] && this.layout[rLoc][cLoc] !== 2) {
                this.finalPathLength = currentSteps;
                break;
            }

            let cellCharacteristic = this.layout[rLoc] ? this.layout[rLoc][cLoc] : undefined;
            let modifiedCLoc = cLoc;
            let bypassNextSteps = false;

            if (cellCharacteristic === 1) {
                let tempColumn = cLoc;
                let reachedTerminal = false;
                while (true) {
                    tempColumn++;
                    if (tempColumn === this.width - 1) {
                        reachedTerminal = true;
                        break;
                    }
                    if (tempColumn >= this.width || !(this.layout[rLoc] && this.layout[rLoc][tempColumn] === 1)) {
                        tempColumn--;
                        break;
                    }
                }
                if (reachedTerminal) {
                    bypassNextSteps = true;
                } else {
                    modifiedCLoc = tempColumn;
                }
            } else if (cellCharacteristic === 2) {
                let tempColumn = cLoc;
                while (true) {
                    tempColumn--;
                    if (tempColumn < 0 || !(this.layout[rLoc] && this.layout[rLoc][tempColumn] === 2)) {
                        break;
                    }
                }
                modifiedCLoc = tempColumn;
            }

            if (bypassNextSteps) {
                continue;
            }

            let nextRow = 1 - rLoc;
            for (let columnShift = 0; columnShift <= 2; columnShift++) {
                let nextColumn = modifiedCLoc + columnShift;
                this.processingQueue.push([nextRow, nextColumn, currentSteps + 1]);
            }
        }
        return this.finalPathLength;
    }
}

const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineData = systemInput.trim().split("\n");
let outputBuffer = [];

function processInputLines(dataLines) {
    let index = 0;
    while (true) {
        let currentWidth = parseInt(dataLines[index++], 10);
        if (currentWidth === 0) {
            break;
        }

        let currentLayout = [];
        currentLayout[0] = dataLines[index++].split(" ").map(Number);
        currentLayout[1] = dataLines[index++].split(" ").map(Number);

        let solver = new PathCalculationUnit(currentWidth, currentLayout);
        outputBuffer.push(solver.executeSearch());
    }
    return outputBuffer.join("\n");
}

console.log(processInputLines(lineData));