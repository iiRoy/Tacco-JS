"use strict"
function ProcessInput(inputData){
    inputData = inputData.trim().split("\n").reverse();
    let outputBuffer = [];

    function readNextLine(){ return inputData.pop(); }
    function readAndParseNumbers(){ return readNextLine().split(" ").map(n => parseInt(n)); }
    function appendToOutput(val){ outputBuffer.push(val); }
    function checkExistence(item, collection){ return new Set(collection).has(item); }
    function findMaximum(arr){ return arr.reduce(function(a,b){ return Math.max(a,b); }); }
    function findMinimum(arr){ return arr.reduce(function(a,b){ return Math.min(a,b); }); }
    function calculateSum(arr){ return arr.reduce(function(a,b){ return a+b; }); }
    function sortByIndex(arr, idx){ arr.sort((a, b) => a[idx] - b[idx]); }
    function checkAllTrue(arr){ return arr.reduce(function(a,b){ return a && b; }); }
    function checkAnyTrue(arr){ return arr.reduce(function(a,b){ return a || b; }); }
    function convertToList(iterable){ return Array.from(iterable); }
    function parseIntegers(iterable){ return Array.from(iterable, x => parseInt(x)); }
    function createFilledArray(value, length){ return Array(length).fill(value); }
    const generateRange = (start, stop, step) => Array.from(
        { length: (stop - start) / step }, (_, i) => start + (i * step));

    const getInitialNumberValue = () => parseInt(readNextLine());
    let currentNumber = getInitialNumberValue();

    const SPECIAL_RESULT_FOR_SMALL_INPUTS = 4;

    if (currentNumber === 1 || currentNumber === 2){
        appendToOutput(SPECIAL_RESULT_FOR_SMALL_INPUTS);
    } else {
        let stepCount = 2;

        const computeNextCollatzTerm = (num) => {
            if (num % 2 === 1) {
                let resultForOdd = (num * 3) + 1;
                return resultForOdd;
            } else {
                let resultForEven = num / 2;
                return resultForEven;
            }
        };

        while (currentNumber !== 1){
            currentNumber = computeNextCollatzTerm(currentNumber);
            stepCount++;
        }
        appendToOutput(stepCount);
    }

    outputBuffer = outputBuffer.join("\n");
    console.log(outputBuffer);
    return outputBuffer;
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
