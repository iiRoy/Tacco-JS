"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/),
    cid = 0;

function next(a) {
    return a ? cin[cid++] : +cin[cid++];
}

function nexts(n, a) {
    return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
}

function nextm(h, w, a) {
    var r = [],
        i = 0;
    if (a)
        for (; i < h; i++) r.push(cin.slice(cid, cid += w));
    else
        for (; i < h; i++) r.push(cin.slice(cid, cid += w).map(a => +a));
    return r;
}

function xArray(v) {
    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";
    while (--l) r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    return eval(r);
}
var mod = 1e9 + 7;

var myOut = main();
if (myOut !== undefined) console.log(myOut);

function main() {
    const elementCount = next();
    const initialData = Array.from({
        length: elementCount
    }, (_, originalIndex) => [next(), originalIndex]);

    const maxOverallValue = Array.from({
        length: elementCount - 1
    }, (_, k) => k + 1) // Generates split points from 1 to elementCount - 1
    .reduce((currentMax, splitPoint) => {
        const leftSlice = initialData.slice(0, splitPoint);
        const rightSlice = initialData.slice(splitPoint);

        leftSlice.sort((itemA, itemB) => itemA[0] - itemB[0]); // Sort ascending by value
        rightSlice.sort((itemA, itemB) => itemB[0] - itemA[0]); // Sort descending by value

        const rightPartitionEvaluation = rightSlice.reduce((accumulator, currentItem, currentIdx) => {
            if (!accumulator.validityFlag) {
                return {
                    totalValue: accumulator.totalValue,
                    validityFlag: false
                };
            }
            const displacement = currentItem[1] - currentIdx;
            return {
                totalValue: accumulator.totalValue + (displacement >= 0 ? displacement * currentItem[0] : 0),
                validityFlag: displacement >= 0
            };
        }, {
            totalValue: 0,
            validityFlag: true
        });

        if (!rightPartitionEvaluation.validityFlag) {
            return currentMax; // This split point is invalid, move to the next
        }

        const leftPartitionEvaluation = leftSlice.reduce((accumulator, currentItem, currentIdx) => {
            if (!accumulator.validityFlag) {
                return {
                    totalValue: accumulator.totalValue,
                    validityFlag: false
                };
            }
            const displacement = currentIdx + rightSlice.length - currentItem[1];
            return {
                totalValue: accumulator.totalValue + (displacement >= 0 ? displacement * currentItem[0] : 0),
                validityFlag: displacement >= 0
            };
        }, {
            totalValue: 0,
            validityFlag: true
        });

        if (leftPartitionEvaluation.validityFlag) {
            return Math.max(currentMax, rightPartitionEvaluation.totalValue + leftPartitionEvaluation.totalValue);
        } else {
            return currentMax;
        }
    }, 0); // Initial maxOverallValue is 0

    return maxOverallValue;
}
