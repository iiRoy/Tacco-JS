function I(sourceText, valueParser) {
    this.lineBuffer = sourceText.split("\n");
    this.charCursor = 0;
    this.lineCursor = 0;
    this.parser = valueParser || Number;
}

I.prototype.a = function() {
    const currentLine = this.lineBuffer[this.lineCursor];
    if (!currentLine) return;

    const tokens = currentLine.trim().split(" ");
    const tokenValue = tokens[this.charCursor];
    this.charCursor++;

    if (tokens.length === this.charCursor) {
        this.charCursor = 0;
        this.lineCursor++;
    }
    return this.parser(tokenValue);
};

I.prototype.l = function() {
    const currentLine = this.lineBuffer[this.lineCursor];
    if (!currentLine) return;
    this.charCursor = 0;
    this.lineCursor++;
    return currentLine.split(" ").map(this.parser);
};

module.exports = I;

function main(inputContent) {
    const dataReader = new I(inputContent);

    const nodeQuantity = dataReader.a();
    const edgeQuantity = dataReader.a();

    const degreeRegistry = new Map();
    for (let nodeIdentifier = 1; nodeIdentifier <= nodeQuantity; nodeIdentifier++) {
        degreeRegistry.set(nodeIdentifier, 0);
    }

    for (let edgeIndex = 0; edgeIndex < edgeQuantity; edgeIndex++) {
        const firstVertex = dataReader.a();
        const secondVertex = dataReader.a();

        degreeRegistry.set(firstVertex, degreeRegistry.get(firstVertex) + 1);
        degreeRegistry.set(secondVertex, degreeRegistry.get(secondVertex) + 1);
    }

    let hasDegreeOfSix = false;
    let countOfDegreeFour = 0;
    let allDegreesAreEven = true;

    for (let nodeIdentifier = 1; nodeIdentifier <= nodeQuantity; nodeIdentifier++) {
        const currentVertexDegree = degreeRegistry.get(nodeIdentifier);

        if (currentVertexDegree === 6) {
            hasDegreeOfSix = true;
        }

        if (currentVertexDegree === 4) {
            countOfDegreeFour++;
        }

        if (currentVertexDegree % 2 !== 0) {
            allDegreesAreEven = false;
        }
    }

    const finalConditionMet = (hasDegreeOfSix || countOfDegreeFour >= 2) && allDegreesAreEven;
    console.log(finalConditionMet ? "Yes" : "No");
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
