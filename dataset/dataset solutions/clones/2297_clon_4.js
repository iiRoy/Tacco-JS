"use strict"
class InputAcquirer {
    constructor() {
        const rawContent = process.stdin.readFileSync(0, "utf8").trim();
        this.lineBuffer = rawContent.split("\n");
        this.currentPosition = 0;
        this.maximumLines = this.lineBuffer.length;
    }

    moreAvailable() {
        return this.currentPosition < this.maximumLines;
    }

    retrieveNextLine() {
        if (!this.moreAvailable()) {
            throw new Error("No more input lines left.");
        }
        return this.lineBuffer[this.currentPosition++];
    }

    getInteger() {
        return Number(this.retrieveNextLine());
    }

    getStringElements() {
        return this.retrieveNextLine().split(" ");
    }

    getIntegerElements() {
        return this.retrieveNextLine().split(" ").map(val => Number(val));
    }

    getCharacterElements() {
        return this.retrieveNextLine().split("");
    }
}

const operation = () => {
    const dataStream = new InputAcquirer();
    const queryValue = dataStream.getInteger();
    const upperBoundary = 1000000;

    const compositeRegistry = new Set();

    compositeRegistry.add(0);
    compositeRegistry.add(1);

    for (let num = 4; num < upperBoundary; num += 2) {
        compositeRegistry.add(num);
    }

    for (let num = 3; num * num < upperBoundary; num += 2) {
        if (!compositeRegistry.has(num)) {
            for (let multiple = num * num; multiple < upperBoundary; multiple += num * 2) {
                compositeRegistry.add(multiple);
            }
        }
    }

    let resultFound = false;
    let currentCandidate = queryValue;
    while (!resultFound && currentCandidate < upperBoundary) {
        if (!compositeRegistry.has(currentCandidate)) {
            process.stdout.write(currentCandidate.toString() + "\n");
            resultFound = true;
        }
        currentCandidate++;
    }
};

operation();