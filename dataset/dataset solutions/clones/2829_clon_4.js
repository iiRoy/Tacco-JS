class DataStreamer {
    #valueSegments;
    #currentSegmentIndex = 0;

    constructor(sourceText) {
        this.#valueSegments = sourceText.trim().split('\n').map(lineStr => lineStr.split(' ').map(Number));
    }

    pullSingleDatum(returnAsString = false) {
        if (this.#currentSegmentIndex >= this.#valueSegments.length) {
            throw new Error("Input stream exhausted.");
        }
        const activeSegment = this.#valueSegments[this.#currentSegmentIndex];

        let extractedValue;
        if (activeSegment.length === 0) {
            this.#currentSegmentIndex++;
            return this.pullSingleDatum(returnAsString);
        }
        extractedValue = activeSegment.pop();

        if (activeSegment.length === 0) {
            this.#currentSegmentIndex++;
        }
        return returnAsString ? String(extractedValue) : extractedValue;
    }

    pullSegmentData(returnAsString = false) {
        if (this.#currentSegmentIndex >= this.#valueSegments.length) {
            throw new Error("Input stream exhausted.");
        }
        const fullSegment = this.#valueSegments[this.#currentSegmentIndex];
        this.#currentSegmentIndex++;
        return returnAsString ? fullSegment.map(String) : fullSegment;
    }

    pullMatrixData(count, returnAsString = false) {
        const collectedData = [];
        for (let i = 0; i < count; i++) {
            if (this.#currentSegmentIndex >= this.#valueSegments.length) {
                throw new Error("Input stream exhausted while reading matrix.");
            }
            const segmentRow = this.#valueSegments[this.#currentSegmentIndex];
            this.#currentSegmentIndex++;
            collectedData.push(returnAsString ? segmentRow.map(String) : segmentRow);
        }
        return collectedData;
    }

    pullRowsData(count, returnAsString = false) {
        const collectedData = [];
        for (let i = 0; i < count; i++) {
            if (this.#currentSegmentIndex >= this.#valueSegments.length) {
                throw new Error("Input stream exhausted while reading rows.");
            }
            const segmentRow = this.#valueSegments[this.#currentSegmentIndex];
            this.#currentSegmentIndex++;
            if (segmentRow.length !== 1) {
                throw new Error("Expected single value per row for rows data.");
            }
            collectedData.push(returnAsString ? String(segmentRow[0]) : segmentRow[0]);
        }
        return collectedData;
    }
}

function fabricateArr(dimensions, initialVal) {
    const generator = (remainingDims) => {
        if (remainingDims.length === 0) {
            return initialVal;
        }
        const currentDimSize = remainingDims[0];
        const nextDims = remainingDims.slice(1);
        return Array.from({ length: currentDimSize }, () => generator(nextDims));
    };
    return generator(dimensions);
}

const primeDivisor = 1000000007;

function processSequences() {
    const inputReader = new DataStreamer(require("fs").readFileSync("/dev/stdin","utf8"));

    const lengthA = inputReader.pullSingleDatum();
    const lengthB = inputReader.pullSingleDatum();
    const sequenceA = inputReader.pullSegmentData();
    const sequenceB = inputReader.pullSegmentData();

    const calculationGrid = fabricateArr([lengthA + 1, lengthB + 1], 0);
    let finalResult = 1;

    for (let currentIdxA = 0; currentIdxA < lengthA; ++currentIdxA) {
        for (let currentIdxB = 0; currentIdxB < lengthB; ++currentIdxB) {
            let intermediateValue;
            if (sequenceA[currentIdxA] === sequenceB[currentIdxB]) {
                finalResult = (finalResult + calculationGrid[currentIdxA][currentIdxB] + 1);
                finalResult = ((finalResult % primeDivisor) + primeDivisor) % primeDivisor;

                intermediateValue = (calculationGrid[currentIdxA + 1][currentIdxB] + calculationGrid[currentIdxA][currentIdxB + 1] + 1);
            } else {
                intermediateValue = (calculationGrid[currentIdxA + 1][currentIdxB] + calculationGrid[currentIdxA][currentIdxB + 1] - calculationGrid[currentIdxA][currentIdxB]);
            }
            calculationGrid[currentIdxA + 1][currentIdxB + 1] = ((intermediateValue % primeDivisor) + primeDivisor) % primeDivisor;
        }
    }
    return finalResult;
}

console.log(processSequences());