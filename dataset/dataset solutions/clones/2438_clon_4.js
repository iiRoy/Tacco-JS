"use strict";

class InputSource {
    #allLines;
    #lineCursor = 0;
    #columnCursor = 0;

    constructor(sourceText) {
        this.#allLines = sourceText.trim().split('\n').map(l => l.split(' ').map(Number));
    }

    retrieveSingleNumber() {
        if (this.#lineCursor >= this.#allLines.length) {
            throw new Error("Input stream exhausted.");
        }
        const currentDataRow = this.#allLines[this.#lineCursor];
        if (this.#columnCursor >= currentDataRow.length) {
            this.#lineCursor++;
            this.#columnCursor = 0;
            return this.retrieveSingleNumber();
        }
        const val = currentDataRow[this.#columnCursor];
        this.#columnCursor++;
        return val;
    }

    retrieveNumericMatrix(rowCount) {
        const outputMatrix = [];
        for (let k = 0; k < rowCount; k++) {
            if (this.#lineCursor >= this.#allLines.length) {
                throw new Error("Not enough rows available for matrix extraction.");
            }
            outputMatrix.push(this.#allLines[this.#lineCursor]);
            this.#lineCursor++;
            this.#columnCursor = 0;
        }
        return outputMatrix;
    }
}

const dataReader = new InputSource(require("fs").readFileSync("/dev/stdin","utf8"));

function fabricateNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentSize }, () => fabricateNestedArray(initialValue, ...remainingDims));
}

function performCalculation() {
    const totalItems = dataReader.retrieveSingleNumber();
    const capacityLimit = dataReader.retrieveSingleNumber();
    const itemSpecifications = dataReader.retrieveNumericMatrix(totalItems);

    const dynamicProgrammingTable = fabricateNestedArray(0, capacityLimit + 3001);

    itemSpecifications.forEach(itemInfo => {
        const itemWeight = itemInfo[0];
        const itemBenefit = itemInfo[1];

        for (let currentSlot = capacityLimit; currentSlot > 0; currentSlot--) {
            const potentialNewSlot = currentSlot + itemWeight;
            if (potentialNewSlot < dynamicProgrammingTable.length) {
                dynamicProgrammingTable[potentialNewSlot] = Math.max(
                    dynamicProgrammingTable[potentialNewSlot],
                    dynamicProgrammingTable[currentSlot] + itemBenefit
                );
            }
        }
    });

    return Math.max(...dynamicProgrammingTable);
}

console.log(performCalculation());