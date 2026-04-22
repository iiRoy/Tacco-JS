class InputAcquirer {
    constructor(textData) {
        this.allLines = textData.trim().split('\n');
        this.linePointer = 0;
        this.tokenCache = [];
    }

    _refillTokenCache() {
        if (this.tokenCache.length === 0 && this.linePointer < this.allLines.length) {
            this.tokenCache = this.allLines[this.linePointer++].split(' ');
        }
    }

    retrieveSingleValue(asString = false) {
        this._refillTokenCache();
        const extracted = this.tokenCache.shift();
        return asString ? extracted : Number(extracted);
    }

    fetchLines(count, asStrings = false) {
        const collected = [];
        for (let i = 0; i < count && this.linePointer < this.allLines.length; i++) {
            const currentLine = this.allLines[this.linePointer++];
            collected.push(asStrings ? currentLine : Number(currentLine));
        }
        return collected;
    }
}

const generateMultiDimensionalArray = (fillValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return fillValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDimSize }, () =>
        generateMultiDimensionalArray(fillValue, ...remainingDims)
    );
};

class RegionPartitioner {
    constructor(inputSource) {
        this.inputHandler = inputSource;
        this.totalRows = this.inputHandler.retrieveSingleValue();
        this.totalCols = this.inputHandler.retrieveSingleValue();
        this.targetRegionHashCount = this.inputHandler.retrieveSingleValue();
        
        this.sourceCharacterGrid = this.inputHandler.fetchLines(this.totalRows, true);
        this.outputAssignmentGrid = generateMultiDimensionalArray(0, this.totalRows, this.totalCols);
    }

    initiatePartitioning() {
        this._recursiveDivide(0, 0, this.totalRows, this.totalCols, 1, this.targetRegionHashCount);
        return this.outputAssignmentGrid.map(row => row.join(' ')).join('\n');
    }

    _recursiveDivide(currentY, currentX, currentH, currentW, currentIdentifier, expectedHashes) {
        if (expectedHashes === 1) {
            for (let r = currentY; r < currentY + currentH; r++) {
                for (let c = currentX; c < currentX + currentW; c++) {
                    this.outputAssignmentGrid[r][c] = currentIdentifier;
                }
            }
            return;
        }

        const rowHashPrefixSums = Array(currentH).fill(0);
        const colHashPrefixSums = Array(currentW).fill(0);

        for (let r = 0; r < currentH; r++) {
            for (let c = 0; c < currentW; c++) {
                if (this.sourceCharacterGrid[currentY + r][currentX + c] === '#') {
                    rowHashPrefixSums[r]++;
                    colHashPrefixSums[c]++;
                }
            }
        }

        for (let r = 1; r < currentH; r++) {
            rowHashPrefixSums[r] += rowHashPrefixSums[r - 1];
        }
        for (let c = 1; c < currentW; c++) {
            colHashPrefixSums[c] += colHashPrefixSums[c - 1];
        }

        if (currentW === 1) {
            this._splitAlongHorizontalLine(currentY, currentX, currentH, currentW, currentIdentifier, expectedHashes, rowHashPrefixSums);
        } else {
            let verticalCutColumnIndex = Math.floor(currentW / 2);
            
            if (verticalCutColumnIndex >= currentW) {
                 verticalCutColumnIndex = currentW - 1;
            }
            
            let hashesInLeftSegment = colHashPrefixSums[verticalCutColumnIndex];

            if (hashesInLeftSegment === 0) {
                let tempIndex = verticalCutColumnIndex;
                while (++tempIndex < currentW && colHashPrefixSums[tempIndex] === 0) {}
                verticalCutColumnIndex = tempIndex;
                
                if (verticalCutColumnIndex < currentW && colHashPrefixSums[verticalCutColumnIndex] === expectedHashes) {
                    this._splitAlongHorizontalLine(currentY, currentX, currentH, currentW, currentIdentifier, expectedHashes, rowHashPrefixSums);
                    return;
                }
            } else if (hashesInLeftSegment === expectedHashes) {
                let tempIndex = verticalCutColumnIndex;
                while (--tempIndex >= 0 && colHashPrefixSums[tempIndex] === expectedHashes) {}
                verticalCutColumnIndex = tempIndex;
                
                if (verticalCutColumnIndex < 0 || colHashPrefixSums[verticalCutColumnIndex] === 0 || colHashPrefixSums[verticalCutColumnIndex] === expectedHashes) {
                    this._splitAlongHorizontalLine(currentY, currentX, currentH, currentW, currentIdentifier, expectedHashes, rowHashPrefixSums);
                    return;
                }
            }

            const leftPartitionWidth = verticalCutColumnIndex + 1;
            const rightPartitionWidth = currentW - leftPartitionWidth;
            const hashesInLeftPartition = colHashPrefixSums[verticalCutColumnIndex];
            
            this._recursiveDivide(currentY, currentX, currentH, leftPartitionWidth, currentIdentifier, hashesInLeftPartition);
            this._recursiveDivide(currentY, currentX + leftPartitionWidth, currentH, rightPartitionWidth, currentIdentifier + hashesInLeftPartition, expectedHashes - hashesInLeftPartition);
        }
    }

    _splitAlongHorizontalLine(currentY, currentX, currentH, currentW, currentIdentifier, expectedHashes, rowHashPrefixSums) {
        let horizontalCutRowIndex = Math.floor(currentH / 2);

        if (horizontalCutRowIndex >= currentH) {
            horizontalCutRowIndex = currentH - 1;
        }

        let hashesInUpperSegment = rowHashPrefixSums[horizontalCutRowIndex];

        if (hashesInUpperSegment === 0) {
            let tempIndex = horizontalCutRowIndex;
            while (++tempIndex < currentH && rowHashPrefixSums[tempIndex] === 0) {}
            horizontalCutRowIndex = tempIndex;
        } else if (hashesInUpperSegment === expectedHashes) {
            let tempIndex = horizontalCutRowIndex;
            while (--tempIndex >= 0 && rowHashPrefixSums[tempIndex] === expectedHashes) {}
            horizontalCutRowIndex = tempIndex;
        }

        const upperPartitionHeight = horizontalCutRowIndex + 1;
        const lowerPartitionHeight = currentH - upperPartitionHeight;
        const hashesInUpperPartition = rowHashPrefixSums[horizontalCutRowIndex];

        this._recursiveDivide(currentY, currentX, upperPartitionHeight, currentW, currentIdentifier, hashesInUpperPartition);
        this._recursiveDivide(currentY + upperPartitionHeight, currentX, lowerPartitionHeight, currentW, currentIdentifier + hashesInUpperPartition, expectedHashes - hashesInUpperPartition);
    }
}

const programEntryPoint = () => {
    const inputHandler = new InputAcquirer(require("fs").readFileSync("/dev/stdin", "utf8"));
    const gridProcessor = new RegionPartitioner(inputHandler);
    console.log(gridProcessor.initiatePartitioning());
};

programEntryPoint();