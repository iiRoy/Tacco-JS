"use strict";

class InputProcessor {
    constructor(sourceText) {
        this.lineSegments = sourceText.trim().split('\n');
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
        this._loadTokensForCurrentLine();
    }

    _loadTokensForCurrentLine() {
        if (this.currentLineIndex < this.lineSegments.length) {
            this.currentLineTokens = this.lineSegments[this.currentLineIndex].split(' ').reverse();
        } else {
            this.currentLineTokens = [];
        }
    }

    _advanceToNextLine() {
        this.currentLineIndex++;
        this._loadTokensForCurrentLine();
    }

    fetchToken(asString) {
        if (this.currentLineTokens.length === 0) {
            this._advanceToNextLine();
            if (this.currentLineTokens.length === 0 && this.currentLineIndex >= this.lineSegments.length) {
                throw new Error("End of input reached.");
            }
        }
        const token = this.currentLineTokens.pop();
        return asString ? token : Number(token);
    }

    fetchLine(asString) {
        if (this.currentLineIndex >= this.lineSegments.length) {
            throw new Error("End of input reached.");
        }
        const lineContent = this.lineSegments[this.currentLineIndex++];
        this._loadTokensForCurrentLine();
        const tokens = lineContent.split(' ');
        return asString ? tokens : tokens.map(Number);
    }

    fetchMatrix(rowsCount, asString) {
        const resultMatrix = [];
        for (let k = 0; k < rowsCount; k++) {
            resultMatrix.push(this.fetchLine(asString));
        }
        return resultMatrix;
    }

    fetchRows(rowsCount, asString) {
        const resultRows = [];
        for (let k = 0; k < rowsCount; k++) {
            if (this.currentLineIndex >= this.lineSegments.length) {
                throw new Error("End of input reached while extracting rows.");
            }
            const row = this.lineSegments[this.currentLineIndex++];
            resultRows.push(asString ? row : Number(row));
        }
        this._loadTokensForCurrentLine();
        return resultRows;
    }
}

const createProcessor = (source) => new InputProcessor(source);

const constructMultiDimensionalArray = (initialValue, ...dimensions) => {
    const buildArrayRecursively = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => buildArrayRecursively(remainingDimensions));
    };
    return buildArrayRecursively(dimensions);
};

const dataStream = createProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateProtection() {
    const totalItems = dataStream.fetchToken();
    const protectionRange = dataStream.fetchToken();
    const effectMultiplier = dataStream.fetchToken();

    const itemDetails = dataStream.fetchMatrix(totalItems).sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);

    const processingResult = itemDetails.reduce((accumulator, currentItem) => {
        const [itemPosition, itemRequirement] = currentItem;

        while (accumulator.activeProtections.length > 0 && accumulator.activeProtections[0].expiryPoint < itemPosition - protectionRange) {
            const expiredProtection = accumulator.activeProtections.shift();
            accumulator.currentEffect -= expiredProtection.unitsApplied;
        }

        const neededForCurrentItem = itemRequirement - accumulator.currentEffect * effectMultiplier;

        if (neededForCurrentItem > 0) {
            const unitsToApply = Math.ceil(neededForCurrentItem / effectMultiplier);
            accumulator.activeProtections.push({ expiryPoint: itemPosition + protectionRange, unitsApplied: unitsToApply });
            accumulator.totalUnitsApplied += unitsToApply;
            accumulator.currentEffect += unitsToApply;
        }
        return accumulator;
    }, { totalUnitsApplied: 0, currentEffect: 0, activeProtections: [] });

    return processingResult.totalUnitsApplied;
}

const finalOutput = calculateProtection();
if (finalOutput !== undefined) {
    console.log(finalOutput);
}
