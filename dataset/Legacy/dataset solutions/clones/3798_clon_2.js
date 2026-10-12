"use strict";

function ProcessInput(rawData) {
    let dataParser = new DataProcessor(rawData);
    let numElements = dataParser.getNextInt(), elementArray = dataParser.getNextIntArray(numElements);
    const BIT_WIDTH = 20;
    const convertToBinary = (numericValue) => ('0'.repeat(BIT_WIDTH - 1) + numericValue.toString(2)).slice(-BIT_WIDTH);
    let prefixBitSums = new Array(numElements + 1).fill(0).map(() => new Array(BIT_WIDTH));
    prefixBitSums[0].fill(0);
    for (let currentIdx = 1; currentIdx <= numElements; currentIdx++) {
        let binaryRepresentation = convertToBinary(elementArray[currentIdx - 1]);
        for (let bitPosition = 0; bitPosition < BIT_WIDTH; bitPosition++) prefixBitSums[currentIdx][bitPosition] = prefixBitSums[currentIdx - 1][bitPosition] + (binaryRepresentation[bitPosition] - '0');
    }
    let finalCount = 0;
    for (let startIdx = 1; startIdx <= numElements; startIdx++) {
        let isValidSubarray = true;
        for (let endIdx = startIdx; endIdx <= numElements && isValidSubarray; endIdx++) {
            for (let bitPosition = 0; bitPosition < BIT_WIDTH && isValidSubarray; bitPosition++) {
                if (prefixBitSums[endIdx][bitPosition] - prefixBitSums[startIdx - 1][bitPosition] > 1) isValidSubarray = false;
            }
            if (isValidSubarray) finalCount++; else break;
        }
    }
    console.log(finalCount);
}
class DataProcessor{constructor(sourceContent){if(typeof sourceContent=='undefined')throw new Error('引数（stdin）を省略できません！');this.tokenIndex=0,this.tokenList=sourceContent.split(/\n|\s/)}getNextInt(){return this.tokenList[this.tokenIndex++]-0}getNextIntArray(size){if(typeof size=='undefined' || size < 1)throw new Error('引数（1以上）を省略できません！');let intArray=new Array(size);for(let i=0;i<size;i++)intArray[i]=this.getNextInt();return intArray}getNextString(){return this.tokenList[this.tokenIndex++]}getNextStringArray(size){if(typeof size=='undefined' || size < 1)throw new Error('引数（1以上）を省略できません！');let stringArray=new Array(size);for(let i=0;i<size;i++)stringArray[i]=this.getNextString();return stringArray}}
if (typeof globalThis.window == "undefined") ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
