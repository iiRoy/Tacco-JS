'use strict';

const systemInteraction = require("fs");
const fetchContent = (resourcePath, format) => systemInteraction.readFileSync(resourcePath, format);
const fragmentContent = (content) => [...content];

const sourceMaterial = fetchContent("/dev/stdin", "utf8");
const constituentParts = fragmentContent(sourceMaterial);

const frequencyLedger = new Map();

for (const item of constituentParts) {
    frequencyLedger.set(item, (frequencyLedger.get(item) || 0) + 1);
}

let parityIssueDetected = false;
for (const currentCount of frequencyLedger.values()) {
    if (currentCount % 2 !== 0) {
        parityIssueDetected = true;
        break;
    }
}

const outcomeDesignation = parityIssueDetected ? "No" : "Yes";

console.log(outcomeDesignation);