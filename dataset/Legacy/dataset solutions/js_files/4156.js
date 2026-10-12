"use strict";
    
const main = arg => {
    const s = arg.split("\n")[0].split("").sort().join("");
    const t = arg.split("\n")[1].split("").sort().reverse().join("");
    
    console.log(s < t ? "Yes" : "No");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));