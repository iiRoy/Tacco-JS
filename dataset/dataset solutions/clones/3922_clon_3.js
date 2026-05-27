"use strict";
function ProcessQueries(rawData) {
    let inputReader = new DataParser(rawData);
    let queryCount = inputReader.getInt();
    const calculateResultForPair = (valA, valB) => {
        if (valA === valB) {
            return 2 * valA - 2;
        } else if (Math.abs(valA - valB) === 1) {
            let minimumValue = Math.min(valA, valB);
            return 2 * minimumValue - 2;
        } else {
            let productAB = valA * valB;
            let floorSqrtProduct = Math.floor(Math.sqrt(productAB));
            let isExactSquare = (floorSqrtProduct * floorSqrtProduct === productAB);
            if (isExactSquare) {
                floorSqrtProduct--;
            }
            let doubledFloorSqrt = 2 * floorSqrtProduct;
            return (floorSqrtProduct * (floorSqrtProduct + 1) >= productAB) ? (doubledFloorSqrt - 2) : (doubledFloorSqrt - 1);
        }
    };
    let currentQueryIndex = 0;
    while (currentQueryIndex < queryCount) {
        let valA = inputReader.getInt();
        let valB = inputReader.getInt();
        let queryResult = calculateResultForPair(valA, valB);
        console.log(queryResult);
        currentQueryIndex++;
    }
}
class DataParser {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('引数（stdin）を省略できません！');
        }
        this.currentIndex = 0;
        this.parsedTokens = String(sourceText).split(/[\n\s]+/);
    }
    getInt() {
        return Number(this.parsedTokens[this.currentIndex++]);
    }
    getIntArray(count) {
        if (typeof count === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.getInt();
        }
        return resultArray;
    }
    getStr() {
        return this.parsedTokens[this.currentIndex++];
    }
    getStrArray(count) {
        if (typeof count === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.getStr();
        }
        return resultArray;
    }
}
if (typeof window === "undefined") ProcessQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
