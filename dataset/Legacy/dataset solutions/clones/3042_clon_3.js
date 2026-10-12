"use strict";
function processInputData(rawInputText) {
    let inputProcessor = new InputProcessor(rawInputText);
    let elementCount = inputProcessor.fetchInteger();
    let dataArray = inputProcessor.fetchIntegerArray(elementCount);

    const maxArraySize = 305;
    const modulusValue = 998244353;
    const MOD_INV_2 = 499122177; // Modular inverse of 2 modulo 998244353

    let prefixSums = new Array(maxArraySize);
    prefixSums[0] = 0;

    let dynamicProgTable1 = new Array(maxArraySize * maxArraySize).fill(0);
    let dynamicProgTable2 = new Array(maxArraySize * maxArraySize).fill(0);

    const modularAdd = (valA, valB) => {
        return (valA + valB) % modulusValue;
    };

    const floorDivideByTwo = (val) => {
        return Math.trunc(val / 2);
    };

    dataArray.sort((valA, valB) => valA - valB);
    dataArray.unshift(0); // Add a dummy element at index 0 for 1-based indexing

    for (let idx = 1; idx <= elementCount; ++idx) {
        prefixSums[idx] = prefixSums[idx - 1] + dataArray[idx];
    }

    dynamicProgTable1[0] = Math.pow(2, elementCount);
    dynamicProgTable2[0] = 1;

    for (let currentIdx = 1; currentIdx <= elementCount; ++currentIdx) {
        const currentElementValue = dataArray[currentIdx];
        for (let currentSumVal = prefixSums[currentIdx]; currentSumVal >= currentElementValue; --currentSumVal) {
            const prevSumVal = currentSumVal - currentElementValue;
            
            let termForDP1 = (MOD_INV_2 * dynamicProgTable1[prevSumVal]) % modulusValue;
            dynamicProgTable1[currentSumVal] = modularAdd(dynamicProgTable1[currentSumVal], termForDP1);
            
            dynamicProgTable2[currentSumVal] = modularAdd(dynamicProgTable2[currentSumVal], dynamicProgTable2[prevSumVal]);
        }
    }

    let finalResult = 0;
    const totalSum = prefixSums[elementCount];
    const halfTotalSum = floorDivideByTwo(totalSum);

    if (totalSum % 2 === 0) {
        finalResult += dynamicProgTable1[halfTotalSum] - dynamicProgTable2[halfTotalSum];
    }

    for (let iterSum = halfTotalSum + 1; iterSum <= totalSum; ++iterSum) {
        finalResult = modularAdd(finalResult, dynamicProgTable1[iterSum]);
    }

    finalResult *= 3;
    const threePowerN = Math.pow(3, elementCount);
    finalResult = (threePowerN - (finalResult % modulusValue) + modulusValue) % modulusValue;

    console.log(finalResult);
}

class InputProcessor {
    constructor(rawInputText) {
        this.readIndex = 0;
        this.tokenizedItems = rawInputText.split(/\n|\s/);
    }

    fetchInteger() {
        return this.tokenizedItems[this.readIndex++] - 0;
    }

    fetchIntegerArray(count) {
        let resultArray = new Array(count);
        for (let idx = 0; idx < count; ++idx) {
            resultArray[idx] = this.fetchInteger();
        }
        return resultArray;
    }

    fetchString() {
        return this.tokenizedItems[this.readIndex++];
    }

    fetchStringArray(count) {
        let resultArray = new Array(count);
        for (let idx = 0; idx < count; ++idx) {
            resultArray[idx] = this.fetchString();
        }
        return resultArray;
    }
}

if (typeof window === "undefined") {
    processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
