"use strict";
    
const main = arg => {
    const s = arg.split("\n")[0].split(" ")[1].split("")[0];
    
    console.log("A" + s + "C");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));