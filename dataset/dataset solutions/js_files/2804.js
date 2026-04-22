"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const L = parseInt(arg[0].split(" ")[1]);
    
    let list = [];
    
    
    for(let i=0; i<N; i++) {
        let taste = (L + (parseInt(i) + 1)) - 1;

        list.push(taste);
    }
    
    let max = list.reduce((m,n)=>m+n);
    let min = Infinity;
    let target;
    
    for(let i=0; i<N; i++) {
        let temp = max - list[i];
        let abs  = Math.abs(max - temp);
        
        if(abs < min) {
            min = abs;
            target = i;
        }

    }
    list.splice(target, 1);
    
    console.log(list.reduce((m,n)=>m+n));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
