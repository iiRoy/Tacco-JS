"use strict";

let objectSpecifications;
let totalObjects;
let maximumLoad;
let valueStore = new Map();

function retrieveData(rawData) {
    const dataLines = rawData.split('\n').filter(Boolean);
    const headerParts = dataLines[0].split(' ');
    totalObjects = Number(headerParts[0]);
    maximumLoad = Number(headerParts[1]);

    objectSpecifications = [];
    for (let k = 1; k <= totalObjects; ++k) {
        const itemParts = dataLines[k].split(' ');
        objectSpecifications.push({ objectMass: Number(itemParts[0]), objectWorth: Number(itemParts[1]) });
    }
}

function fetchStoredValue(idx, cap) {
    if (valueStore.has(idx)) {
        return valueStore.get(idx).get(cap);
    }
    return undefined;
}

function setStoredValue(idx, cap, val) {
    if (!valueStore.has(idx)) {
        valueStore.set(idx, new Map());
    }
    valueStore.get(idx).set(cap, val);
}

function calculateMaxWorth(objectIndex, currentCapacity) {
    if (objectIndex < 0 || currentCapacity <= 0) {
        return 0;
    }

    let storedResult = fetchStoredValue(objectIndex, currentCapacity);
    if (storedResult !== undefined) {
        return storedResult;
    }

    const currentObject = objectSpecifications[objectIndex];
    const mass = currentObject.objectMass;
    const worth = currentObject.objectWorth;

    const worthWithoutCurrent = calculateMaxWorth(objectIndex - 1, currentCapacity);

    let worthWithCurrent = 0;
    if (mass <= currentCapacity) {
        worthWithCurrent = worth + calculateMaxWorth(objectIndex - 1, currentCapacity - mass);
    }

    const finalWorth = Math.max(worthWithoutCurrent, worthWithCurrent);

    setStoredValue(objectIndex, currentCapacity, finalWorth);
    return finalWorth;
}

function performCalculation(inputText) {
    retrieveData(inputText);

    const overallMaximumValue = calculateMaxWorth(totalObjects - 1, maximumLoad);

    console.log(overallMaximumValue);
}

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));