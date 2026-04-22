"use strict";
    
const main = arg => {
    arg = arg.split("\n");
    const W = parseInt(arg[0].split(" ")[0]);
    const a = parseInt(arg[0].split(" ")[1]);
    const b = parseInt(arg[0].split(" ")[2]);
    
    if((a + W) > b || (b + W) > a) {
        console.log(0);
        return;
    }
    
    console.log(a < b ? b - (a + W) : a - (b + W));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));