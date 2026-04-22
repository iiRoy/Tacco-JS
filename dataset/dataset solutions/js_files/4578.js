"use strict";
    
const main = arg => {
    const N = parseInt(arg.split("\n")[0].split(" ")[0]);
    const M = parseInt(arg.split("\n")[0].split(" ")[1]);
    
    const path = arg.split("\n").slice(1, M + 1);
    const merged = path.map(n=>n.split(" ").join("")).join("");

    for(let i=1; i<=N; i++) {
        console.log(merged.split("").filter(n=>n==i).length);
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));