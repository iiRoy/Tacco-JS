"use strict";

const processGraphData = (rawInputText) => {
    const connectionTuples = rawInputText.split('\n')
                                        .filter(Boolean)
                                        .map(line => line.split(/\s+/).map(Number));

    const frequencyRegistry = new Map();

    connectionTuples.forEach(pair => {
        pair.forEach(nodeIdentifier => {
            frequencyRegistry.set(nodeIdentifier, (frequencyRegistry.get(nodeIdentifier) || 0) + 1);
        });
    });

    let hasTripleConnection = false;
    for (const count of frequencyRegistry.values()) {
        if (count === 3) {
            hasTripleConnection = true;
            break;
        }
    }

    console.log(hasTripleConnection ? "NO" : "YES");
};

const dataSource = require("node:fs");
const inputPath = "/dev/stdin";
const encodingType = "utf8";

processGraphData(dataSource.readFileSync(inputPath, encodingType));