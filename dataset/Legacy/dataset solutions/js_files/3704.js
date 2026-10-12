"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const a = arg[1].split(" ").map(n=>parseInt(n));
    
    let list = [];
    
    for(let i in a) {
        let temp = a[i] - (parseInt(i) + 1);
        
        list.push(temp);
    }
    
    let set = new Set(list);
    
    console.log([...set].map(n=>Math.abs(n)).reduce((m,n)=>m+n));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));