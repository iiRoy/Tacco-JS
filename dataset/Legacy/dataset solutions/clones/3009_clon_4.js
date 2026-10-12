"use strict";
function ProcessInput(rawData) {
    let dataSrc = new DataFeeder(rawData);
    let countElements = dataSrc.fetchInteger();
    let elementValues = dataSrc.fetchIntegerArray(countElements);

    const computeGCD = (val1, val2) => {
        while (val2 !== 0) {
            const temp = val2;
            val2 = val1 % val2;
            val1 = temp;
        }
        return val1;
    };

    const leftAccumulations = [0, ...elementValues.map((_, i, arr) =>
        arr.slice(0, i + 1).reduce((acc, val) => computeGCD(acc, val), 0)
    )];
    leftAccumulations.push(leftAccumulations[countElements]);

    const rightAccumulations = [...elementValues.map((_, i, arr) =>
        arr.slice(i).reduce((acc, val) => computeGCD(acc, val), 0)
    ), 0];

    const exclusionGCDs = Array.from({ length: countElements }, (_, currentIdx) =>
        computeGCD(leftAccumulations[currentIdx], rightAccumulations[currentIdx + 1])
    );

    console.log(Math.max(...exclusionGCDs));
}

class DataFeeder {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') throw new Error('Argument (stdin) cannot be omitted!');
        this.idx = 0;
        this.tokens = sourceText.split(/\n|\s/);
    }

    fetchInteger() {
        return this.tokens[this.idx++] - 0;
    }

    fetchIntegerArray(size) {
        if (typeof size === 'undefined') throw new Error('Argument (1 or more) cannot be omitted!');
        let resultArr = new Array(size);
        for (let k = 0; k < size; k++) {
            resultArr[k] = this.fetchInteger();
        }
        return resultArr;
    }

    fetchString() {
        return this.tokens[this.idx++];
    }

    fetchStringArray(size) {
        if (typeof size === 'undefined') throw new Error('Argument (1 or more) cannot be omitted!');
        let resultArr = new Array(size);
        for (let k = 0; k < size; k++) {
            resultArr[k] = this.fetchString();
        }
        return resultArr;
    }
}

if (typeof window === "undefined") ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
