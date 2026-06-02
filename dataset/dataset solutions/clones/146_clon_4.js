const fs = require("fs");

const inputContent = fs.readFileSync("/dev/stdin", "utf8").trim();
const contentBlocks = inputContent.split('\n\n');

const decisionMatrix = [
    { sequence: "1111", designation: "C" },
    { sequence: "111", designation: "F" },
    { sequence: "1101", designation: "D" },
    { sequence: "101", designation: "B" },
    { sequence: "1000001", designation: "G" },
    { sequence: "10000001", designation: "A" }
];
const defaultDesignation = "E";

for (const currentBlock of contentBlocks) {
    const normalizedBlock = currentBlock.replace(/\s/g, '');

    let assignedDesignation = defaultDesignation;
    for (const ruleEntry of decisionMatrix) {
        if (normalizedBlock.includes(ruleEntry.sequence)) {
            assignedDesignation = ruleEntry.designation;
            break;
        }
    }
    console.log(assignedDesignation);
}
