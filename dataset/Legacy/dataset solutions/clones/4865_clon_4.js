const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

class InputFlow {
    constructor(lines) {
        this.content = lines;
        this.currentPosition = 0;
    }

    retrieveNext() {
        if (!this.checkAvailability()) {
            throw new Error("Input exhausted: No further elements.");
        }
        return this.content[this.currentPosition++];
    }

    checkAvailability() {
        return this.currentPosition < this.content.length;
    }
}

const inputStream = new InputFlow(sourceData);

function obtainNext() {
    return inputStream.retrieveNext();
}

function checkNextExistence() {
    return inputStream.checkAvailability();
}

function displayOutput(data) {
    console.log(data);
}

function reportError(data) {
    console.error(data);
}

const dataConverters = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join(""),
};

function transformValue(item, conversionType) {
    try {
        const converter = dataConverters[conversionType];
        return converter ? converter(item) : item;
    } catch (e) {
        return item;
    }
}

function executeProcessing() {
    const dimensions = transformValue(obtainNext(), 4);
    const height = dimensions[0];
    const width = dimensions[1];

    const gridLayout = Array.from({ length: height }, () =>
        transformValue(obtainNext(), 6)
    );

    const hashCount = gridLayout.reduce((total, row) => {
        return total + row.filter(char => char === '#').length;
    }, 0);

    const requiredHashes = height + width - 1;
    if (hashCount === requiredHashes) {
        displayOutput("Possible");
    } else {
        displayOutput("Impossible");
    }
}

executeProcessing();
