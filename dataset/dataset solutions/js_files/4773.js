"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0].split(",");
    
    console.log(S.join(" "));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));