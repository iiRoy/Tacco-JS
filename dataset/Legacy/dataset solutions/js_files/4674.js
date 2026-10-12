"use strict";
    
const main = arg => {
    const a = arg.split("\n")[0].split(" ")[0];
    const b = arg.split("\n")[0].split(" ")[1];
    
    if(a=="D") {
        console.log(b == "H" ? "D" : "H");   
    } else {
        console.log(b);
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));