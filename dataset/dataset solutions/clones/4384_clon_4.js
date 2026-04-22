"use strict"

function processData(rawInputText) {
    const rawParts = rawInputText.split(/\s|\n/);
    const parsedNumbers = rawParts.filter(component => component !== '').map(Number);

    const relevantNumbers = parsedNumbers.slice(1);

    const expandedSet = relevantNumbers.flatMap(value => [value - 1, value, value + 1]);

    const frequencyMap = new Map();
    for (const item of expandedSet) {
        frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
    }

    let highestFrequency = 1;
    if (frequencyMap.size > 0) {
        highestFrequency = Math.max(...frequencyMap.values());
    }

    console.log(highestFrequency);
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
processData(fileContents);