"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = ~~arg[0].split(" ")[0];
    const Y = ~~arg[0].split(" ")[1];
    
    for(let i=0; i<=N; i++) {
        for(let j=0; j<=N; j++) {
            for(let k=0; k<=N; k++) {
                let price = (10000 * i) + (5000 * j) + (1000 * k);
                let bills = ~~i + ~~j + ~~k;
                
                if(Y === price && N === bills) {
                    console.log(`${i} ${j} ${k}`);
                    return;
                }
            }
        }
    }
    
    console.log("-1 -1 -1");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));