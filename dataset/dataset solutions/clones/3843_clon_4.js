class InputProcessor {
    constructor(sourceText) {
        this.sourceLines = sourceText.split("\n");
        this.currentLinePosition = 0;
        this.activeLineTokens = null;
    }

    // Corresponds to original gets.a
    extractAtom(asString) {
        if (this.activeLineTokens === null || this.activeLineTokens.length === 0) {
            if (this.currentLinePosition >= this.sourceLines.length) {
                throw new Error("Input exhausted during atom extraction.");
            }
            this.activeLineTokens = this.sourceLines[this.currentLinePosition].split(" ").reverse();
        }

        const extractedToken = this.activeLineTokens.pop();
        if (this.activeLineTokens.length === 0) {
            this.currentLinePosition++;
        }
        return asString ? extractedToken : Number(extractedToken);
    }

    // Corresponds to original gets.l
    readFullLine(asStrings) {
        if (this.currentLinePosition >= this.sourceLines.length) {
            throw new Error("Input exhausted during full line read.");
        }
        this.activeLineTokens = null; // Discard any partial line state
        const lineContent = this.sourceLines[this.currentLinePosition].split(" ");
        this.currentLinePosition++;
        return asStrings ? lineContent : lineContent.map(Number);
    }

    // Corresponds to original gets.m
    readBlockOfLines(count, asStrings) {
        const collectedLines = Array.from({ length: count }, () => {
            if (this.currentLinePosition >= this.sourceLines.length) {
                throw new Error("Input exhausted during multi-line read.");
            }
            this.activeLineTokens = null; // Discard any partial line state
            const lineContent = this.sourceLines[this.currentLinePosition].split(" ");
            this.currentLinePosition++;
            return asStrings ? lineContent : lineContent.map(Number);
        });
        return collectedLines;
    }
}

class DisjointSetStructure {
    constructor(initialSize) {
        this.parentRegistry = Array.from({ length: initialSize + 1 }, (_, idx) => idx);
    }

    // Corresponds to original root
    findRepresentative(element) {
        if (this.parentRegistry[element] === element) {
            return element;
        }
        return this.parentRegistry[element] = this.findRepresentative(this.parentRegistry[element]);
    }

    // Corresponds to original same
    areInSameSet(elemA, elemB) {
        return this.findRepresentative(elemA) === this.findRepresentative(elemB);
    }

    // Corresponds to original unite
    mergeSets(elemA, elemB) {
        const rootA = this.findRepresentative(elemA);
        const rootB = this.findRepresentative(elemB);
        if (rootA !== rootB) {
            this.parentRegistry[rootA] = rootB;
        }
    }
}

const dataReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeSolution());

function executeSolution() {
    const nodeCount = dataReader.extractAtom(false);
    const mergeCount = dataReader.extractAtom(false);
    const targetPermutation = dataReader.readFullLine(false);

    const setManager = new DisjointSetStructure(nodeCount);

    Array.from({ length: mergeCount }).forEach(() => {
        const [firstNode, secondNode] = dataReader.readFullLine(false);
        setManager.mergeSets(firstNode, secondNode);
    });

    const matchingElements = Array.from({ length: nodeCount }, (_, index) => index + 1)
        .reduce((accumulator, currentElement) => {
            if (setManager.areInSameSet(targetPermutation[currentElement - 1], currentElement)) {
                return accumulator + 1;
            }
            return accumulator;
        }, 0);

    return matchingElements;
}
