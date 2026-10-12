"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    
    const a = arg[1].split(" ").map(n=>parseInt(n));
    const list = [...Array(200000)].fill(0);
    
    for(let i in a) {
        list[a[i]]++;
    }
    
    list.sort((a,b)=>b-a);
    
    console.log(list.slice(K, list.length+1).reduce((m,n)=>m+n));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));