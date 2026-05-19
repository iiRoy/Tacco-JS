class InputReader {
    #lineSource;
    #lineCursor;

    constructor(rawContent) {
        this.#lineSource = rawContent.trim().split('\n');
        this.#lineCursor = 0;
    }

    // Replaces g.prototype.a
    acquireToken(asString) {
        let currentSegment = this.#lineSource[this.#lineCursor];
        let extractedValue;

        if (typeof currentSegment === "string") {
            this.#lineSource[this.#lineCursor] = currentSegment.split(' ').reverse();
            currentSegment = this.#lineSource[this.#lineCursor];
        }

        extractedValue = currentSegment.pop();

        if (currentSegment.length === 0) {
            this.#lineCursor++;
        }

        return asString ? extractedValue : Number(extractedValue);
    }

    // Replaces g.prototype.l
    obtainLine(asString) {
        const lineContent = this.#lineSource[this.#lineCursor++];
        const parts = String(lineContent).split(' ');
        return asString ? parts : parts.map(val => Number(val));
    }

    // Replaces g.prototype.m
    gatherMatrix(count, asString) {
        const collectedRows = [];
        for (let i = 0; i < count; i++) {
            const lineContent = this.#lineSource[this.#lineCursor++];
            const parts = String(lineContent).split(' ');
            collectedRows.push(asString ? parts : parts.map(val => Number(val)));
        }
        return collectedRows;
    }

    // Replaces g.prototype.r
    collectRaw(count, asString) {
        const collectedLines = this.#lineSource.slice(this.#lineCursor, this.#lineCursor + count);
        this.#lineCursor += count;
        return asString ? collectedLines : collectedLines.map(val => Number(val));
    }
}

const createInputParser = (function() {
    function parserFactory(sourceText) {
        return new InputReader(sourceText);
    }
    return parserFactory;
})();

const dataReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInput() {
    const entryCount = dataReader.acquireToken();
    const stringCollection = dataReader.collectRaw(entryCount, true);

    let totalScore = 0;
    let endsWithA = 0;
    let startsWithB = 0;
    let startsBEndsA = 0;

    stringCollection.forEach(currentString => {
        totalScore += Array.from(currentString)
            .slice(1)
            .filter((char, charIndex) => currentString[charIndex] === 'A' && char === 'B')
            .length;

        const firstCharacter = currentString[0];
        const lastCharacter = currentString[currentString.length - 1];

        if (firstCharacter === 'B') {
            if (lastCharacter === 'A') {
                startsBEndsA++;
            } else {
                startsWithB++;
            }
        } else if (lastCharacter === 'A') {
            endsWithA++;
        }
    });

    const minimumCount = Math.min(endsWithA, startsWithB);
    const maximumCount = Math.max(endsWithA, startsWithB);

    if (maximumCount > 0) {
        if (startsBEndsA > 0) {
            totalScore += minimumCount + startsBEndsA;
        } else {
            totalScore += minimumCount;
        }
    } else {
        totalScore += startsBEndsA - 1;
    }

    return totalScore;
}

console.log(processInput());
