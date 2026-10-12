"use strict";

const main = arg => {
    let N = arg.split("\n")[0];  
    let length = N.length;

    while(N.indexOf("01") !== -1) {
        N = N.split("01").join("");
    }
    
    while(N.indexOf("10") !== -1) {
        N = N.split("10").join("");
    }
 
    
    console.log(length - N.length);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));