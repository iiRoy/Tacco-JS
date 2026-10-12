"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    
    for(let h=1; h<=3500; h++) {
        for(let n=1; n<=3500; n++) {
            let w = (N * h * n) / (4 * h * n - N * n - N * h);
            
            if(w % 1 === 0) {
                console.log(h + " " + n + " " + w);
                return;
            }
        }
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));