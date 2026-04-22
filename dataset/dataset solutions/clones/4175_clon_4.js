class SequenceProcessor {
    constructor(sourceData) {
        this.initialString = sourceData;
        this.numericalList = [];
        this.operationLog = [];
        this.dataSize = 0;
        this.peakValue = -1e10;
        this.troughValue = 1e10;
        this.peakIndex = -1;
        this.troughIndex = -1;
    }

    // Step 1: Extract and analyze initial data
    ingestAndAssess() {
        const textSegments = this.initialString.split("\n");
        this.dataSize = parseInt(textSegments[0].split(" ")[0]);
        const stringNumbers = textSegments[1].split(" ");

        this.numericalList = stringNumbers.slice(0, this.dataSize).map((s, idx) => {
            const num = parseInt(s, 10);
            if (num > this.peakValue) {
                this.peakValue = num;
                this.peakIndex = idx;
            }
            if (num < this.troughValue) {
                this.troughValue = num;
                this.troughIndex = idx;
            }
            return num;
        });
    }

    // Step 2: Determine the appropriate processing pathway
    identifyPathway() {
        if (this.troughValue >= 0) {
            return "ascendingSort";
        } else if (this.peakValue < 0) {
            return "descendingSort";
        } else if (this.peakValue > Math.abs(this.troughValue)) {
            return "positiveBias";
        } else { // Math.abs(this.troughValue) >= this.peakValue
            return "negativeBias";
        }
    }

    // Helper for logging operations (specific to ascendingSort)
    registerAscendingOp(currentIdx) {
        this.operationLog.push([currentIdx + 1, currentIdx + 2]);
    }

    // Helper for logging operations (specific to descendingSort and negativeBias second pass)
    registerDescendingOp(currentIdx) {
        this.operationLog.push([currentIdx + 2, currentIdx + 1]);
    }

    // Helper for logging operations (specific to initial pass of bias strategies)
    registerBiasOp(sourceIdx, destinationIdx) {
        this.operationLog.push([sourceIdx + 1, destinationIdx + 1]);
    }

    // Helper for logging operations (specific to positiveBias second pass)
    registerPositiveBiasAscendingOp(currentIdx) {
        this.operationLog.push([currentIdx, currentIdx + 1]);
    }

    // Helper for modifying the list (a[i] = a[i-1] + a[i])
    mutateFromPrevious(currentIdx) {
        this.numericalList[currentIdx] = this.numericalList[currentIdx - 1] + this.numericalList[currentIdx];
    }

    // Helper for modifying the list (a[i] = a[i+1] + a[i])
    mutateFromNext(currentIdx) {
        this.numericalList[currentIdx] = this.numericalList[currentIdx + 1] + this.numericalList[currentIdx];
    }

    // Helper for modifying the list (a[destIdx] = a[destIdx] + a[sourceIdx])
    mutateBySourceValue(sourceIdx, destinationIdx) {
        this.numericalList[destinationIdx] = this.numericalList[destinationIdx] + this.numericalList[sourceIdx];
    }

    // Pathway 1: All non-negative, ensure non-decreasing order
    performAscendingSort() {
        for (let k = 1; k < this.dataSize; ++k) {
            if (this.numericalList[k] < this.numericalList[k - 1]) {
                this.registerAscendingOp(k);
                this.mutateFromPrevious(k);
            }
        }
    }

    // Pathway 2: All negative, ensure non-increasing order
    performDescendingSort() {
        for (let k = this.dataSize - 2; k >= 0; --k) {
            if (this.numericalList[k] > this.numericalList[k + 1]) {
                this.registerDescendingOp(k);
                this.mutateFromNext(k);
            }
        }
    }

    // Pathway 3: Mixed, positive values dominate
    executePositiveBias() {
        const primaryAdderVal = this.peakValue;
        const primaryAdderIdx = this.peakIndex;

        for (let k = 0; k < this.dataSize; ++k) {
            if (k !== primaryAdderIdx) {
                this.registerBiasOp(primaryAdderIdx, k);
                this.mutateBySourceValue(primaryAdderIdx, k);
            }
        }
        // Second phase: apply ascending sort logic with specific logging
        for (let k = 1; k < this.dataSize; ++k) {
            if (this.numericalList[k] < this.numericalList[k - 1]) {
                this.registerPositiveBiasAscendingOp(k);
                this.mutateFromPrevious(k);
            }
        }
    }

    // Pathway 4: Mixed, negative values dominate
    executeNegativeBias() {
        const primaryAdderVal = this.troughValue;
        const primaryAdderIdx = this.troughIndex;

        for (let k = 0; k < this.dataSize; ++k) {
            if (k !== primaryAdderIdx) {
                this.registerBiasOp(primaryAdderIdx, k);
                this.mutateBySourceValue(primaryAdderIdx, k);
            }
        }
        // Second phase: apply descending sort logic (same logging as performDescendingSort)
        for (let k = this.dataSize - 2; k >= 0; --k) {
            if (this.numericalList[k] > this.numericalList[k + 1]) {
                this.registerDescendingOp(k);
                this.mutateFromNext(k);
            }
        }
    }

    // Orchestrates the entire process
    processDataSequence() {
        this.ingestAndAssess();
        const selectedPathway = this.identifyPathway();

        const pathwayDispatch = {
            "ascendingSort": this.performAscendingSort,
            "descendingSort": this.performDescendingSort,
            "positiveBias": this.executePositiveBias,
            "negativeBias": this.executeNegativeBias
        };

        pathwayDispatch[selectedPathway].call(this); // Execute the chosen pathway

        return this.generateReport();
    }

    // Formats the final output string
    generateReport() {
        let reportLines = [];
        reportLines.push(this.operationLog.length.toString());
        this.operationLog.forEach(op => {
            reportLines.push(`${op[0]} ${op[1]}`);
        });
        return reportLines.join("\n");
    }
}

// Entry point for the transformation system
function CoordinateTransformationSystem(incomingData) {
    const dataProcessor = new SequenceProcessor(incomingData);
    return dataProcessor.processDataSequence();
}

// Standard I/O handler for the environment
(function() {
    const filesystemContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const finalResultDisplay = CoordinateTransformationSystem(filesystemContent);
    console.log(finalResultDisplay);
})();