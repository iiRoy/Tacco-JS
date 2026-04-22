class InputProcessor {
    #tokens;
    #currentIndex;

    constructor(sourceContent) {
        this.#tokens = sourceContent.split(/ |\n/).filter(s => s !== '');
        this.#currentIndex = 0;
    }

    fetchNumeric() {
        if (this.#currentIndex >= this.#tokens.length) throw new Error("End of input stream.");
        return Number(this.#tokens[this.#currentIndex++]);
    }

    fetchStringSegment() {
        if (this.#currentIndex >= this.#tokens.length) throw new Error("End of input stream.");
        return this.#tokens[this.#currentIndex++];
    }

    fetchNumericSequence(count) {
        const sequence = [];
        for (let k = 0; k < count; k++) {
            sequence.push(this.fetchNumeric());
        }
        return sequence;
    }
}

class ScoreMatrix {
    #dataStorage;
    #defaultCellValue;

    constructor(initialDefault = -1) {
        this.#dataStorage = new Map();
        this.#defaultCellValue = initialDefault;
    }

    getCellValue(rowCoord, colCoord) {
        const rowMap = this.#dataStorage.get(rowCoord);
        if (!rowMap) return this.#defaultCellValue;
        return rowMap.has(colCoord) ? rowMap.get(colCoord) : this.#defaultCellValue;
    }

    setCellValue(rowCoord, colCoord, newValue) {
        if (newValue === this.#defaultCellValue) {
            const rowMap = this.#dataStorage.get(rowCoord);
            if (rowMap) {
                rowMap.delete(colCoord);
                if (rowMap.size === 0) this.#dataStorage.delete(rowCoord);
            }
            return;
        }
        let rowMap = this.#dataStorage.get(rowCoord);
        if (!rowMap) {
            rowMap = new Map();
            this.#dataStorage.set(rowCoord, rowMap);
        }
        rowMap.set(colCoord, newValue);
    }

    applyProposedModifications(modificationList) {
        for (const modification of modificationList) {
            const currentVal = this.getCellValue(modification.targetRow, modification.targetCol);
            if (modification.proposedVal > currentVal) {
                this.setCellValue(modification.targetRow, modification.targetCol, modification.proposedVal);
            }
        }
    }
}

function generateCellModifications(currentMatrix, firstParam, secondParam, thirdParam, dimensionLimit) {
    const pendingChanges = [];

    const addModification = (targetR, targetC, sourceR, sourceC, incrementValue) => {
        const sourceScore = currentMatrix.getCellValue(sourceR, sourceC);
        const potentialNewScore = sourceScore + incrementValue;
        pendingChanges.push({
            targetRow: targetR,
            targetCol: targetC,
            proposedVal: potentialNewScore
        });
    };

    // Logic equivalent to solve1(firstParam)
    addModification(0, 0, firstParam, firstParam, 1);
    for (let currentIdx = 0; currentIdx < firstParam; currentIdx++) {
        addModification(currentIdx, firstParam, 0, currentIdx, 0);
    }
    for (let currentIdx = firstParam; currentIdx <= dimensionLimit; currentIdx++) {
        addModification(firstParam, currentIdx, 0, currentIdx, 0);
    }

    // Logic equivalent to solve1(secondParam) if firstParam < secondParam
    if (firstParam < secondParam) {
        addModification(0, 0, secondParam, secondParam, 1);
        for (let currentIdx = 0; currentIdx < secondParam; currentIdx++) {
            addModification(currentIdx, secondParam, 0, currentIdx, 0);
        }
        for (let currentIdx = secondParam; currentIdx <= dimensionLimit; currentIdx++) {
            addModification(secondParam, currentIdx, 0, currentIdx, 0);
        }
    }

    // Logic equivalent to solve1(thirdParam) if secondParam < thirdParam
    if (secondParam < thirdParam) {
        addModification(0, 0, thirdParam, thirdParam, 1);
        for (let currentIdx = 0; currentIdx < thirdParam; currentIdx++) {
            addModification(currentIdx, thirdParam, 0, currentIdx, 0);
        }
        for (let currentIdx = thirdParam; currentIdx <= dimensionLimit; currentIdx++) {
            addModification(thirdParam, currentIdx, 0, currentIdx, 0);
        }
    }

    // Logic equivalent to solve2(firstParam, secondParam)
    addModification(firstParam, secondParam, 0, 0, 0);
    addModification(0, secondParam, firstParam, firstParam, 1);
    if (firstParam < secondParam) {
        addModification(0, firstParam, secondParam, secondParam, 1);
    } else { // firstParam = secondParam
        for (let currentIdx = 0; currentIdx < firstParam; currentIdx++) {
            addModification(0, currentIdx, currentIdx, firstParam, 1);
        }
        for (let currentIdx = firstParam; currentIdx <= dimensionLimit; currentIdx++) {
            addModification(0, currentIdx, firstParam, currentIdx, 1);
        }
    }

    // Logic equivalent to solve2(firstParam, thirdParam) if secondParam < thirdParam
    if (secondParam < thirdParam) {
        addModification(firstParam, thirdParam, 0, 0, 0);
        addModification(0, thirdParam, firstParam, firstParam, 1);
        if (firstParam < thirdParam) {
            addModification(0, firstParam, thirdParam, thirdParam, 1);
        } else { // firstParam = thirdParam
            for (let currentIdx = 0; currentIdx < firstParam; currentIdx++) {
                addModification(0, currentIdx, currentIdx, firstParam, 1);
            }
            for (let currentIdx = firstParam; currentIdx <= dimensionLimit; currentIdx++) {
                addModification(0, currentIdx, firstParam, currentIdx, 1);
            }
        }
    }

    // Logic equivalent to solve2(secondParam, thirdParam) if firstParam < secondParam
    if (firstParam < secondParam) {
        addModification(secondParam, thirdParam, 0, 0, 0);
        addModification(0, thirdParam, secondParam, secondParam, 1);
        if (secondParam < thirdParam) {
            addModification(0, secondParam, thirdParam, thirdParam, 1);
        } else { // secondParam = thirdParam
            for (let currentIdx = 0; currentIdx < secondParam; currentIdx++) {
                addModification(0, currentIdx, currentIdx, secondParam, 1);
            }
            for (let currentIdx = secondParam; currentIdx <= dimensionLimit; currentIdx++) {
                addModification(0, currentIdx, secondParam, currentIdx, 1);
            }
        }
    }

    // Logic equivalent to solve3(firstParam, secondParam, thirdParam)
    addModification(secondParam, thirdParam, firstParam, firstParam, 1);
    if (firstParam < secondParam) {
        addModification(firstParam, thirdParam, secondParam, secondParam, 1);
        if (secondParam < thirdParam) {
            addModification(firstParam, secondParam, thirdParam, thirdParam, 1);
        } else { // secondParam = thirdParam
            for (let currentIdx = 0; currentIdx < firstParam; currentIdx++) {
                addModification(currentIdx, firstParam, currentIdx, thirdParam, 1);
            }
            for (let currentIdx = firstParam; currentIdx < thirdParam; currentIdx++) {
                addModification(firstParam, currentIdx, currentIdx, thirdParam, 1);
            }
            for (let currentIdx = thirdParam; currentIdx <= dimensionLimit; currentIdx++) {
                addModification(firstParam, currentIdx, thirdParam, currentIdx, 1);
            }
        }
    } else { // firstParam = secondParam
        addModification(firstParam, firstParam, thirdParam, thirdParam, 1);
        for (let currentIdx = 0; currentIdx < firstParam; currentIdx++) {
            addModification(currentIdx, thirdParam, currentIdx, firstParam, 1);
        }
        for (let currentIdx = firstParam; currentIdx < thirdParam; currentIdx++) {
            addModification(currentIdx, thirdParam, firstParam, currentIdx, 1);
        }
        for (let currentIdx = thirdParam; currentIdx <= dimensionLimit; currentIdx++) {
            addModification(thirdParam, currentIdx, firstParam, currentIdx, 1);
        }
    }

    return pendingChanges;
}

function orchestrateComputation() {
    const dataStream = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
    const gridDimension = dataStream.fetchNumeric();
    const scoreGrid = new ScoreMatrix();
    let specialConditionCounter = 0;

    const initialElements = dataStream.fetchNumericSequence(2);
    const elementX = initialElements[0];
    const elementY = initialElements[1];

    scoreGrid.setCellValue(0, 0, 0);
    scoreGrid.setCellValue(0, elementX, 0);
    scoreGrid.setCellValue(0, elementY, 0);
    scoreGrid.setCellValue(elementX, elementY, 0);

    for (let loopCount = 1; loopCount < gridDimension; loopCount++) {
        const currentTriplet = dataStream.fetchNumericSequence(3).sort((val1, val2) => val1 - val2);
        const [p1, p2, p3] = currentTriplet;

        if (p1 === p3) {
            specialConditionCounter++;
        }

        const proposedModifications = generateCellModifications(scoreGrid, p1, p2, p3, gridDimension);
        scoreGrid.applyProposedModifications(proposedModifications);
    }

    const finalValueQuery = dataStream.fetchNumeric();
    const computationResult = Math.max(scoreGrid.getCellValue(0, 0), scoreGrid.getCellValue(finalValueQuery, finalValueQuery) + 1) + specialConditionCounter;
    return computationResult;
}

const finalOutput = orchestrateComputation();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}