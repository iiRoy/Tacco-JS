'use strict';
function Main(input) {
    input = input.split("\n");
    const tmp = input[1];
    const question = input.slice(2);
    for (const q of question) {
        const qv = q.split(" ");
        let test = tmp.slice(qv[0]-1, qv[1]);
        console.log(test.split('AC').length - 1);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));