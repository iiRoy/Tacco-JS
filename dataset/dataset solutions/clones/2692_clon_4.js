const acquireInput = (textSource) => {
    class InputReaderUtility {
        #sourceSegments;
        #segmentIndex;
        #currentSegmentElements;

        constructor(rawData) {
            this.#sourceSegments = rawData.trim().split('\n');
            this.#segmentIndex = 0;
            this.#currentSegmentElements = [];
        }

        #prepareNextSegmentParts() {
            if (this.#currentSegmentElements.length === 0 && this.#segmentIndex < this.#sourceSegments.length) {
                this.#currentSegmentElements = this.#sourceSegments[this.#segmentIndex].split(' ');
            }
        }

        #advanceToNextSegment() {
            this.#segmentIndex++;
            this.#currentSegmentElements = [];
        }

        fetchNumericValue(asText = false) {
            if (this.#currentSegmentElements.length === 0) {
                this.#prepareNextSegmentParts();
                if (this.#currentSegmentElements.length === 0) {
                    return undefined;
                }
            }
            const extractedElement = this.#currentSegmentElements.shift();
            if (this.#currentSegmentElements.length === 0) {
                this.#advanceToNextSegment();
            }
            return asText ? extractedElement : Number(extractedElement);
        }

        fetchLineElements(asTexts = false) {
            if (this.#segmentIndex >= this.#sourceSegments.length) {
                return [];
            }
            const lineData = this.#sourceSegments[this.#segmentIndex];
            this.#advanceToNextSegment();
            const parts = lineData.split(' ');
            return asTexts ? parts : parts.map(Number);
        }

        fetchManyLinesAsElementArrays(count, asTexts = false) {
            const collection = [];
            for (let idx = 0; idx < count; idx++) {
                if (this.#segmentIndex >= this.#sourceSegments.length) {
                    break;
                }
                const lineData = this.#sourceSegments[this.#segmentIndex];
                this.#advanceToNextSegment();
                const parts = lineData.split(' ');
                collection.push(asTexts ? parts : parts.map(Number));
            }
            return collection;
        }

        fetchManyLinesAsSingleValues(count, asTexts = false) {
            const collection = [];
            for (let idx = 0; idx < count; idx++) {
                if (this.#segmentIndex >= this.#sourceSegments.length) {
                    break;
                }
                const lineData = this.#sourceSegments[this.#segmentIndex];
                this.#advanceToNextSegment();
                const value = lineData.trim();
                collection.push(asTexts ? value : Number(value));
            }
            return collection;
        }
    }
    return new InputReaderUtility(textSource);
};

const retrieveFactors = (targetNumber) => {
    if (targetNumber <= 0) return [];
    if (targetNumber === 1) return [1];

    const locatePairsRecursively = (value, currentDivisors, testCandidate) => {
        if (testCandidate * testCandidate > value) {
            return currentDivisors;
        }
        if (value % testCandidate === 0) {
            const complementaryFactor = value / testCandidate;
            const updatedDivisors = testCandidate === complementaryFactor
                ? [...currentDivisors, testCandidate]
                : [...currentDivisors, testCandidate, complementaryFactor];
            return locatePairsRecursively(value, updatedDivisors, testCandidate + 1);
        }
        return locatePairsRecursively(value, currentDivisors, testCandidate + 1);
    };

    const rawFactors = locatePairsRecursively(targetNumber, [1, targetNumber], 2);
    return [...new Set(rawFactors)].sort((valA, valB) => valB - valA);
};

const assessDivisorSuitability = (candidateDivisor, dataElements, allowedMaximum) => {
    const transformedRemainders = dataElements
        .map(element => element % candidateDivisor)
        .sort((a, b) => a - b);

    let rightCursor = dataElements.length;
    let currentPartialSum = 0;
    let maximumAttainedSum = 0;

    let leftCursor = 0;
    while (leftCursor < rightCursor && maximumAttainedSum <= allowedMaximum) {
        currentPartialSum += transformedRemainders[leftCursor];
        maximumAttainedSum += transformedRemainders[leftCursor];
        
        while (currentPartialSum > 0) {
            rightCursor--;
            if (rightCursor < leftCursor) {
                currentPartialSum = 0;
                break;
            }
            currentPartialSum -= (candidateDivisor - transformedRemainders[rightCursor]);
        }
        leftCursor++;
    }
    return maximumAttainedSum <= allowedMaximum;
};

const solveProblem = (inputUtility) => {
    const itemQuantity = inputUtility.fetchNumericValue();
    const capacityLimit = inputUtility.fetchNumericValue();
    const baseCollection = inputUtility.fetchLineElements();

    const aggregateTotal = baseCollection.reduce((acc, val) => acc + val, 0);
    const candidateDivisors = retrieveFactors(aggregateTotal);

    const qualifyingDivisor = candidateDivisors.find(currentCandidate =>
        assessDivisorSuitability(currentCandidate, baseCollection, capacityLimit)
    );

    return qualifyingDivisor !== undefined ? qualifyingDivisor : 1;
};

const inputSource = acquireInput(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(solveProblem(inputSource));