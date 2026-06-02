'use strict';

function countAC(fragment) {
    const separated = fragment.split('AC');
    const pieces = separated.length;
    return pieces - 1;
}

function Main(source) {
    const rows = source.split("\n");
    const tmp = rows[1];
    const question = rows.slice(2);

    for (const item of question) {
        const qv = item.split(" ");
        const left = qv[0] - 1;
        const right = qv[1];
        let test = tmp.slice(left, right);
        const answer = countAC(test);
        console.log(answer);
    }
}

const fs = require("fs");
const data = fs.readFileSync("/dev/stdin", "utf8");
Main(data);
