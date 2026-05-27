"use strict"
function ExecuteProgram(inputSource){
inputSource = inputSource.trim().split("\n").reverse();
let outputBuffer = [];
function obtainEntry(){return inputSource.pop()};
function processMappedEntry(){return obtainEntry().split(" ").map(n=>parseInt(n))};
function displayOutcome(x){outputBuffer.push(x)};
function checkPresence(x, xs){return new Set(xs).has(x)}
function findMaximum(x){return x.reduce(function(a,b){ return Math.max(a,b) }) }
function findMinimum(x){return x.reduce(function(a,b){ return Math.min(a,b) }) }
function aggregateValues(x){return x.reduce(function(a,b){ return a+b }) }
function arrangeElements(x, index){x.sort((a, b) => a[index] - b[index])}
function verifyAll(x){return x.reduce(function(a,b){ return a && b }) }
function confirmAny(x){return x.reduce(function(a,b){ return a || b }) }
function convertToList(iterable){return Array.from(iterable)}
function parseIntegers(iterable){return Array.from(iterable, x => parseInt(x))}
function replicateValue(val, len){return Array(len).fill(val)}
const generateSequence = (start, stop, step) => Array.from(
    { length: (stop - start) / step }, (_, i) => start + (i * step));

function determineCollatzPathLength(currentNumber, currentPathCount) {
    if (currentNumber === 1) {
        return currentPathCount;
    }
    if (currentNumber % 2 === 1) {
        return determineCollatzPathLength(3 * currentNumber + 1, currentPathCount + 1);
    } else {
        return determineCollatzPathLength(currentNumber / 2, currentPathCount + 1);
    }
}

let initialValue = parseInt(obtainEntry());
if (initialValue === 1 || initialValue === 2){
    displayOutcome(4);
}else{
    let totalSteps = determineCollatzPathLength(initialValue, 0);
    displayOutcome(2 + totalSteps);
}

outputBuffer = outputBuffer.join("\n");
console.log(outputBuffer);
return outputBuffer
}
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"))
