"use strict";

function ProcessInputAndCompute(rawInput) {
    const dataReader = new DataStream(rawInput);

    const elementCount = dataReader.fetchInteger();
    const modulusValue = dataReader.fetchInteger();
    const numberSequence = dataReader.fetchIntegerArray(elementCount);

    const cumulativeSumsMod = numberSequence.reduce((accumulator, currentElement) => {
        const previousSum = accumulator[accumulator.length - 1];
        accumulator.push((previousSum + currentElement) % modulusValue);
        return accumulator;
    }, [0]);

    const sumFrequencyMap = cumulativeSumsMod.reduce((accumulator, currentSumValue) => {
        accumulator[currentSumValue] = (accumulator[currentSumValue] || 0) + 1;
        return accumulator;
    }, {});

    const totalPairCount = Object.values(sumFrequencyMap).reduce((totalAccumulator, frequencyCount) => {
        return totalAccumulator + (frequencyCount * (frequencyCount - 1) / 2);
    }, 0);

    console.log(totalPairCount);
}

class DataStream {
    #tokenGenerator;

    constructor(sourceText) {
        const originalSplitItems = sourceText.split(/\n|\s/);
        let tokenIndex = 0;

        this.#tokenGenerator = (function* () {
            while (tokenIndex < originalSplitItems.length) {
                yield originalSplitItems[tokenIndex++];
            }
        })();
    }

    fetchInteger() {
        const nextTokenResult = this.#tokenGenerator.next();
        if (nextTokenResult.done) {
            throw new Error("Input stream exhausted while fetching integer.");
        }
        return nextTokenResult.value - 0;
    }

    fetchIntegerArray(count) {
        return Array.from({ length: count }, () => this.fetchInteger());
    }

    fetchString() {
        const nextTokenResult = this.#tokenGenerator.next();
        if (nextTokenResult.done) {
            throw new Error("Input stream exhausted while fetching string.");
        }
        return nextTokenResult.value;
    }

    fetchStringArray(count) {
        return Array.from({ length: count }, () => this.fetchString());
    }
}

if (typeof window === "undefined") {
    ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
}
