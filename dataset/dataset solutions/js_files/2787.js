"use strict";
const main = input => {
    const n = parseInt(input[0], 10);
    let d = input[1].split(' ').map(p => Number(p));
    d = d.sort((p,q) => p-q);
    console.log(d[n/2]-d[n/2-1]);    
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
