"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0];
    const T = arg[1];
    
    const map1 = [...Array(26)].fill(0);
    const map2 = [...Array(26)].fill(0);
    
    for(let i=0; i<S.length; i++) {
        map1[S.charCodeAt(i) - 97]++;
        map2[T.charCodeAt(i) - 97]++;
    }
    
    map1.sort((a,b)=>a-b);
    map2.sort((a,b)=>a-b);
    
    if(map1.join("") === map2.join("")) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));