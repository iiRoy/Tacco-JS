"use strict";

const runProgram = source => {
    const lines = source.split("\n");
    const first = lines[0].split(" ");
    const total = parseInt(first[0]);
    const edges = parseInt(first[1]);

    const selected = lines.slice(1, edges + 1);
    let joinedPath = "";

    selected.forEach(item => {
        const compact = item.split(" ").join("");
        joinedPath = joinedPath + compact;
    });

    for (let current = 1; current <= total; current++) {
        const separated = joinedPath.split("");
        const answer = separated.filter(value => {
            return value == current;
        }).length;
        console.log(answer);
    }
};

runProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
