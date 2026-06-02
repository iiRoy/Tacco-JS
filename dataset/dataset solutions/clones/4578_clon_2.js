"use strict";
    
const solve = data => {
    const total = parseInt(data.split("\n")[0].split(" ")[0]);
    const amount = parseInt(data.split("\n")[0].split(" ")[1]);
    
    const routes = data.split("\n").slice(1, amount + 1);
    const joined = routes.map(x=>x.split(" ").join("")).join("");

    for(let idx=1; idx<=total; idx++) {
        console.log(joined.split("").filter(x=>x==idx).length);
    }
}
solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
