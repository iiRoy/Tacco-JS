"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const D = parseInt(arg[0].split(" ")[0]);
    const T = parseInt(arg[0].split(" ")[1]);
    const S = parseInt(arg[0].split(" ")[2]);

    console.log(D / S <= T ? "Yes" : "No");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));